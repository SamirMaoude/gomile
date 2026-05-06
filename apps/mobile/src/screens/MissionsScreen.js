import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// composants factorisés
import FormLayout from '../components/FormLayout';
import SectionTitle from '../components/SectionTitle';
import GoMileButton from '../components/GoMileButton';

// Thème et constantes
import { COLORS, SIZES } from '../constants/theme';
import { COMMON_STYLE_VALUES } from '../styles/commonStyles';
import { getAvailableMissions, getMissionHistory } from '../../lib/driver-client';

export default function MissionsScreen({ navigation }) {
  const [isLoading, setIsLoading] = useState(true);
  const [availableMissions, setAvailableMissions] = useState([]);
  const [historyMissions, setHistoryMissions] = useState([]);
  const [isAccountValidated] = useState(true);

  const toMissionCard = (mission) => ({
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
      latitude: 45.1885,
      longitude: 5.7245,
      latitudeDelta: 0.03,
      longitudeDelta: 0.03,
    },
    pickup: { latitude: 45.1885, longitude: 5.7245 },
    dropoff: { latitude: 45.1885, longitude: 5.7245 },
  });

  const loadMissions = useCallback(async () => {
    setIsLoading(true);
    try {
      const [available, history] = await Promise.all([
        getAvailableMissions(),
        getMissionHistory(),
      ]);

      setAvailableMissions((available || []).map(toMissionCard));
      setHistoryMissions(
        (history || []).map((item) => ({
          id: item.id,
          store: item.store || 'Commerce partenaire',
          date: item.status || 'DELIVERED',
          reward: String(item.reward ?? 0),
        })),
      );
    } catch (error) {
      Alert.alert('Erreur', error.message || 'Impossible de charger les missions.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMissions();
  }, [loadMissions]);

  const handleOpenMissionDetails = (mission) => {
    navigation.navigate('MissionDetails', { mission });
  };

  return (
    <View style={{ flex: 1 }}>
      <FormLayout title="MISSIONS" showAvailabilityToggle>
        
        {/* 1. ÉTAT : COMPTE NON VALIDÉ */}
        {!isAccountValidated && (
          <View style={styles.statusBox}>
            <MaterialCommunityIcons name="clock-check" size={24} color={COLORS.secondary} />
            <Text style={styles.statusTitle}>Validation en cours</Text>
            <Text style={styles.statusText}>Reviens ici dès que ton profil sera validé.</Text>
          </View>
        )}

        {/* 2. MISSIONS DISPONIBLES (NON STAFFÉES) */}
        {isAccountValidated && (
          <View>
            <SectionTitle>Missions à proximité</SectionTitle>
            {isLoading && <Text style={styles.loadingText}>Chargement...</Text>}
            {!isLoading && availableMissions.length === 0 && (
              <Text style={styles.emptyText}>Aucune mission disponible pour le moment.</Text>
            )}
            {availableMissions.map((item) => (
              <MissionCard 
                key={item.id} 
                mission={item} 
                onOpenDetails={() => handleOpenMissionDetails(item)} 
              />
            ))}

            {/* SÉPARATEUR & HISTORIQUE */}
            <View style={styles.historyDivider}>
              <View style={styles.line} />
              <Text style={styles.historyTitle}>HISTORIQUE DES MISSIONS</Text>
              <View style={styles.line} />
            </View>

            {historyMissions.map((item) => (
              <HistoryRow key={item.id} item={item} />
            ))}

            <GoMileButton title="RAFRAICHIR" type="secondary" outline onPress={loadMissions} style={{ marginTop: 15 }} />
          </View>
        )}
      </FormLayout>
    </View>
  );
}

// --- SOUS-COMPOSANTS ---

const MissionCard = ({ mission, onOpenDetails }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Text style={styles.storeName}>{mission.store}</Text>
      <Text style={styles.price}>{mission.reward}€</Text>
    </View>
    <View style={styles.cardMeta}>
      <Text style={styles.metaText}> {mission.distance}</Text>
      <Text style={styles.metaText}> {mission.type}</Text>
    </View>
    <GoMileButton title="VOIR LES DETAILS" style={styles.acceptBtn} onPress={onOpenDetails} />
  </View>
);

const HistoryRow = ({ item }) => (
  <View style={styles.historyRow}>
    <View>
      <Text style={styles.historyStore}>{item.store}</Text>
      <Text style={styles.historyDate}>{item.date}</Text>
    </View>
    <Text style={styles.historyPrice}>+{item.reward}€</Text>
  </View>
);

const styles = StyleSheet.create({
  // Status Box (Non validé)
  statusBox: { padding: 20, backgroundColor: '#E3F2FD', borderRadius: 15, alignItems: 'center' },
  statusTitle: { fontWeight: 'bold', ...COMMON_STYLE_VALUES.textSecondary, marginTop: 10 },
  statusText: { textAlign: 'center', ...COMMON_STYLE_VALUES.textSecondary, fontSize: 12 },

  // Cartes Missions
  card: { 
    backgroundColor: COLORS.white, 
    borderRadius: 15, 
    padding: 15, 
    marginTop: 15, 
    borderWidth: 1, 
    borderColor: COLORS.border,
    elevation: 3
  },
  cardHeader: { ...COMMON_STYLE_VALUES.rowBetween },
  storeName: { fontWeight: 'bold', fontSize: 16, ...COMMON_STYLE_VALUES.textSecondary },
  price: { fontWeight: '900', color: COLORS.primary, fontSize: 18 },
  cardMeta: { flexDirection: 'row', gap: 15, marginVertical: 10 },
  metaText: { fontSize: 12, ...COMMON_STYLE_VALUES.textMuted },
  acceptBtn: { paddingVertical: 10 },

  // Historique
  historyDivider: { flexDirection: 'row', alignItems: 'center', marginVertical: 30, opacity: 0.5 },
  line: { flex: 1, height: 1, backgroundColor: COLORS.placeholder },
  historyTitle: { marginHorizontal: 10, fontSize: 10, fontWeight: 'bold', color: COLORS.placeholder },
  historyRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingVertical: 15, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F5F5F5' 
  },
  historyStore: { fontWeight: '600', ...COMMON_STYLE_VALUES.textSecondary },
  historyDate: { fontSize: 12, ...COMMON_STYLE_VALUES.textMuted },
  historyPrice: { fontWeight: 'bold', ...COMMON_STYLE_VALUES.textSecondary },
  loadingText: { marginTop: 10, ...COMMON_STYLE_VALUES.textMuted },
  emptyText: { marginTop: 10, ...COMMON_STYLE_VALUES.textMuted },
});