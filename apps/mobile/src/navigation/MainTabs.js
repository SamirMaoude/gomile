import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
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
  const hasActiveMissions = useMissionStore((state) => state.missionQueue.length > 0);
  const fetchAvailableMissions = useMissionStore((s) => s.fetchAvailableMissions);
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
      console.log('[MainTabs] token trouvé, connexion socket…');
      const socket = connectSocket(tokens.accessToken);

      // Nouvelle mission disponible → refresh le store + notif locale
      const handleNewOrder = async (payload) => {
        if (cancelled) return;
        try {
          const newMissions = await fetchAvailableMissions();
          // Utilise les données du store si la mission est déjà chargée,
          // sinon utilise le payload du socket pour la notification immédiate.
          const match = newMissions?.find((m) => m.id === payload.orderId);
          notifyNewMissions([
            match ?? {
              id: payload.orderId,
              store: payload.pickup ?? payload.type ?? 'Nouvelle course',
              distance: `${payload.distanceKm ?? 0} km`,
              reward: String(payload.reward ?? 0),
            },
          ]);
        } catch (err) {
          console.warn('[socket] handleNewOrder failed', err?.message ?? err);
        }
      };

      // Statut du livreur mis à jour côté serveur (ex: toggle disponibilité)
      const handleDriverStatus = ({ status }) => {
        if (cancelled) return;
        setOnlineStatus(status === 'AVAILABLE');
      };

      socket.on('order:new', handleNewOrder);
      socket.on('driver:status', handleDriverStatus);

      offHandlers = () => {
        socket.off('order:new', handleNewOrder);
        socket.off('driver:status', handleDriverStatus);
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

  // ── Suivi GPS en temps réel (uniquement quand en ligne) ────────────────────
  useEffect(() => {
    if (!isOnline) return;

    let cancelled = false;
    let locationSub = null;

    // Mise à jour immédiate au passage en ligne
    Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
      .then(({ coords }) => {
        if (!cancelled) updateDriverLocation(coords.latitude, coords.longitude).catch(() => {});
      })
      .catch(() => {});

    // Suivi continu : n'envoie une mise à jour que si le livreur a bougé de ≥ 50 m
    Location.watchPositionAsync(
      { accuracy: Location.Accuracy.Balanced, distanceInterval: 50 },
      ({ coords }) => {
        if (cancelled) return;
        updateDriverLocation(coords.latitude, coords.longitude).catch((err) =>
          console.warn('[location] update failed', err?.message ?? err),
        );
      },
    ).then((sub) => {
      if (cancelled) sub.remove();
      else locationSub = sub;
    });

    return () => {
      cancelled = true;
      locationSub?.remove();
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
            height: 85,
            paddingBottom: 12,
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
      style={styles.missionFab}
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
    bottom: 100,
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
