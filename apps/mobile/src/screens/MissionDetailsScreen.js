import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';

import Header from '../components/Header';
import GoMileButton from '../components/GoMileButton';
import { COLORS } from '../constants/theme';
import { COMMON_STYLE_VALUES } from '../styles/commonStyles';
import { useMissionStore } from '../store/useMissionStore';
import { formatDistanceKm, formatDurationMin, getDrivingRoute } from '../../lib/routing';
import { acceptMission as acceptMissionApi } from '../../lib/driver-client';

export default function MissionDetailsScreen({ route, navigation }) {
  const mission = route?.params?.mission;
  const acceptMission = useMissionStore((state) => state.acceptMission);
  const [currentPosition, setCurrentPosition] = useState(
    mission?.currentPosition || mission?.pickup || { latitude: 45.1885, longitude: 5.7245 }
  );
  const [routeCoords, setRouteCoords] = useState([]);
  const [routeDistance, setRouteDistance] = useState(mission?.distance || '--');
  const [routeEta, setRouteEta] = useState(mission?.eta || '--');

  if (!mission) {
    return (
      <View style={styles.container}>
        <Header title="DETAIL MISSION" showAvailabilityToggle />
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Mission introuvable.</Text>
          <GoMileButton title="RETOUR" onPress={() => navigation.goBack()} />
        </View>
      </View>
    );
  }

  useEffect(() => {
    let isMounted = true;

    const loadCurrentPosition = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (isMounted) {
          setCurrentPosition({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        }
      } catch (error) {
        // Fallback sur la position mock si la geolocalisation est indisponible
      }
    };

    loadCurrentPosition();

    return () => {
      isMounted = false;
    };
  }, []);

  const points = useMemo(
    () => [currentPosition, mission.pickup, mission.dropoff].filter(Boolean),
    [currentPosition, mission.pickup, mission.dropoff]
  );

  useEffect(() => {
    let isMounted = true;

    const loadRoute = async () => {
      try {
        const route = await getDrivingRoute(points);
        if (!route || !isMounted) return;
        setRouteCoords(route.coordinates || []);
        setRouteDistance(formatDistanceKm(route.distance));
        setRouteEta(formatDurationMin(route.duration));
      } catch (error) {
        if (!isMounted) return;
        setRouteCoords(points);
      }
    };

    if (points.length >= 2) {
      loadRoute();
    }

    return () => {
      isMounted = false;
    };
  }, [points]);

  const handleRefuse = () => {
    Alert.alert('Mission refusée', 'Cette mission a été retirée de ta liste.');
    navigation.goBack();
  };

  const handleAccept = () => {
    (async () => {
      try {
        await acceptMissionApi(mission.id);
        acceptMission({
          ...mission,
          currentPosition,
        });
        navigation.replace('MissionFocus');
      } catch (error) {
        Alert.alert('Erreur', error.message || 'Impossible d\'accepter la mission.');
      }
    })();
  };

  return (
    <View style={styles.container}>
      <Header title="DETAIL MISSION" showAvailabilityToggle />

      <MapView style={styles.map} initialRegion={mission.mapRegion}>
        <Marker coordinate={currentPosition} title="Vous" pinColor={COLORS.secondary} />
        <Marker coordinate={mission.pickup} title="Pick-up" description={mission.store} pinColor={COLORS.primary} />
        <Marker coordinate={mission.dropoff} title="Destination" description={mission.customerArea} pinColor="#E53935" />
        <Polyline coordinates={routeCoords.length > 1 ? routeCoords : points} strokeColor={COLORS.secondary} strokeWidth={4} />
      </MapView>

      <View style={styles.bottomSheet}>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.75}
        >
          <MaterialCommunityIcons name="close" size={20} color={COLORS.secondary} />
        </TouchableOpacity>

        <View style={styles.topRow}>
          <Text style={styles.storeName}>{mission.store}</Text>
          <Text style={styles.reward}>{mission.reward} EUR</Text>
        </View>

        <View style={styles.metaRow}>
          <InfoPill icon="package-variant-closed" text={mission.type} />
          <InfoPill icon="map-marker-distance" text={routeDistance} />
          <InfoPill icon="clock-outline" text={routeEta} />
        </View>

        <Text style={styles.sectionTitle}>Infos mission</Text>
        <Text style={styles.infoLine}>Pick-up: {mission.storeAddress}</Text>
        <Text style={styles.infoLine}>Destination: {mission.customerArea}</Text>
        <Text style={styles.infoLine}>Client: {mission.customerName}</Text>
        <Text style={styles.infoLine}>Notes: {mission.notes}</Text>

        <View style={styles.actionsRow}>
          <GoMileButton title="REFUSER" flex={1} style={styles.refuseBtn} onPress={handleRefuse} />
          <GoMileButton title="ACCEPTER" flex={1} style={styles.acceptBtn} onPress={handleAccept} />
        </View>
      </View>
    </View>
  );
}

function InfoPill({ icon, text }) {
  return (
    <View style={styles.pill}>
      <MaterialCommunityIcons name={icon} size={14} color={COLORS.secondary} />
      <Text style={styles.pillText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { ...COMMON_STYLE_VALUES.screenContainer },
  map: { ...COMMON_STYLE_VALUES.flex1 },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 44,
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    maxHeight: '58%',
  },
  closeBtn: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEF3F7',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  topRow: { ...COMMON_STYLE_VALUES.rowBetween },
  storeName: { ...COMMON_STYLE_VALUES.textSecondary, fontSize: 17, fontWeight: '900', flex: 1, marginRight: 8 },
  reward: { color: COLORS.primary, fontSize: 18, fontWeight: '900' },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, gap: 8 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF3F7',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  pillText: { marginLeft: 5, ...COMMON_STYLE_VALUES.textSecondary, fontSize: 12, fontWeight: '700' },
  sectionTitle: { marginTop: 12, marginBottom: 6, ...COMMON_STYLE_VALUES.textSecondary, fontWeight: '800' },
  infoLine: { ...COMMON_STYLE_VALUES.textMuted, fontSize: 12, marginTop: 2 },
  actionsRow: { flexDirection: 'row', gap: 8, marginTop: 14 },
  refuseBtn: { backgroundColor: '#D32F2F' },
  acceptBtn: { backgroundColor: '#2E7D32' },
  emptyState: { ...COMMON_STYLE_VALUES.flex1, justifyContent: 'center', padding: 20 },
  emptyText: { ...COMMON_STYLE_VALUES.textSecondary, marginBottom: 12, textAlign: 'center' },
});