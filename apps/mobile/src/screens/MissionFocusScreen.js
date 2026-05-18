import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, Alert, Platform,
  ScrollView, TouchableOpacity, Dimensions, Keyboard,
} from 'react-native';
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
import { useFocusEffect } from '@react-navigation/native';
import { getMissionPickupCode, verifyClientHandshake } from '../../lib/driver-client';

const DEFAULT_COORDS = { latitude: 45.1885, longitude: 5.7245 };

// ─── Sélecteur de mission ──────────────────────────────────────────────────────
function getStatusConfig(missionState = {}) {
  if (missionState.clientVerified)   return { label: 'LIVRÉ',     color: '#2E7D32' };
  if (missionState.merchantVerified) return { label: 'RÉCUPÉRÉ',  color: '#1565C0' };
  return                                    { label: 'EN ROUTE',  color: '#E65100' };
}

function MissionPicker({ missions, selectedId, missionStates, isOpen, onToggle, onSelect }) {
  const selectedIndex = missions.findIndex((m) => m.id === selectedId);
  const selected = missions[selectedIndex];
  const selectedStatus = getStatusConfig(missionStates[selectedId]);

  return (
    <View style={styles.picker}>
      <TouchableOpacity style={styles.pickerHeader} onPress={onToggle} activeOpacity={0.85}>
        <MaterialCommunityIcons name="swap-vertical" size={16} color={COLORS.secondary} />
        <Text style={styles.pickerHeaderText} numberOfLines={1}>
          {selectedIndex + 1}/{missions.length} — {selected?.store}
        </Text>
        <View style={[styles.statusChip, { backgroundColor: `${selectedStatus.color}1A` }]}>
          <Text style={[styles.statusChipText, { color: selectedStatus.color }]}>
            {selectedStatus.label}
          </Text>
        </View>
        <MaterialCommunityIcons
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={COLORS.secondary}
        />
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.pickerDropdown}>
          {missions.map((m) => {
            const isSelected = m.id === selectedId;
            const st = getStatusConfig(missionStates[m.id]);
            return (
              <TouchableOpacity
                key={m.id}
                style={[styles.pickerItem, isSelected && styles.pickerItemActive]}
                onPress={() => onSelect(m.id)}
                activeOpacity={0.75}
              >
                <View style={[styles.pickerDot, { backgroundColor: isSelected ? COLORS.primary : '#B0BEC5' }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.pickerItemStore, isSelected && styles.pickerItemStoreActive]}>
                    {m.store}
                  </Text>
                  <Text style={styles.pickerItemAddr} numberOfLines={1}>{m.storeAddress}</Text>
                </View>
                <View style={[styles.statusChip, { backgroundColor: `${st.color}1A` }]}>
                  <Text style={[styles.statusChipText, { color: st.color }]}>{st.label}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

// ─── Écran principal ───────────────────────────────────────────────────────────
export default function MissionFocusScreen({ navigation, route }) {
  const missionQueue      = useMissionStore((s) => s.missionQueue);
  const focusedMissionId  = useMissionStore((s) => s.focusedMissionId);
  const missionStates     = useMissionStore((s) => s.missionStates);
  const setFocusedMission = useMissionStore((s) => s.setFocusedMission);
  const markMerchantVerified = useMissionStore((s) => s.markMerchantVerified);
  const markClientVerified   = useMissionStore((s) => s.markClientVerified);
  const clearMission         = useMissionStore((s) => s.clearMission);

  const activeMission = missionQueue.find((m) => m.id === focusedMissionId) ?? null;
  const { merchantVerified = false, clientVerified = false } =
    missionStates[focusedMissionId] ?? {};

  const [typedClientCode, setTypedClientCode] = useState('');
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const [isPickerOpen,    setIsPickerOpen]    = useState(false);
  const panelMaxHeight = Math.min(430, Dimensions.get('window').height * 0.58);

  const [currentPosition, setCurrentPosition] = useState(
    missionQueue[0]?.pickup ?? DEFAULT_COORDS
  );
  const [routeCoords,   setRouteCoords]   = useState([]);
  const [routeDistance, setRouteDistance] = useState('--');
  const [routeEta,      setRouteEta]      = useState('--');
  const [merchantCode,  setMerchantCode]  = useState(route?.params?.pickupCode?.trim?.() ?? '');
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const normalizedClientCode = typedClientCode.trim();

  // ── Cible courante selon l'étape de livraison ───────────────────────────────
  const nextTarget = useMemo(() => {
    if (!activeMission) return null;
    return merchantVerified ? activeMission.dropoff : activeMission.pickup;
  }, [activeMission, merchantVerified]);

  const points = useMemo(() => {
    if (!activeMission || !nextTarget) return [];
    return [currentPosition, nextTarget].filter(Boolean);
  }, [activeMission, currentPosition, nextTarget]);

  // ── Réinitialise la saisie quand on change de mission ──────────────────────
  useEffect(() => {
    setTypedClientCode('');
    setIsPickerOpen(false);
  }, [focusedMissionId]);

  useEffect(() => {
    const pickupCode = route?.params?.pickupCode?.trim?.();
    if (pickupCode) {
      setMerchantCode(pickupCode);
    }
  }, [route?.params?.pickupCode]);

  useEffect(() => {
    if (merchantCode) {
      setIsPanelExpanded(true);
    }
  }, [merchantCode]);

  // ── Chargement du code commerçant (rechargé à chaque fois que l'écran prend le focus) ──
  useFocusEffect(
    useCallback(() => {
      const routePickup = route?.params?.pickupCode?.trim?.();
      // utilise activeMission.id si disponible, sinon tente d'obtenir l'ID depuis le store
      const missionId = activeMission?.id || useMissionStore.getState().focusedMissionId;

      if (!missionId) {
        // si la navigation a fourni un pickupCode, on le conserve; sinon on ne force rien
        if (routePickup) return;
        setMerchantCode((prev) => prev || '');
        return;
      }

      let isMounted = true;
      getMissionPickupCode(missionId)
        .then((data) => {
          if (!isMounted) return;
          const fetched = String(data?.pickupCode || data?.code || '').trim();
          if (fetched) setMerchantCode(fetched);
        })
        .catch(() => { /* ne pas écraser merchantCode en cas d'erreur */ });
      return () => { isMounted = false; };
    }, [activeMission?.id])
  );

  // ── Calcul de route ─────────────────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;
    const tid = setTimeout(async () => {
      if (!nextTarget) return;
      try {
        const route = await getDrivingRoute([currentPosition, nextTarget]);
        if (!route || !isMounted) return;
        setRouteCoords(route.coordinates || []);
        setRouteDistance(formatDistanceKm(route.distance));
        setRouteEta(formatDurationMin(route.duration));
      } catch {
        if (isMounted) setRouteCoords([currentPosition, nextTarget]);
      }
    }, 500);
    return () => { isMounted = false; clearTimeout(tid); };
  }, [currentPosition, nextTarget]);

  // ── Suivi GPS (indépendant de la mission focalisée) ─────────────────────────
  useEffect(() => {
    if (missionQueue.length === 0) return;
    let sub;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, timeInterval: 5000, distanceInterval: 10 },
        (pos) => setCurrentPosition({ latitude: pos.coords.latitude, longitude: pos.coords.longitude })
      );
    })();
    return () => sub?.remove();
  }, []); // lancé une seule fois à l'ouverture de l'écran

  // ── Clavier ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const show = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hide = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(show, (e) =>
      setKeyboardOffset(Math.max(0, (e.endCoordinates?.height || 0) - 12))
    );
    const hideSub = Keyboard.addListener(hide, () => setKeyboardOffset(0));
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  // ── Écran vide ──────────────────────────────────────────────────────────────
  if (missionQueue.length === 0) {
    return (
      <View style={styles.container}>
        <Header title="MISSION FOCUS" showAvailabilityToggle />
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Aucune mission active</Text>
          <Text style={styles.emptyDesc}>
            Accepte une mission depuis l'écran Missions pour activer le mode focus GPS.
          </Text>
          <GoMileButton
            title="RETOUR AUX MISSIONS"
            onPress={() => navigation.navigate('MainApp', { screen: 'Missions' })}
          />
        </View>
      </View>
    );
  }

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleValidateMerchant = () => {
    markMerchantVerified(focusedMissionId);
  };

  const handleValidateClient = () => {
    if (normalizedClientCode.length < 6) {
      Alert.alert('Code invalide', 'Le code client est incomplet.');
      return;
    }
    (async () => {
      try {
        await verifyClientHandshake(focusedMissionId, normalizedClientCode);
        markClientVerified(focusedMissionId);
        clearMission(focusedMissionId);
        const remaining = useMissionStore.getState().missionQueue;
        Alert.alert('Mission terminée', 'Livraison confirmée !', [{
          text: 'OK',
          onPress: () => {
            if (remaining.length === 0) navigation.navigate('MainApp', { screen: 'Missions' });
          },
        }]);
      } catch (error) {
        Alert.alert('Erreur', error.message || 'Vérification client impossible.');
      }
    })();
  };

  const handleClientCodeChange = (value) => {
    setTypedClientCode(value.replace(/\D/g, '').slice(0, 6));
  };

  const mapRegion = activeMission?.mapRegion ?? {
    ...currentPosition,
    latitudeDelta: 0.03,
    longitudeDelta: 0.03,
  };

  // ── Rendu ────────────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <Header title="MISSION FOCUS" showAvailabilityToggle />

      <MapView style={styles.map} initialRegion={mapRegion}>
        <Marker coordinate={currentPosition} title="Vous" pinColor={COLORS.secondary} />

        {missionQueue.map((m) => {
          const isFocused = m.id === focusedMissionId;
          return (
            <React.Fragment key={m.id}>
              <Marker
                coordinate={m.pickup}
                title={`Pick-up : ${m.store}`}
                pinColor={isFocused ? COLORS.primary : '#90A4AE'}
              />
              <Marker
                coordinate={m.dropoff}
                title={`Livraison : ${m.customerArea}`}
                pinColor={isFocused ? '#E53935' : '#EF9A9A'}
              />
            </React.Fragment>
          );
        })}

        <Polyline
          coordinates={routeCoords.length > 1 ? routeCoords : points}
          strokeColor={COLORS.secondary}
          strokeWidth={4}
        />
      </MapView>

      <View style={[styles.bottomPanel, { bottom: keyboardOffset }]}>
        {/* Sélecteur de mission — visible uniquement si plusieurs missions */}
        {missionQueue.length > 1 && (
          <MissionPicker
            missions={missionQueue}
            selectedId={focusedMissionId}
            missionStates={missionStates}
            isOpen={isPickerOpen}
            onToggle={() => setIsPickerOpen((p) => !p)}
            onSelect={(id) => { setFocusedMission(id); setIsPickerOpen(false); }}
          />
        )}

        {/* Handle du panneau */}
        <TouchableOpacity
          style={styles.panelHandle}
          activeOpacity={0.85}
          onPress={() => setIsPanelExpanded((p) => !p)}
        >
          <View style={styles.grabber} />
          <View style={styles.panelHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{activeMission?.store}</Text>
              <Text style={styles.subTitle} numberOfLines={1}>{activeMission?.customerArea}</Text>
            </View>
            <MaterialCommunityIcons
              name={isPanelExpanded ? 'chevron-down' : 'chevron-up'}
              size={24}
              color={COLORS.secondary}
            />
          </View>
        </TouchableOpacity>

        {isPanelExpanded && (
          <ScrollView
            style={[styles.panelContent, { maxHeight: panelMaxHeight }]}
            contentContainerStyle={styles.panelContentInner}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <GoMileButton
              title="RETOUR MISSIONS"
              outline
              style={styles.backBtn}
              onPress={() => navigation.navigate('MainApp', { screen: 'Missions' })}
            />

            {/* Code commerçant */}
            <View style={styles.codeBox}>
              <Text style={styles.codeLabel}>Code commerçant</Text>
              <Text style={styles.codeValue}>{merchantCode || '----'}</Text>
              <Text style={styles.routeMeta}>Trajet estimé : {routeDistance} • {routeEta}</Text>
              <GoMileButton
                title={merchantVerified ? 'IDENTIFICATION COMMERÇANT OK' : 'VALIDER IDENTIFICATION COMMERÇANT'}
                onPress={handleValidateMerchant}
                style={merchantVerified ? styles.doneBtn : undefined}
              />
            </View>

            {/* Code client */}
            <View style={[styles.codeBox, !merchantVerified && styles.disabledBox]}>
              <Text style={styles.codeLabel}>Code client</Text>
              <GoMileInput
                placeholder="Saisir le code client"
                value={typedClientCode}
                onChangeText={handleClientCodeChange}
                keyboardType="number-pad"
                maxLength={6}
                editable={merchantVerified && !clientVerified}
              />
              <GoMileButton
                title={clientVerified ? 'LIVRAISON TERMINÉE' : 'VALIDER ET TERMINER'}
                onPress={handleValidateClient}
                style={clientVerified ? styles.doneBtn : undefined}
              />
            </View>
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { ...COMMON_STYLE_VALUES.screenContainer },
  map: { ...COMMON_STYLE_VALUES.flex1 },

  // ── Panneau bas ──────────────────────────────────────────────────────────────
  bottomPanel: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    elevation: 12,
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: -2 },
  },
  panelHandle: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  grabber: {
    alignSelf: 'center', width: 44, height: 5, borderRadius: 3,
    backgroundColor: '#D3DAE3', marginBottom: 8,
  },
  panelHeaderRow: { ...COMMON_STYLE_VALUES.rowCenter, gap: 8 },
  panelContent: { borderTopWidth: 1, borderTopColor: '#EEF1F5' },
  panelContentInner: { padding: 16, paddingBottom: 24 },

  // ── Textes panneau ────────────────────────────────────────────────────────────
  title:   { ...COMMON_STYLE_VALUES.textSecondary, fontWeight: '900', fontSize: 16 },
  subTitle: { marginTop: 4, ...COMMON_STYLE_VALUES.textMuted, fontSize: 12 },

  // ── Boutons & boîtes ──────────────────────────────────────────────────────────
  backBtn: { minHeight: 38, paddingHorizontal: 10, paddingVertical: 8, marginBottom: 8 },
  codeBox: {
    marginTop: 12, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 12, padding: 12, backgroundColor: '#FCFCFC',
  },
  disabledBox: { opacity: 0.55 },
  codeLabel: { ...COMMON_STYLE_VALUES.textSecondary, fontWeight: '700', marginBottom: 8, fontSize: 12 },
  codeValue: {
    color: COLORS.primary, fontWeight: '900', fontSize: 24,
    letterSpacing: 1, marginBottom: 8, textAlign: 'center',
  },
  routeMeta: { textAlign: 'center', ...COMMON_STYLE_VALUES.textMuted, fontSize: 12, marginBottom: 10 },
  doneBtn: { backgroundColor: '#2E7D32' },

  // ── Sélecteur de mission ──────────────────────────────────────────────────────
  picker: { borderBottomWidth: 1, borderBottomColor: '#EEF1F5' },
  pickerHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10, gap: 8,
  },
  pickerHeaderText: { flex: 1, color: COLORS.secondary, fontWeight: '700', fontSize: 13 },
  pickerDropdown: { backgroundColor: '#F8F9FB', borderTopWidth: 1, borderTopColor: '#EEF1F5' },
  pickerItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, gap: 10,
    borderBottomWidth: 1, borderBottomColor: '#EEF1F5',
  },
  pickerItemActive: { backgroundColor: '#EBF0FF' },
  pickerDot: { width: 8, height: 8, borderRadius: 4 },
  pickerItemStore: { color: COLORS.secondary, fontWeight: '600', fontSize: 13 },
  pickerItemStoreActive: { fontWeight: '800', color: COLORS.primary },
  pickerItemAddr: { color: COLORS.placeholder, fontSize: 11, marginTop: 2 },

  // ── Badge statut ──────────────────────────────────────────────────────────────
  statusChip: { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3 },
  statusChipText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.4 },

  // ── État vide ─────────────────────────────────────────────────────────────────
  emptyState: { ...COMMON_STYLE_VALUES.flex1, padding: 20, justifyContent: 'center' },
  emptyTitle: { ...COMMON_STYLE_VALUES.textSecondary, fontWeight: '800', fontSize: 18, textAlign: 'center' },
  emptyDesc:  { ...COMMON_STYLE_VALUES.textMuted, textAlign: 'center', marginVertical: 12 },
});
