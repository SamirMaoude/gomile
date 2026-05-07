import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import FormLayout from '../components/FormLayout';
import SectionTitle from '../components/SectionTitle';
import GoMileButton from '../components/GoMileButton';
import { COLORS } from '../constants/theme';
import { COMMON_STYLE_VALUES } from '../styles/commonStyles';
import { useAvailabilityStore } from '../store/useAvailabilityStore';
import { useMissionStore } from '../store/useMissionStore';
import { useMissionsPoller } from '../hooks/useMissionsPoller';

const parseLocation = (loc) =>
  loc && typeof loc.latitude === 'number'
    ? { latitude: loc.latitude, longitude: loc.longitude }
    : { latitude: 45.1885, longitude: 5.7245 };

export default function MissionsScreen({ navigation }) {
  const isOnline = useAvailabilityStore((s) => s.isOnline);

  // Missions depuis le store Zustand (partagé avec TableauDeBord)
  const availableMissions  = useMissionStore((s) => s.availableMissions);
  const activeMissions     = useMissionStore((s) => s.activeMissions);
  const historyMissions    = useMissionStore((s) => s.historyMissions);
  const lastRefreshAt      = useMissionStore((s) => s.lastRefreshAt);
  const isLoadingMissions  = useMissionStore((s) => s.isLoadingMissions);
  const acceptMission = useMissionStore((s) => s.acceptMission);

  const handleResumeMission = (mission) => {
    // acceptMission est idempotente : ajoute à la queue si absente, focus toujours
    acceptMission(mission);
    const parent = navigation.getParent();
    (parent ?? navigation).navigate('MissionFocus');
  };

  // Polling 10s — fetchAll=true : disponibles + actives + historique
  const { refresh } = useMissionsPoller({ fetchAll: true });

  const toDetailsMission = (mission) => ({
    ...mission,
    pickup: parseLocation(mission.pickup),
    dropoff: parseLocation(mission.dropoff),
  });

  const handleOpenMissionDetails = (mission) => {
    navigation.navigate('MissionDetails', { mission: toDetailsMission(mission) });
  };

  return (
    <View style={{ flex: 1 }}>
      <FormLayout title="MISSIONS" showAvailabilityToggle>

        {!isOnline && (
          <View style={styles.offlineBanner}>
            <MaterialCommunityIcons name="wifi-off" size={22} color={COLORS.secondary} />
            <Text style={styles.offlineTitle}>Mode hors ligne</Text>
            <Text style={styles.offlineText}>
              Les missions proposées, les notifications et l'acceptation des courses sont désactivées.
            </Text>
          </View>
        )}

        {isOnline && (
          <View>
            {/* Résumé + horodatage du dernier rafraîchissement */}
            <SectionTitle>Notifications missions</SectionTitle>
            <View style={styles.statusBoxCompact}>
              <Text style={styles.statusTextCompact}>
                {availableMissions.length > 0
                  ? `${availableMissions.length} mission(s) disponible(s)`
                  : 'Aucune nouvelle mission pour le moment'}
              </Text>
              {lastRefreshAt && (
                <Text style={styles.statusHint}>
                  Mis à jour à {lastRefreshAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </Text>
              )}
            </View>

            {/* Missions en cours */}
            <SectionTitle style={{ marginTop: 16 }}>Missions en cours</SectionTitle>
            {!isLoadingMissions && activeMissions.length === 0 && (
              <Text style={styles.emptyText}>Aucune mission active.</Text>
            )}
            {activeMissions.map((item) => (
              <ActiveMissionCard
                key={item.id}
                mission={item}
                onResume={() => handleResumeMission(item)}
              />
            ))}

            {/* Missions disponibles */}
            <SectionTitle>Missions à proximité</SectionTitle>
            {isLoadingMissions && <Text style={styles.loadingText}>Chargement...</Text>}
            {!isLoadingMissions && availableMissions.length === 0 && (
              <Text style={styles.emptyText}>Aucune mission disponible pour le moment.</Text>
            )}
            {availableMissions.map((item) => (
              <MissionCard key={item.id} mission={item} onOpenDetails={() => handleOpenMissionDetails(item)} />
            ))}

            {/* Historique */}
            <View style={styles.historyDivider}>
              <View style={styles.line} />
              <Text style={styles.historyTitle}>HISTORIQUE DES MISSIONS</Text>
              <View style={styles.line} />
            </View>
            {historyMissions.map((item) => (
              <HistoryRow key={item.id} item={item} />
            ))}

            {/* Bouton rafraîchir manuel */}
            <GoMileButton
              title="RAFRAÎCHIR"
              type="secondary"
              outline
              onPress={refresh}
              loading={isLoadingMissions}
              style={{ marginTop: 15 }}
            />
          </View>
        )}

        {!isOnline && (
          <View style={styles.offlinePlaceholder}>
            <Text style={styles.emptyText}>
              Passe en ligne pour voir les missions proposées et recevoir les notifications.
            </Text>
          </View>
        )}
      </FormLayout>
    </View>
  );
}

const MissionCard = ({ mission, onOpenDetails }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Text style={styles.storeName}>{mission.store}</Text>
      <Text style={styles.price}>{mission.reward}€</Text>
    </View>
    <View style={styles.cardMeta}>
      <Text style={styles.metaText}>{mission.distance}</Text>
      <Text style={styles.metaText}>{mission.type}</Text>
    </View>
    <GoMileButton title="VOIR LES DÉTAILS" style={styles.acceptBtn} onPress={onOpenDetails} />
  </View>
);

const ActiveMissionCard = ({ mission, onResume }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Text style={styles.storeName}>{mission.store}</Text>
      <Text style={styles.price}>{mission.reward}€</Text>
    </View>
    <View style={styles.cardMeta}>
      <Text style={styles.metaText}>{mission.distance}</Text>
      <Text style={styles.metaText}>{mission.type}</Text>
    </View>
    <GoMileButton title="REPRENDRE LA MISSION" style={styles.resumeBtn} onPress={onResume} />
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
  statusBoxCompact: { marginTop: 8, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.white },
  statusTextCompact: { ...COMMON_STYLE_VALUES.textSecondary, fontWeight: '700', fontSize: 13 },
  statusHint: { ...COMMON_STYLE_VALUES.textMuted, fontSize: 11, marginTop: 4 },
  offlineBanner: { marginBottom: 16, padding: 16, borderRadius: 15, backgroundColor: '#EEF3F7', alignItems: 'center' },
  offlineTitle: { marginTop: 8, ...COMMON_STYLE_VALUES.textSecondary, fontWeight: '900', fontSize: 15 },
  offlineText: { marginTop: 6, ...COMMON_STYLE_VALUES.textMuted, fontSize: 12, textAlign: 'center', lineHeight: 17 },
  offlinePlaceholder: { marginTop: 12, paddingVertical: 10 },
  card: { backgroundColor: COLORS.white, borderRadius: 15, padding: 15, marginTop: 15, borderWidth: 1, borderColor: COLORS.border, elevation: 3 },
  cardHeader: { ...COMMON_STYLE_VALUES.rowBetween },
  storeName: { fontWeight: 'bold', fontSize: 16, ...COMMON_STYLE_VALUES.textSecondary },
  price: { fontWeight: '900', color: COLORS.primary, fontSize: 18 },
  cardMeta: { flexDirection: 'row', gap: 15, marginVertical: 10 },
  metaText: { fontSize: 12, ...COMMON_STYLE_VALUES.textMuted },
  acceptBtn: { paddingVertical: 10 },
  resumeBtn: { paddingVertical: 10, backgroundColor: COLORS.secondary },
  historyDivider: { flexDirection: 'row', alignItems: 'center', marginVertical: 30, opacity: 0.5 },
  line: { flex: 1, height: 1, backgroundColor: COLORS.placeholder },
  historyTitle: { marginHorizontal: 10, fontSize: 10, fontWeight: 'bold', color: COLORS.placeholder },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  historyStore: { fontWeight: '600', ...COMMON_STYLE_VALUES.textSecondary },
  historyDate: { fontSize: 12, ...COMMON_STYLE_VALUES.textMuted },
  historyPrice: { fontWeight: 'bold', ...COMMON_STYLE_VALUES.textSecondary },
  loadingText: { marginTop: 10, ...COMMON_STYLE_VALUES.textMuted },
  emptyText: { marginTop: 10, ...COMMON_STYLE_VALUES.textMuted },
});
