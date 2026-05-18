import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View, TouchableOpacity, StyleSheet, AppState, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';

import { COLORS } from '../constants/theme';

import MissionsScreen from '../screens/MissionsScreen';
import WalletScreen from '../screens/WalletScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TableauDeBord from '../screens/TableauDeBord';
import { useMissionStore } from '../store/useMissionStore';
import { useAvailabilityStore } from '../store/useAvailabilityStore';
import {
  configureDriverPushNotifications,
  registerDriverPushToken,
  notifyNewMissions,
  setupNotificationTapHandler,
} from '../lib/push-notifications';
import { connectSocket, disconnectSocket } from '../services/socketService';
import { getAuthTokenStore } from '../../lib/auth-storage';
import { updateDriverLocation } from '../../lib/driver-client';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  const insets = useSafeAreaInsets();
  const androidInset = Platform.OS === 'android' ? insets.bottom : 0;
  const hasActiveMissions = useMissionStore((state) => state.missionQueue.length > 0);
  const fetchAvailableMissions = useMissionStore((s) => s.fetchAvailableMissions);
  const fetchAllMissions = useMissionStore((s) => s.fetchAllMissions);
  const setOnlineStatus = useAvailabilityStore((s) => s.setOnlineStatus);
  const isOnline = useAvailabilityStore((s) => s.isOnline);

  // ── Notifications push + token ──────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;
    let cleanupTapHandler = null;

    const setup = async () => {
      try {
        await configureDriverPushNotifications();
        if (!isMounted) return;
        await registerDriverPushToken();
        if (!isMounted) return;
        cleanupTapHandler = await setupNotificationTapHandler();
      } catch {
        // Non bloquant
      }
    };

    setup();
    useMissionStore.getState().initStore();

    return () => {
      isMounted = false;
      cleanupTapHandler?.();
    };
  }, []);

  // ── Connexion WebSocket ─────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    let offHandlers = null;

    getAuthTokenStore().getTokens().then((tokens) => {
      if (cancelled) return;
      if (!tokens?.accessToken) {
        console.warn('[MainTabs] aucun token disponible → socket non initialisé');
        return;
      }
      const socket = connectSocket(tokens.accessToken);

      // Nouvelle mission disponible → refresh le store + notif locale
      const handleNewOrder = async (payload) => {
        if (cancelled) return;
        try {
          const newMissions = await fetchAvailableMissions();
          ('[socket] fetchAvailableMissions →', newMissions?.length, 'nouvelles missions');
          const match = newMissions?.find((m) => m.id === payload.orderId);
          const toNotify = match ?? {
            id: payload.orderId,
            store: payload.pickup ?? payload.type ?? 'Nouvelle course',
            distance: `${payload.distanceKm ?? 0} km`,
            reward: String(payload.reward ?? 0),
          };
          await notifyNewMissions([toNotify]);
        } catch (err) {
          console.warn('[socket] handleNewOrder failed', err?.message ?? err);
        }
      };

      // Statut du livreur mis à jour côté serveur (ex: toggle disponibilité)
      const handleDriverStatus = ({ status }) => {
        if (cancelled) return;
        setOnlineStatus(status === 'AVAILABLE');
      };

      // Une mission a changé de statut côté backend (ex: commerçant a cliqué "Lancer la livraison")
      // → rafraîchir l'état des missions actives en temps réel
      const handleOrderStatus = async ({ orderId, status }) => {
        if (cancelled) return;
        try {
          console.log('[socket] order:status reçu →', orderId, status);
          await fetchAllMissions();
        } catch (err) {
          console.warn('[socket] handleOrderStatus failed', err?.message ?? err);
        }
      };

      // Rattrapage après reconnexion : les events émis pendant la coupure sont perdus
      socket.io.on('reconnect', async () => {
        if (cancelled) return;
        ('[socket] reconnecté → rattrapage des missions manquées');
        try {
          await fetchAllMissions();
        } catch {/* non bloquant */}
      });

      socket.on('order:new', handleNewOrder);
      socket.on('driver:status', handleDriverStatus);
      socket.on('order:status', handleOrderStatus);

      // Rattrapage quand l'app revient au premier plan (app en fond = socket coupé)
      const appStateSub = AppState.addEventListener('change', async (nextState) => {
        if (cancelled || nextState !== 'active') return;
        try {
          await fetchAllMissions();
        } catch {/* non bloquant */}
      });

      offHandlers = () => {
        socket.off('order:new', handleNewOrder);
        socket.off('driver:status', handleDriverStatus);
        socket.off('order:status', handleOrderStatus);
        appStateSub.remove();
      };

      // Sécurité : si le composant a déjà été démonté avant la résolution
      if (cancelled) {
        offHandlers();
        offHandlers = null;
      }
    });

    return () => {
      cancelled = true;
      offHandlers?.();
      disconnectSocket();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Suivi GPS hybride : mouvement (≥20m) OU heartbeat (2 min) ────────────────
  useEffect(() => {
    if (!isOnline) return;

    const HEARTBEAT_MS = 2 * 60 * 1000; // 2 minutes
    let cancelled = false;
    let locationSub = null;
    let lastCoords = null;

    const sendLocation = (coords) => {
      if (cancelled) return;
      lastCoords = coords;
      updateDriverLocation(coords.latitude, coords.longitude).catch((err) =>
        console.warn('[location] update failed', err?.message ?? err),
      );
    };

    // Position immédiate au passage en ligne
    Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
      .then(({ coords }) => sendLocation(coords))
      .catch(() => {});

    // Mise à jour sur mouvement ≥ 20 m
    Location.watchPositionAsync(
      { accuracy: Location.Accuracy.Balanced, distanceInterval: 20 },
      ({ coords }) => sendLocation(coords),
    ).then((sub) => {
      if (cancelled) sub.remove();
      else locationSub = sub;
    });

    // Heartbeat : renvoie la dernière position connue toutes les 2 min
    // même si le livreur est immobile, pour rester visible dans PostGIS
    const heartbeat = setInterval(() => {
      if (lastCoords) sendLocation(lastCoords);
    }, HEARTBEAT_MS);

    return () => {
      cancelled = true;
      locationSub?.remove();
      clearInterval(heartbeat);
    };
  }, [isOnline]);

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: COLORS.secondary,
          tabBarInactiveTintColor: COLORS.placeholder,
          tabBarStyle: {
            height: 85 + androidInset,
            paddingBottom: 12 + androidInset,
            paddingTop: 8,
            borderTopWidth: 0,
            backgroundColor: COLORS.white,
            elevation: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
          tabBarIcon: ({ focused, color }) => {
            let iconName;

            if (route.name === 'TableauDeBord') {
              iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
            } else if (route.name === 'Missions') {
              iconName = focused ? 'package-variant' : 'package-variant-closed';
            } else if (route.name === 'Portefeuille') {
              iconName = focused ? 'wallet' : 'wallet-outline';
            } else if (route.name === 'Profil') {
              iconName = focused ? 'account' : 'account-outline';
            }

            return <MaterialCommunityIcons name={iconName} size={28} color={color} />;
          },
        })}
      >
        <Tab.Screen
          name="TableauDeBord"
          component={TableauDeBord}
          options={{ tabBarLabel: 'Dashboard' }}
        />
        <Tab.Screen
          name="Missions"
          component={MissionsScreen}
          options={{ tabBarLabel: 'Missions' }}
        />
        <Tab.Screen
          name="Portefeuille"
          component={WalletScreen}
          options={{ tabBarLabel: 'Gains' }}
        />
        <Tab.Screen
          name="Profil"
          component={ProfileScreen}
          options={{ tabBarLabel: 'Profil' }}
        />
      </Tab.Navigator>

      {hasActiveMissions && (
        <FloatingMissionButton />
      )}
    </View>
  );
}

function FloatingMissionButton() {
  const navigation = useNavigation();
  const { bottom } = useSafeAreaInsets();
  const fabInset = Platform.OS === 'android' ? bottom : 0;

  const handleOpenMissionFocus = () => {
    const parent = navigation.getParent();
    if (parent) {
      parent.navigate('MissionFocus');
      return;
    }
    navigation.navigate('MissionFocus');
  };

  return (
    <TouchableOpacity
      style={[styles.missionFab, { bottom: 100 + fabInset }]}
      activeOpacity={0.85}
      onPress={handleOpenMissionFocus}
    >
      <MaterialCommunityIcons name="crosshairs-gps" size={28} color={COLORS.white} />
      <View style={styles.missionFabBadge} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  missionFab: {
    position: 'absolute',
    right: 20,
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  missionFabBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
    borderWidth: 1,
    borderColor: COLORS.white,
  },
});
