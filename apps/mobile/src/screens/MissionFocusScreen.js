import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Dimensions, Keyboard } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';

import Header from '../components/Header';
import GoMileButton from '../components/GoMileButton';
import GoMileInput from '../components/GoMileInput';
import { COLORS } from '../constants/theme';
import { COMMON_STYLE_VALUES } from '../styles/commonStyles';
import { useMissionStore } from '../store/useMissionStore';
import { formatDistanceKm, formatDurationMin, getDrivingRoute } from '../../lib/routing';
import {
  verifyMerchantHandshake,
  verifyClientHandshake,
} from '../../lib/driver-client';

export default function MissionFocusScreen({ navigation }) {
  const activeMission = useMissionStore((state) => state.activeMission);
  const merchantVerified = useMissionStore((state) => state.merchantVerified);
  const clientVerified = useMissionStore((state) => state.clientVerified);
  const markMerchantVerified = useMissionStore((state) => state.markMerchantVerified);
  const markClientVerified = useMissionStore((state) => state.markClientVerified);
  const clearMission = useMissionStore((state) => state.clearMission);

  const [typedClientCode, setTypedClientCode] = useState('');
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const panelMaxHeight = Math.min(430, Dimensions.get('window').height * 0.58);
  const [currentPosition, setCurrentPosition] = useState(
    activeMission?.currentPosition || activeMission?.pickup || { latitude: 45.1885, longitude: 5.7245 }
  );
  const [routeCoords, setRouteCoords] = useState([]);
  const [routeDistance, setRouteDistance] = useState('--');
  const [routeEta, setRouteEta] = useState('--');
  const normalizedClientCode = typedClientCode.trim();
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  const points = useMemo(() => {
    if (!activeMission) return [];
    return [currentPosition, activeMission.pickup, activeMission.dropoff];
  }, [activeMission, currentPosition]);

  const nextTarget = useMemo(() => {
    if (!activeMission) return null;
    return merchantVerified ? activeMission.dropoff : activeMission.pickup;
  }, [activeMission, merchantVerified]);

  useEffect(() => {
    let isMounted = true;
    let timeoutId;

    const loadRoute = async () => {
      if (!nextTarget) return;
      const routeInput = [currentPosition, nextTarget];
      try {
        const route = await getDrivingRoute(routeInput);
        if (!route || !isMounted) return;
        setRouteCoords(route.coordinates || []);
        setRouteDistance(formatDistanceKm(route.distance));
        setRouteEta(formatDurationMin(route.duration));
      } catch (error) {
        if (!isMounted) return;
        setRouteCoords(routeInput);
      }
    };

    timeoutId = setTimeout(loadRoute, 500);

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [currentPosition, nextTarget]);

  useEffect(() => {
    let locationSubscription;

    const startLocationTracking = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;

        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 5000,
            distanceInterval: 10,
          },
          (position) => {
            setCurrentPosition({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          }
        );
      } catch (error) {
        // On conserve la position initiale mock si le GPS live n'est pas disponible
      }
    };

    if (activeMission) {
      startLocationTracking();
    }

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [activeMission]);

  useEffect(() => {
    const onKeyboardShow = (event) => {
      const keyboardHeight = event?.endCoordinates?.height || 0;
      setKeyboardOffset(Math.max(0, keyboardHeight - 12));
    };

    const onKeyboardHide = () => {
      setKeyboardOffset(0);
    };

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, onKeyboardShow);
    const hideSub = Keyboard.addListener(hideEvent, onKeyboardHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  if (!activeMission) {
    return (
      <View style={styles.container}>
        <Header title="MISSION FOCUS" showAvailabilityToggle />
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Aucune mission active</Text>
          <Text style={styles.emptyDesc}>Accepte une mission depuis l'ecran Missions pour activer le mode focus GPS.</Text>
          <GoMileButton title="RETOUR AUX MISSIONS" onPress={() => navigation.navigate('MainApp', { screen: 'Missions' })} />
        </View>
      </View>
    );
  }

  const handleValidateMerchant = () => {
    (async () => {
      try {
        const code = String(activeMission.merchantAuthCode || '').trim();
        await verifyMerchantHandshake(activeMission.id, code);
        markMerchantVerified();
        Alert.alert('Commercant verifie', 'Tu peux maintenant recuperer la commande.');
      } catch (error) {
        Alert.alert('Erreur', error.message || 'Verification commercant impossible.');
      }
    })();
  };

  const handleValidateClient = () => {
    if (normalizedClientCode.length < 4) {
      Alert.alert('Code invalide', 'Le code client ne correspond pas.');
      return;
    }

    (async () => {
      try {
        await verifyClientHandshake(activeMission.id, normalizedClientCode);
        markClientVerified();
        clearMission();
        Alert.alert('Mission terminee', 'Double handshake valide. Mission cloturee.');
        navigation.navigate('MainApp', { screen: 'Missions' });
      } catch (error) {
        Alert.alert('Erreur', error.message || 'Verification client impossible.');
      }
    })();
  };

  const handleClientCodeChange = (value) => {
    const digitsOnly = value.replace(/\D/g, '').slice(0, 4);
    setTypedClientCode(digitsOnly);
  };

  return (
    <View style={styles.container}>
      <Header title="MISSION FOCUS" showAvailabilityToggle />

      <MapView style={styles.map} initialRegion={activeMission.mapRegion}>
        <Marker coordinate={currentPosition} title="Vous" pinColor={COLORS.secondary} />
        <Marker coordinate={activeMission.pickup} title="Pick-up" pinColor={COLORS.primary} />
        <Marker coordinate={activeMission.dropoff} title="Destination" pinColor="#E53935" />
        <Polyline coordinates={routeCoords.length > 1 ? routeCoords : points} strokeColor={COLORS.secondary} strokeWidth={4} />
      </MapView>

      <View style={[styles.bottomPanel, { bottom: keyboardOffset }]}>
        <TouchableOpacity
          style={styles.panelHandle}
          activeOpacity={0.85}
          onPress={() => setIsPanelExpanded((prev) => !prev)}
        >
          <View style={styles.grabber} />
          <View style={styles.panelHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{activeMission.store}</Text>
              <Text style={styles.subTitle} numberOfLines={1}>{activeMission.customerArea}</Text>
            </View>
            <MaterialCommunityIcons
              name={isPanelExpanded ? 'chevron-down' : 'chevron-up'}
              size={24}
              color={COLORS.secondary}
            />
          </View>
        </TouchableOpacity>

        {isPanelExpanded && (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
          >
            <ScrollView
              style={[styles.panelContent, { maxHeight: panelMaxHeight }]}
              contentContainerStyle={styles.panelContentInner}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <GoMileButton
                title="RETOUR MISSIONS"
                outline
                style={styles.backToMissionsBtn}
                onPress={() => navigation.navigate('MainApp', { screen: 'Missions' })}
              />

              <View style={styles.codeBox}>
                <Text style={styles.codeLabel}>Code commercant (backend)</Text>
                <Text style={styles.codeValue}>{activeMission.merchantAuthCode}</Text>
                <Text style={styles.routeMeta}>Trajet estimé: {routeDistance} • {routeEta}</Text>
                <GoMileButton
                  title={merchantVerified ? 'IDENTIFICATION COMMERCANT OK' : 'VALIDER IDENTIFICATION COMMERCANT'}
                  onPress={handleValidateMerchant}
                  style={merchantVerified ? styles.doneBtn : undefined}
                />
              </View>

              <View style={[styles.codeBox, !merchantVerified && styles.disabledBox]}>
                <Text style={styles.codeLabel}>Code client</Text>
                <GoMileInput
                  placeholder="Saisir le code client"
                  value={typedClientCode}
                  onChangeText={handleClientCodeChange}
                  keyboardType="number-pad"
                  maxLength={4}
                  editable={merchantVerified && !clientVerified}
                />
                <GoMileButton
                  title={clientVerified ? 'LIVRAISON TERMINEE' : 'VALIDER ET TERMINER'}
                  onPress={handleValidateClient}
                  style={clientVerified ? styles.doneBtn : undefined}
                />
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { ...COMMON_STYLE_VALUES.screenContainer },
  map: { ...COMMON_STYLE_VALUES.flex1 },
  bottomPanel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
  },
  panelHandle: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  grabber: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D3DAE3',
    marginBottom: 8,
  },
  panelHeaderRow: {
    ...COMMON_STYLE_VALUES.rowCenter,
    gap: 8,
  },
  panelContent: {
    borderTopWidth: 1,
    borderTopColor: '#EEF1F5',
  },
  panelContentInner: {
    padding: 16,
    paddingBottom: 24,
  },
  title: { ...COMMON_STYLE_VALUES.textSecondary, fontWeight: '900', fontSize: 16 },
  subTitle: { marginTop: 4, ...COMMON_STYLE_VALUES.textMuted, fontSize: 12 },
  backToMissionsBtn: {
    minHeight: 38,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
  },
  codeBox: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#FCFCFC',
  },
  disabledBox: { opacity: 0.55 },
  codeLabel: { ...COMMON_STYLE_VALUES.textSecondary, fontWeight: '700', marginBottom: 8, fontSize: 12 },
  codeValue: {
    color: COLORS.primary,
    fontWeight: '900',
    fontSize: 24,
    letterSpacing: 1,
    marginBottom: 8,
    textAlign: 'center',
  },
  routeMeta: {
    textAlign: 'center',
    ...COMMON_STYLE_VALUES.textMuted,
    fontSize: 12,
    marginBottom: 10,
  },
  doneBtn: { backgroundColor: '#2E7D32' },
  emptyState: { ...COMMON_STYLE_VALUES.flex1, padding: 20, justifyContent: 'center' },
  emptyTitle: { ...COMMON_STYLE_VALUES.textSecondary, fontWeight: '800', fontSize: 18, textAlign: 'center' },
  emptyDesc: { ...COMMON_STYLE_VALUES.textMuted, textAlign: 'center', marginVertical: 12 },
});