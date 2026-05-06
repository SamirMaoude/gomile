// import React, { useCallback, useState } from 'react'; // Retrait de useEffect non utilisé ici
// import { View, Text, StyleSheet, Alert } from 'react-native';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import { useFocusEffect } from '@react-navigation/native'; // AJOUT : pour le rafraîchissement au focus[cite: 8]

// // composants factorisés
// import FormLayout from '../components/FormLayout';
// import SectionTitle from '../components/SectionTitle';
// import GoMileButton from '../components/GoMileButton';
// import { useMissionStore } from '../store/useMissionStore';

// // Thème et constantes
// import { COLORS, SIZES } from '../constants/theme';
// import { COMMON_STYLE_VALUES } from '../styles/commonStyles';
// import { getActiveMissions, getAvailableMissions, getMissionHistory } from '../../lib/driver-client';
// import { useAvailabilityStore } from '../store/useAvailabilityStore';

// export default function MissionsScreen({ navigation }) {
//   const [isLoading, setIsLoading] = useState(true);
//   const [availableMissions, setAvailableMissions] = useState([]);
//   const [activeMissions, setActiveMissions] = useState([]);
//   const [historyMissions, setHistoryMissions] = useState([]);
//   const [lastRefreshAt, setLastRefreshAt] = useState(null);
//   const [isAccountValidated] = useState(true);
//   const isOnline = useAvailabilityStore((state) => state.isOnline);
//   const declinedMissionIds = useMissionStore((state) => state.declinedMissionIds);
//   const toMissionCard = (mission) => ({
//     id: mission.id,
//     type: mission.type || 'Mission',
//     store: mission.store || 'Commerce partenaire',
//     storeAddress: mission.pickupAddress || 'Adresse pick-up indisponible',
//     customerArea: mission.dropOffAddress || 'Adresse livraison indisponible',
//     customerName: 'Client GoMile',
//     reward: String(mission.reward ?? 0),
//     distance: `${mission.distanceKm ?? 0} km`,
//     eta: '--',
//     notes: 'Suivre les instructions de livraison.',
//     mapRegion: {
//       latitude: mission.pickupLocation?.latitude ?? 45.1885,
//       longitude: mission.pickupLocation?.longitude ?? 5.7245,
//       latitudeDelta: 0.03,
//       longitudeDelta: 0.03,
//     },
//     pickup: mission.pickupLocation ?? { latitude: 45.1885, longitude: 5.7245 },
//     dropoff: mission.dropoffLocation ?? { latitude: 45.1885, longitude: 5.7245 },
//   });

//   const loadMissions = useCallback(async () => {
//     if (!isOnline) {
//       setIsLoading(false);
//       setAvailableMissions([]);
//       setActiveMissions([]);
//       setLastRefreshAt(null);
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const [available, active, history] = await Promise.all([
//         getAvailableMissions(),
//         getActiveMissions(),
//         getMissionHistory(),
//       ]);

//       const filteredAvailable = (available || []).filter(mission => !declinedMissionIds.includes(mission.id));

//       setAvailableMissions(filteredAvailable.map(toMissionCard));
//       setActiveMissions((active || []).map(toMissionCard));
//       setHistoryMissions(
//         (history || []).map((item) => ({
//           id: item.id,
//           store: item.store || 'Commerce partenaire',
//           date: item.status || 'DELIVERED',
//           reward: String(item.reward ?? 0),
//         })),
//       );
//       setLastRefreshAt(new Date());
//     } catch (error) {
//       Alert.alert('Erreur', error.message || 'Impossible de charger les missions.');
//     } finally {
//       setIsLoading(false);
//     }
//   }, [isOnline, declinedMissionIds]);

//   // CHANGEMENT : Utilisation de useFocusEffect pour rafraîchir les missions dès qu'on arrive sur cet écran[cite: 8]
//   useFocusEffect(
//     useCallback(() => {
//       loadMissions();
//     }, [loadMissions])
//   );

//   const handleOpenMissionDetails = (mission) => {
//     navigation.navigate('MissionDetails', { mission });
//   };

//   return (
//     <View style={{ flex: 1 }}>
//       <FormLayout title="MISSIONS" showAvailabilityToggle>

//         {!isOnline && (
//           <View style={styles.offlineBanner}>
//             <MaterialCommunityIcons name="wifi-off" size={22} color={COLORS.secondary} />
//             <Text style={styles.offlineTitle}>Mode hors ligne</Text>
//             <Text style={styles.offlineText}>
//               Les missions proposées, les notifications et l'acceptation des courses sont désactivées.
//             </Text>
//           </View>
//         )}
        
//         {/* 1. ÉTAT : COMPTE NON VALIDÉ */}
//         {!isAccountValidated && (
//           <View style={styles.statusBox}>
//             <MaterialCommunityIcons name="clock-check" size={24} color={COLORS.secondary} />
//             <Text style={styles.statusTitle}>Validation en cours</Text>
//             <Text style={styles.statusText}>Reviens ici dès que ton profil sera validé.</Text>
//           </View>
//         )}

//         {/* 2. MISSIONS DISPONIBLES (NON STAFFÉES) */}
//         {isAccountValidated && isOnline && (
//           <View>
//             <SectionTitle>Notifications missions</SectionTitle>
//             <View style={styles.statusBoxCompact}>
//               <Text style={styles.statusTextCompact}>
//                 {availableMissions.length > 0
//                   ? `${availableMissions.length} nouvelle(s) mission(s) disponible(s)`
//                   : 'Aucune nouvelle mission pour le moment'}
//               </Text>
//               {lastRefreshAt && (
//                 <Text style={styles.statusHint}>
//                   Dernière mise à jour: {lastRefreshAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
//                 </Text>
//               )}
//             </View>

//             <SectionTitle style={{ marginTop: 16 }}>Missions en cours</SectionTitle>
//             {!isLoading && activeMissions.length === 0 && (
//               <Text style={styles.emptyText}>Aucune mission active.</Text>
//             )}
//             {activeMissions.map((item) => (
//               <MissionCard
//                 key={item.id}
//                 mission={item}
//                 onOpenDetails={() => handleOpenMissionDetails(item)}
//               />
//             ))}

//             <SectionTitle>Missions à proximité</SectionTitle>
//             {isLoading && <Text style={styles.loadingText}>Chargement...</Text>}
//             {!isLoading && availableMissions.length === 0 && (
//               <Text style={styles.emptyText}>Aucune mission disponible pour le moment.</Text>
//             )}
//             {availableMissions.map((item) => (
//               <MissionCard 
//                 key={item.id} 
//                 mission={item} 
//                 onOpenDetails={() => handleOpenMissionDetails(item)} 
//               />
//             ))}

//             {/* SÉPARATEUR & HISTORIQUE */}
//             <View style={styles.historyDivider}>
//               <View style={styles.line} />
//               <Text style={styles.historyTitle}>HISTORIQUE DES MISSIONS</Text>
//               <View style={styles.line} />
//             </View>

//             {historyMissions.map((item) => (
//               <HistoryRow key={item.id} item={item} />
//             ))}

//             <GoMileButton title="RAFRAICHIR" type="secondary" outline onPress={loadMissions} style={{ marginTop: 15 }} />
//           </View>
//         )}

//         {isAccountValidated && !isOnline && (
//           <View style={styles.offlinePlaceholder}>
//             <Text style={styles.emptyText}>
//               Passe en ligne pour voir les missions proposées et recevoir les notifications.
//             </Text>
//           </View>
//         )}
//       </FormLayout>
//     </View>
//   );
// }

// // --- SOUS-COMPOSANTS ---

// const MissionCard = ({ mission, onOpenDetails }) => (
//   <View style={styles.card}>
//     <View style={styles.cardHeader}>
//       <Text style={styles.storeName}>{mission.store}</Text>
//       <Text style={styles.price}>{mission.reward}€</Text>
//     </View>
//     <View style={styles.cardMeta}>
//       <Text style={styles.metaText}> {mission.distance}</Text>
//       <Text style={styles.metaText}> {mission.type}</Text>
//     </View>
//     <GoMileButton title="VOIR LES DETAILS" style={styles.acceptBtn} onPress={onOpenDetails} />
//   </View>
// );

// const HistoryRow = ({ item }) => (
//   <View style={styles.historyRow}>
//     <View>
//       <Text style={styles.historyStore}>{item.store}</Text>
//       <Text style={styles.historyDate}>{item.date}</Text>
//     </View>
//     <Text style={styles.historyPrice}>+{item.reward}€</Text>
//   </View>
// );

// const styles = StyleSheet.create({
//   // Status Box (Non validé)
//   statusBox: { padding: 20, backgroundColor: '#E3F2FD', borderRadius: 15, alignItems: 'center' },
//   statusTitle: { fontWeight: 'bold', ...COMMON_STYLE_VALUES.textSecondary, marginTop: 10 },
//   statusText: { textAlign: 'center', ...COMMON_STYLE_VALUES.textSecondary, fontSize: 12 },
//   statusBoxCompact: {
//     marginTop: 8,
//     padding: 12,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: COLORS.border,
//     backgroundColor: COLORS.white,
//   },
//   statusTextCompact: {
//     ...COMMON_STYLE_VALUES.textSecondary,
//     fontWeight: '700',
//     fontSize: 13,
//   },
//   statusHint: {
//     ...COMMON_STYLE_VALUES.textMuted,
//     fontSize: 11,
//     marginTop: 4,
//   },
//   offlineBanner: {
//     marginBottom: 16,
//     padding: 16,
//     borderRadius: 15,
//     backgroundColor: '#EEF3F7',
//     alignItems: 'center',
//   },
//   offlineTitle: {
//     marginTop: 8,
//     ...COMMON_STYLE_VALUES.textSecondary,
//     fontWeight: '900',
//     fontSize: 15,
//   },
//   offlineText: {
//     marginTop: 6,
//     ...COMMON_STYLE_VALUES.textMuted,
//     fontSize: 12,
//     textAlign: 'center',
//     lineHeight: 17,
//   },
//   offlinePlaceholder: {
//     marginTop: 12,
//     paddingVertical: 10,
//   },

//   // Cartes Missions
//   card: { 
//     backgroundColor: COLORS.white, 
//     borderRadius: 15, 
//     padding: 15, 
//     marginTop: 15, 
//     borderWidth: 1, 
//     borderColor: COLORS.border,
//     elevation: 3
//   },
//   cardHeader: { ...COMMON_STYLE_VALUES.rowBetween },
//   storeName: { fontWeight: 'bold', fontSize: 16, ...COMMON_STYLE_VALUES.textSecondary },
//   price: { fontWeight: '900', color: COLORS.primary, fontSize: 18 },
//   cardMeta: { flexDirection: 'row', gap: 15, marginVertical: 10 },
//   metaText: { fontSize: 12, ...COMMON_STYLE_VALUES.textMuted },
//   acceptBtn: { paddingVertical: 10 },

//   // Historique
//   historyDivider: { flexDirection: 'row', alignItems: 'center', marginVertical: 30, opacity: 0.5 },
//   line: { flex: 1, height: 1, backgroundColor: COLORS.placeholder },
//   historyTitle: { marginHorizontal: 10, fontSize: 10, fontWeight: 'bold', color: COLORS.placeholder },
//   historyRow: { 
//     flexDirection: 'row', 
//     justifyContent: 'space-between', 
//     paddingVertical: 15, 
//     borderBottomWidth: 1, 
//     borderBottomColor: '#F5F5F5' 
//   },
//   historyStore: { fontWeight: '600', ...COMMON_STYLE_VALUES.textSecondary },
//   historyDate: { fontSize: 12, ...COMMON_STYLE_VALUES.textMuted },
//   historyPrice: { fontWeight: 'bold', ...COMMON_STYLE_VALUES.textSecondary },
//   loadingText: { marginTop: 10, ...COMMON_STYLE_VALUES.textMuted },
//   emptyText: { marginTop: 10, ...COMMON_STYLE_VALUES.textMuted },
// });


import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import FormLayout from '../components/FormLayout';
import SectionTitle from '../components/SectionTitle';
import GoMileButton from '../components/GoMileButton';
import { COLORS } from '../constants/theme';
import { COMMON_STYLE_VALUES } from '../styles/commonStyles';
import { getActiveMissions, getAvailableMissions, getMissionHistory } from '../../lib/driver-client';
import { useAvailabilityStore } from '../store/useAvailabilityStore';
import { useMissionStore } from '../store/useMissionStore'; // IMPORT DU STORE

// Fonction utilitaire pour parser les coordonnées du backend
const parseLocation = (locationObj, defaultLat, defaultLng) => {
  if (locationObj && typeof locationObj.latitude === 'number' && typeof locationObj.longitude === 'number') {
    return { latitude: locationObj.latitude, longitude: locationObj.longitude };
  }
  return { latitude: defaultLat, longitude: defaultLng };
};

export default function MissionsScreen({ navigation }) {
  const [isLoading, setIsLoading] = useState(true);
  const [availableMissions, setAvailableMissions] = useState([]);
  const [activeMissions, setActiveMissions] = useState([]);
  const [historyMissions, setHistoryMissions] = useState([]);
  const [lastRefreshAt, setLastRefreshAt] = useState(null);
  const [isAccountValidated] = useState(true);
  
  const isOnline = useAvailabilityStore((state) => state.isOnline);
  const declinedMissionIds = useMissionStore((state) => state.declinedMissionIds); // IMPORT DES REFUS

  // taff de l'aprèm de jeudi 30 
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
      latitude: mission.pickupLocation?.latitude ?? 45.1885,
      longitude: mission.pickupLocation?.longitude ?? 5.7245,
      latitudeDelta: 0.03,
      longitudeDelta: 0.03,
    },
    // Utilisation des coordonnées reçues
    pickup: parseLocation(mission.pickupLocation, 45.1885, 5.7245),
    dropoff: parseLocation(mission.dropoffLocation, 45.1885, 5.7245),
  });

  const loadMissions = useCallback(async () => {
    if (!isOnline) {
      setIsLoading(false);
      setAvailableMissions([]);
      setActiveMissions([]);
      setLastRefreshAt(null);
      return;
    }

    setIsLoading(true);
    try {
      const [available, active, history] = await Promise.all([
        getAvailableMissions(),
        getActiveMissions(),
        getMissionHistory(),
      ]);

      // FILTRAGE AVEC LE STORE
      const filteredAvailable = (available || []).filter(mission => !declinedMissionIds.includes(mission.id));

      setAvailableMissions(filteredAvailable.map(toMissionCard));
      setActiveMissions((active || []).map(toMissionCard));
      setHistoryMissions(
        (history || []).map((item) => ({
          id: item.id,
          store: item.store || 'Commerce partenaire',
          date: item.status || 'DELIVERED',
          reward: String(item.reward ?? 0),
        }))
      );
      setLastRefreshAt(new Date());
    } catch (error) {
      Alert.alert('Erreur', error.message || 'Impossible de charger les missions.');
    } finally {
      setIsLoading(false);
    }
  }, [isOnline, declinedMissionIds]);

  useFocusEffect(
    useCallback(() => {
      loadMissions();
    }, [loadMissions])
  );

  const handleOpenMissionDetails = (mission) => {
    navigation.navigate('MissionDetails', { mission });
  };

  return (
    <View style={{ flex: 1 }}>
      <FormLayout title="MISSIONS" showAvailabilityToggle>
        {!isOnline && (
          <View style={styles.offlineBanner}>
            <MaterialCommunityIcons name="wifi-off" size={22} color={COLORS.secondary} />
            <Text style={styles.offlineTitle}>Mode hors ligne</Text>
            <Text style={styles.offlineText}>Les missions proposées, les notifications et l'acceptation des courses sont désactivées.</Text>
          </View>
        )}
        
        {!isAccountValidated && (
          <View style={styles.statusBox}>
            <MaterialCommunityIcons name="clock-check" size={24} color={COLORS.secondary} />
            <Text style={styles.statusTitle}>Validation en cours</Text>
            <Text style={styles.statusText}>Reviens ici dès que ton profil sera validé.</Text>
          </View>
        )}

        {isAccountValidated && isOnline && (
          <View>
            <SectionTitle>Notifications missions</SectionTitle>
            <View style={styles.statusBoxCompact}>
              <Text style={styles.statusTextCompact}>
                {availableMissions.length > 0
                  ? `${availableMissions.length} nouvelle(s) mission(s) disponible(s)`
                  : 'Aucune nouvelle mission pour le moment'}
              </Text>
              {lastRefreshAt && (
                <Text style={styles.statusHint}>
                  Dernière mise à jour: {lastRefreshAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              )}
            </View>

            <SectionTitle style={{ marginTop: 16 }}>Missions en cours</SectionTitle>
            {!isLoading && activeMissions.length === 0 && (
              <Text style={styles.emptyText}>Aucune mission active.</Text>
            )}
            {activeMissions.map((item) => (
              <MissionCard key={item.id} mission={item} onOpenDetails={() => handleOpenMissionDetails(item)} />
            ))}

            <SectionTitle>Missions à proximité</SectionTitle>
            {isLoading && <Text style={styles.loadingText}>Chargement...</Text>}
            {!isLoading && availableMissions.length === 0 && (
              <Text style={styles.emptyText}>Aucune mission disponible pour le moment.</Text>
            )}
            {availableMissions.map((item) => (
              <MissionCard key={item.id} mission={item} onOpenDetails={() => handleOpenMissionDetails(item)} />
            ))}

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

        {isAccountValidated && !isOnline && (
          <View style={styles.offlinePlaceholder}>
            <Text style={styles.emptyText}>Passe en ligne pour voir les missions proposées et recevoir les notifications.</Text>
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
  statusBox: { padding: 20, backgroundColor: '#E3F2FD', borderRadius: 15, alignItems: 'center' },
  statusTitle: { fontWeight: 'bold', ...COMMON_STYLE_VALUES.textSecondary, marginTop: 10 },
  statusText: { textAlign: 'center', ...COMMON_STYLE_VALUES.textSecondary, fontSize: 12 },
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