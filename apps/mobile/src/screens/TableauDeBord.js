import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Circle, Marker } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';

import Header from '../components/Header';
import { COLORS } from '../constants/theme';
import { useAvailabilityStore } from '../store/useAvailabilityStore';
import { useMissionStore } from '../store/useMissionStore';
import { COMMON_STYLE_VALUES } from '../styles/commonStyles';
import { useMissionsPoller } from '../hooks/useMissionsPoller';
import { getDriverDashboard, updateDriverLocation } from '../../lib/driver-client';

const { width, height } = Dimensions.get('window');

const parseLocation = (locationObj, fallback) => {
  if (locationObj && typeof locationObj.latitude === 'number' && typeof locationObj.longitude === 'number') {
    return { latitude: locationObj.latitude, longitude: locationObj.longitude };
  }
  return fallback;
};

export default function DashboardScreen({ navigation }) {
  const isOnline = useAvailabilityStore((s) => s.isOnline);
  const setOnlineStatus = useAvailabilityStore((s) => s.setOnlineStatus);

  // Missions depuis le store Zustand (partagé avec MissionsScreen)
  const availableMissions = useMissionStore((s) => s.availableMissions);

  const [isLocating, setIsLocating] = useState(false);
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [todayTrips, setTodayTrips] = useState(0);
  const [currentPosition, setCurrentPosition] = useState({ latitude: 45.1885, longitude: 5.7245 });
  const [region, setRegion] = useState({
    latitude: 45.1885, longitude: 5.7245, latitudeDelta: 0.03, longitudeDelta: 0.03,
  });

  // Polling 10s — fetchAll=false : seulement les missions disponibles
  useMissionsPoller({ fetchAll: false });

  // Localisation au montage + maj dashboard
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      setIsLocating(true);
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          if (!isMounted) return;
          const coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
          setCurrentPosition(coords);
          setRegion({ ...coords, latitudeDelta: 0.02, longitudeDelta: 0.02 });
          // @ Dang on doit taffer sur ça avec @ousmane
          // Toujours envoyer la position — le backend en a besoin pour la query ST_DWithin.
          // Sans lastKnownLocation en base, aucune mission n'est retournée même si le livreur est en ligne.
          await updateDriverLocation(pos.coords.latitude, pos.coords.longitude).catch(() => {});
        }
      } catch {
        // Position non disponible, on garde le fallback
      } finally {
        if (isMounted) setIsLocating(false);
      }

      try {
        const dashboard = await getDriverDashboard();
        if (!isMounted) return;
        setOnlineStatus(Boolean(dashboard?.isOnline));
        setTodayEarnings(dashboard?.todayEarnings ?? 0);
        setTodayTrips(dashboard?.todayTrips ?? 0);
      } catch {
        // Dashboard non disponible
      }
    };

    init();
    return () => { isMounted = false; };
  }, []);

  const openMissionDetails = (mission) => {
    navigation.navigate('MissionDetails', { mission: { ...mission, currentPosition } });
  };

  return (
    <View style={styles.container}>
      <Header title="TABLEAU DE BORD" showAvailabilityToggle />

      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={region}
        showsUserLocation
        customMapStyle={mapStyle}
      >
        <Marker coordinate={currentPosition} title="Vous" pinColor={COLORS.secondary} />
        {isOnline && availableMissions.map((m) => (
          <Marker
            key={`pickup-${m.id}`}
            coordinate={parseLocation(m.pickup, currentPosition)}
            title={m.store}
            pinColor={COLORS.primary}
            onPress={() => openMissionDetails(m)}
          />
        ))}
        {isOnline && (
          <Circle center={currentPosition} radius={1000} fillColor="rgba(255,193,7,0.1)" strokeColor={COLORS.primary} />
        )}
      </MapView>

      <View style={styles.quickStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{todayEarnings.toFixed(2)} €</Text>
          <Text style={styles.statLabelMini}>Aujourd'hui</Text>
        </View>
        <View style={[styles.statItem, { borderLeftWidth: 1, borderColor: '#EEE' }]}>
          <Text style={styles.statValue}>{todayTrips}</Text>
          <Text style={styles.statLabelMini}>Courses</Text>
        </View>
      </View>

      <View style={styles.missionsOverlay}>
        <View style={styles.missionsHeader}>
          <Text style={styles.missionsTitle}>Missions proposées</Text>
          {isLocating && <Text style={styles.missionsSub}>Localisation...</Text>}
        </View>

        {isOnline ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.missionsScroll}>
            {availableMissions.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>Aucune mission à proximité</Text>
              </View>
            ) : (
              availableMissions.map((m) => (
                <TouchableOpacity key={m.id} style={styles.missionCard} activeOpacity={0.85} onPress={() => openMissionDetails(m)}>
                  <Text style={styles.missionStore} numberOfLines={1}>{m.store}</Text>
                  <Text style={styles.missionMeta}>{m.type} • {m.distance}</Text>
                  <Text style={styles.missionAddress} numberOfLines={1}>Pick-up: {m.storeAddress}</Text>
                  <Text style={styles.missionAddress} numberOfLines={1}>Destination: {m.customerArea}</Text>
                  <Text style={styles.missionReward}>+{m.reward} EUR</Text>
                  <Text style={styles.missionLink}>Voir détails</Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        ) : (
          <View style={styles.offlineMissionsBox}>
            <Text style={styles.offlineMissionsText}>Les missions proposées sont masquées hors ligne.</Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={[styles.recenterBtn, isOnline && styles.recenterBtnOnline]} onPress={() => {}}>
        <MaterialCommunityIcons name="crosshairs-gps" size={24} color={COLORS.secondary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { ...COMMON_STYLE_VALUES.flex1 },
  map: { width, height },
  quickStats: { position: 'absolute', top: 110, left: 20, right: 20, backgroundColor: COLORS.white, ...COMMON_STYLE_VALUES.rowCenter, padding: 15, borderRadius: 15, elevation: 5 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontWeight: '900', ...COMMON_STYLE_VALUES.textSecondary, fontSize: 16 },
  statLabelMini: { fontSize: 10, ...COMMON_STYLE_VALUES.textMuted, textTransform: 'uppercase' },
  missionsOverlay: { position: 'absolute', top: 184, left: 14, right: 0 },
  missionsHeader: { paddingHorizontal: 6, marginBottom: 8, ...COMMON_STYLE_VALUES.rowBetween },
  missionsTitle: { fontSize: 13, ...COMMON_STYLE_VALUES.textSecondary, fontWeight: '800' },
  missionsSub: { fontSize: 11, ...COMMON_STYLE_VALUES.textMuted, marginRight: 20 },
  offlineMissionsBox: { marginRight: 16, padding: 14, borderRadius: 14, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border },
  offlineMissionsText: { ...COMMON_STYLE_VALUES.textMuted, fontSize: 12, lineHeight: 17 },
  emptyCard: { paddingHorizontal: 14, paddingVertical: 10 },
  emptyText: { ...COMMON_STYLE_VALUES.textMuted, fontSize: 12 },
  missionsScroll: { paddingRight: 16, gap: 10 },
  missionCard: { width: 210, backgroundColor: COLORS.white, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, padding: 12, elevation: 5 },
  missionStore: { ...COMMON_STYLE_VALUES.textSecondary, fontWeight: '800', fontSize: 13 },
  missionMeta: { marginTop: 4, ...COMMON_STYLE_VALUES.textMuted, fontSize: 11 },
  missionAddress: { marginTop: 3, ...COMMON_STYLE_VALUES.textMuted, fontSize: 10 },
  missionReward: { marginTop: 8, color: COLORS.primary, fontSize: 14, fontWeight: '900' },
  missionLink: { marginTop: 8, ...COMMON_STYLE_VALUES.textSecondary, fontSize: 11, fontWeight: '700' },
  recenterBtn: { position: 'absolute', bottom: 130, right: 20, backgroundColor: COLORS.white, width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  recenterBtnOnline: { bottom: 40 },
});

const mapStyle = [
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'simplified' }] },
];
