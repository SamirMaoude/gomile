import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Circle, Marker } from 'react-native-maps'; // Nécessite l'install de react-native-maps
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';

//  composants
import Header from '../components/Header';
import { COLORS } from '../constants/theme';
import { useAvailabilityStore } from '../store/useAvailabilityStore';
import { COMMON_STYLE_VALUES } from '../styles/commonStyles';
import {
  getDriverDashboard,
  getAvailableMissions,
  updateDriverLocation,
} from '../../lib/driver-client';

const { width, height } = Dimensions.get('window');

export default function DashboardScreen({ navigation }) {
  const isOnline = useAvailabilityStore((state) => state.isOnline);
  const [isLocating, setIsLocating] = useState(false);
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [todayTrips, setTodayTrips] = useState(0);
  const [proposedMissions, setProposedMissions] = useState([]);
  
  // Position par défaut: Grenoble centre, remplacée par la position réelle dès disponibilité.
  const [region, setRegion] = useState({
    latitude: 45.1885,
    longitude: 5.7245,
    latitudeDelta: 0.03,
    longitudeDelta: 0.03,
  });

  const [currentPosition, setCurrentPosition] = useState({
    latitude: 45.1885,
    longitude: 5.7245,
  });

  useEffect(() => {
    let isMounted = true;

    const loadPosition = async () => {
      try {
        setIsLocating(true);
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (!isMounted) return;

        const nextRegion = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        };

        setCurrentPosition({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setRegion(nextRegion);
        await updateDriverLocation(position.coords.latitude, position.coords.longitude);
      } catch (error) {
        // On garde la position par défaut si la géoloc échoue.
      } finally {
        if (isMounted) setIsLocating(false);
      }
    };

    loadPosition();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      try {
        const [dashboard, missions] = await Promise.all([
          getDriverDashboard(),
          getAvailableMissions(),
        ]);

        if (!isMounted) return;

        setTodayEarnings(dashboard?.todayEarnings || 0);
        setTodayTrips(dashboard?.todayTrips || 0);

        const mappedMissions = (missions || []).map((mission) => ({
          id: mission.id,
          type: mission.type || 'Mission',
          store: mission.store || 'Commerce partenaire',
          storeAddress: mission.pickupAddress || 'Adresse pick-up indisponible',
          customerArea: mission.dropOffAddress || 'Adresse livraison indisponible',
          customerName: 'Client GoMile',
          reward: String(mission.reward ?? 0),
          distance: `${mission.distanceKm ?? 0} km`,
          eta: '--',
          notes: 'Suivre les instructions de livraison.',
          mapRegion: {
            latitude: currentPosition.latitude,
            longitude: currentPosition.longitude,
            latitudeDelta: 0.03,
            longitudeDelta: 0.03,
          },
          pickup: { ...currentPosition },
          dropoff: { ...currentPosition },
        }));
        setProposedMissions(mappedMissions);
      } catch {
        if (!isMounted) return;
        setProposedMissions([]);
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [currentPosition]);

  const openMissionDetails = (mission) => {
    navigation.navigate('MissionDetails', {
      mission: {
        ...mission,
        currentPosition,
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* Header avec bouton toggle intégré ou au-dessus */}
      <Header title="TABLEAU DE BORD" showAvailabilityToggle />

      {/* CARTE TEMPS RÉEL */}
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={region}
        showsUserLocation
        customMapStyle={mapStyle} // Style  pour la lisibilité
      >
        <Marker
          coordinate={currentPosition}
          title="Vous"
          description="Votre position actuelle"
          pinColor={COLORS.secondary}
        />

        {proposedMissions.map((mission) => (
          <Marker
            key={`pickup-${mission.id}`}
            coordinate={mission.pickup}
            title={mission.store}
            description={`Pickup • ${mission.type} • +${mission.reward} EUR`}
            pinColor={COLORS.primary}
            onPress={() => openMissionDetails(mission)}
          />
        ))}

        {isOnline && (
          <Circle
            center={currentPosition}
            radius={1000}
            fillColor="rgba(255, 193, 7, 0.1)"
            strokeColor={COLORS.primary}
          />
        )}
      </MapView>

      {/* OVERLAY : visible uniquement hors ligne */}
      {!isOnline && (
        <View style={styles.statusOverlay}>
          <View style={[styles.statusCard, styles.cardOffline]}>
            <View>
              <Text style={styles.statusLabel}>Vous êtes HORS LIGNE</Text>
              <Text style={styles.statusSub}>Passez en ligne pour livrer</Text>
            </View>
            <MaterialCommunityIcons
              name="toggle-switch-off-outline"
              size={34}
              color={COLORS.placeholder}
            />
          </View>
        </View>
      )}

      {/* STATS RAPIDES (FLOTTANTES EN HAUT) */}
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

      {/* MISSIONS PROPOSÉES */}
      <View style={styles.missionsOverlay}>
        <View style={styles.missionsHeader}>
          <Text style={styles.missionsTitle}>Missions proposées</Text>
          {isLocating && <Text style={styles.missionsSub}>Localisation...</Text>}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.missionsScroll}>
          {proposedMissions.map((mission) => (
            <TouchableOpacity
              key={mission.id}
              style={styles.missionCard}
              activeOpacity={0.85}
              onPress={() => openMissionDetails(mission)}
            >
              <Text style={styles.missionStore} numberOfLines={1}>{mission.store}</Text>
              <Text style={styles.missionMeta}>{mission.type} • {mission.distance}</Text>
              <Text style={styles.missionReward}>+{mission.reward} EUR</Text>
              <Text style={styles.missionLink}>Voir détails</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* BOUTON RECENTRER (FAB ROND) */}
      <TouchableOpacity style={[styles.recenterBtn, isOnline && styles.recenterBtnOnline]} onPress={() => {}}>
        <MaterialCommunityIcons name="crosshairs-gps" size={24} color={COLORS.secondary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { ...COMMON_STYLE_VALUES.flex1 },
  map: { width: width, height: height },

  // Overlay du statut (Bas de l'écran)
  statusOverlay: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
  },
  statusCard: {
    ...COMMON_STYLE_VALUES.rowBetween,
    padding: 20,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  cardOffline: { borderTopWidth: 4, borderTopColor: COLORS.placeholder },
  
  statusLabel: { fontWeight: '900', fontSize: 16, ...COMMON_STYLE_VALUES.textSecondary },
  statusSub: { fontSize: 12, ...COMMON_STYLE_VALUES.textMuted, marginTop: 2 },

  // Stats rapides (Haut de l'écran sous le header)
  quickStats: {
    position: 'absolute',
    top: 110,
    left: 20,
    right: 20,
    backgroundColor: COLORS.white,
    ...COMMON_STYLE_VALUES.rowCenter,
    padding: 15,
    borderRadius: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontWeight: '900', ...COMMON_STYLE_VALUES.textSecondary, fontSize: 16 },
  statLabelMini: { fontSize: 10, ...COMMON_STYLE_VALUES.textMuted, textTransform: 'uppercase' },

  missionsOverlay: {
    position: 'absolute',
    top: 184,
    left: 14,
    right: 0,
  },
  missionsHeader: {
    paddingHorizontal: 6,
    marginBottom: 8,
    ...COMMON_STYLE_VALUES.rowBetween,
  },
  missionsTitle: {
    fontSize: 13,
    ...COMMON_STYLE_VALUES.textSecondary,
    fontWeight: '800',
  },
  missionsSub: {
    fontSize: 11,
    ...COMMON_STYLE_VALUES.textMuted,
    marginRight: 20,
  },
  missionsScroll: {
    paddingRight: 16,
    gap: 10,
  },
  missionCard: {
    width: 210,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  missionStore: {
    ...COMMON_STYLE_VALUES.textSecondary,
    fontWeight: '800',
    fontSize: 13,
  },
  missionMeta: {
    marginTop: 4,
    ...COMMON_STYLE_VALUES.textMuted,
    fontSize: 11,
  },
  missionReward: {
    marginTop: 8,
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '900',
  },
  missionLink: {
    marginTop: 8,
    ...COMMON_STYLE_VALUES.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },

  // Bouton recentrer
  recenterBtn: {
    position: 'absolute',
    bottom: 130,
    right: 20,
    backgroundColor: COLORS.white,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  recenterBtnOnline: {
    bottom: 40,
  },
});

// Style de carte 
const mapStyle = [
  { "featureType": "poi", "stylers": [{ "visibility": "off" }] },
  { "featureType": "transit", "stylers": [{ "visibility": "simplified" }] }
];