

// import React, { useCallback, useEffect, useState } from 'react';
// import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
// import MapView, { PROVIDER_GOOGLE, Circle, Marker } from 'react-native-maps'; // Nécessite l'install de react-native-maps
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import * as Location from 'expo-location';
// import { useFocusEffect } from '@react-navigation/native';

// //  composants
// import Header from '../components/Header';
// import { COLORS } from '../constants/theme';
// import { useAvailabilityStore } from '../store/useAvailabilityStore';
// import { COMMON_STYLE_VALUES } from '../styles/commonStyles';
// import { useMissionStore } from '../store/useMissionStore';
// import {
//   getDriverDashboard,
//   getAvailableMissions,
//   updateDriverLocation,
// } from '../../lib/driver-client';

// const { width, height } = Dimensions.get('window');

// export default function DashboardScreen({ navigation }) {
//   const isOnline = useAvailabilityStore((state) => state.isOnline);
//   const setOnlineStatus = useAvailabilityStore((state) => state.setOnlineStatus);
//   const [isLocating, setIsLocating] = useState(false);
//   const [todayEarnings, setTodayEarnings] = useState(0);
//   const [todayTrips, setTodayTrips] = useState(0);
//   const [proposedMissions, setProposedMissions] = useState([]);
//   const declinedMissionIds = useMissionStore((state) => state.declinedMissionIds);
  
//   // Position par défaut: Grenoble centre, remplacée par la position réelle dès disponibilité.
//   const [region, setRegion] = useState({
//     latitude: 45.1885,
//     longitude: 5.7245,
//     latitudeDelta: 0.03,
//     longitudeDelta: 0.03,
//   });

//   const [currentPosition, setCurrentPosition] = useState({
//     latitude: 45.1885,
//     longitude: 5.7245,
//   });

//   useEffect(() => {
//     let isMounted = true;

//     const loadPosition = async () => {
//       try {
//         setIsLocating(true);
//         const { status } = await Location.requestForegroundPermissionsAsync();
//         if (status !== 'granted') return;

//         const position = await Location.getCurrentPositionAsync({
//           accuracy: Location.Accuracy.Balanced,
//         });

//         if (!isMounted) return;

//         const nextRegion = {
//           latitude: position.coords.latitude,
//           longitude: position.coords.longitude,
//           latitudeDelta: 0.02,
//           longitudeDelta: 0.02,
//         };

//         setCurrentPosition({
//           latitude: position.coords.latitude,
//           longitude: position.coords.longitude,
//         });
//         setRegion(nextRegion);

//         if (isOnline) {
//           await updateDriverLocation(position.coords.latitude, position.coords.longitude);
//         }
//       } catch (error) {
//         // On garde la position par défaut si la géoloc échoue.
//       } finally {
//         if (isMounted) setIsLocating(false);
//       }
//     };

//     loadPosition();

//     return () => {
//       isMounted = false;
//     };
//   }, []);

//   useEffect(() => {
//     if (!isOnline) return;

//     (async () => {
//       try {
//         await updateDriverLocation(currentPosition.latitude, currentPosition.longitude);
//       } catch {
//         // On ne bloque pas le tableau de bord si la synchro backend échoue.
//       }
//     })();
//   }, [currentPosition.latitude, currentPosition.longitude, isOnline]);

//   useFocusEffect(
//     useCallback(() => {
//       let isActive = true;
//       let refreshTimer;

//       const refreshDashboard = async () => {
//         try {
//           const dashboard = await getDriverDashboard();

//           if (!isActive) return;

//           const nextOnline = Boolean(dashboard?.isOnline);
//           setOnlineStatus(nextOnline);
//           setTodayEarnings(dashboard?.todayEarnings || 0);
//           setTodayTrips(dashboard?.todayTrips || 0);

//           if (!nextOnline) {
//             setProposedMissions([]);
//             return;
//           }

//           const missions = await getAvailableMissions();

//           if (!isActive) return;

//           const mappedMissions = (missions || [])
//             .filter(mission => !declinedMissionIds.includes(mission.id)) // <-- FILTRAGE ICI
//             .map((mission) => ({
//             id: mission.id,
//             type: mission.type || 'Mission',
//             store: mission.store || 'Commerce partenaire',
//             storeAddress: mission.pickupAddress || 'Adresse pick-up indisponible',
//             customerArea: mission.dropOffAddress || 'Adresse livraison indisponible',
//             customerName: 'Client GoMile',
//             reward: String(mission.reward ?? 0),
//             distance: `${mission.distanceKm ?? 0} km`,
//             eta: '--',
//             notes: 'Suivre les instructions de livraison.',
//             mapRegion: region,
//             pickup: mission.pickupLocation ?? { ...currentPosition },
//             dropoff: mission.dropoffLocation ?? { ...currentPosition },
//           }));

//           setProposedMissions(mappedMissions);
//         } catch {
//           if (!isActive) return;
//           setProposedMissions([]);
//         }
//       };

//       refreshDashboard();
//       // CHANGEMENT : Rafraîchissement toutes les 10 secondes pour plus de réactivité[cite: 7]
//       refreshTimer = setInterval(refreshDashboard, 10000);

//       return () => {
//         isActive = false;
//         if (refreshTimer) {
//           clearInterval(refreshTimer);
//         }
//       };
//     }, [currentPosition.latitude, currentPosition.longitude, setOnlineStatus])
//   );

//   const openMissionDetails = (mission) => {
//     navigation.navigate('MissionDetails', {
//       mission: {
//         ...mission,
//         currentPosition,
//       },
//     });
//   };

//   return (
//     <View style={styles.container}>
//       {/* Header avec bouton toggle intégré ou au-dessus */}
//       <Header title="TABLEAU DE BORD" showAvailabilityToggle />

//       {/* CARTE TEMPS RÉEL */}
//       <MapView
//         provider={PROVIDER_GOOGLE}
//         style={styles.map}
//         initialRegion={region}
//         showsUserLocation
//         customMapStyle={mapStyle} // Style  pour la lisibilité
//       >
//         <Marker
//           coordinate={currentPosition}
//           title="Vous"
//           description="Votre position actuelle"
//           pinColor={COLORS.secondary}
//         />

//         {isOnline && proposedMissions.map((mission) => (
//           <Marker
//             key={`pickup-${mission.id}`}
//             coordinate={mission.pickup}
//             title={mission.store}
//             description={`Pickup • ${mission.type} • +${mission.reward} EUR`}
//             pinColor={COLORS.primary}
//             onPress={() => openMissionDetails(mission)}
//           />
//         ))}

//         {isOnline && (
//           <Circle
//             center={currentPosition}
//             radius={1000}
//             fillColor="rgba(255, 193, 7, 0.1)"
//             strokeColor={COLORS.primary}
//           />
//         )}
//       </MapView>

//       {/* STATS RAPIDES (FLOTTANTES EN HAUT) */}
//       <View style={styles.quickStats}>
//         <View style={styles.statItem}>
//           <Text style={styles.statValue}>{todayEarnings.toFixed(2)} €</Text>
//           <Text style={styles.statLabelMini}>Aujourd'hui</Text>
//         </View>
//         <View style={[styles.statItem, { borderLeftWidth: 1, borderColor: '#EEE' }]}>
//           <Text style={styles.statValue}>{todayTrips}</Text>
//           <Text style={styles.statLabelMini}>Courses</Text>
//         </View>
//       </View>

//       {/* MISSIONS PROPOSÉES */}
//       <View style={styles.missionsOverlay}>
//         <View style={styles.missionsHeader}>
//           <Text style={styles.missionsTitle}>Missions proposées</Text>
//           {isLocating && <Text style={styles.missionsSub}>Localisation...</Text>}
//         </View>
//         {isOnline ? (
//           <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.missionsScroll}>
//             {proposedMissions.map((mission) => (
//               <TouchableOpacity
//                 key={mission.id}
//                 style={styles.missionCard}
//                 activeOpacity={0.85}
//                 onPress={() => openMissionDetails(mission)}
//               >
//                 <Text style={styles.missionStore} numberOfLines={1}>{mission.store}</Text>
//                 <Text style={styles.missionMeta}>{mission.type} • {mission.distance}</Text>
//                 <Text style={styles.missionAddress} numberOfLines={1}>Pick-up: {mission.storeAddress}</Text>
//                 <Text style={styles.missionAddress} numberOfLines={1}>Destination: {mission.customerArea}</Text>
//                 <Text style={styles.missionReward}>+{mission.reward} EUR</Text>
//                 <Text style={styles.missionLink}>Voir détails</Text>
//               </TouchableOpacity>
//             ))}
//           </ScrollView>
//         ) : (
//           <View style={styles.offlineMissionsBox}>
//             <Text style={styles.offlineMissionsText}>
//               Les missions proposées sont masquées hors ligne.
//             </Text>
//           </View>
//         )}
//       </View>

//       {/* BOUTON RECENTRER (FAB ROND) */}
//       <TouchableOpacity style={[styles.recenterBtn, isOnline && styles.recenterBtnOnline]} onPress={() => {}}>
//         <MaterialCommunityIcons name="crosshairs-gps" size={24} color={COLORS.secondary} />
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { ...COMMON_STYLE_VALUES.flex1 },
//   map: { width: width, height: height },

//   // Overlay du statut (Bas de l'écran)
//   statusOverlay: {
//     position: 'absolute',
//     bottom: 40,
//     left: 20,
//     right: 20,
//   },
//   offlineBanner: {
//     marginHorizontal: 20,
//     marginTop: 14,
//     marginBottom: -4,
//     padding: 14,
//     borderRadius: 16,
//     backgroundColor: '#EEF3F7',
//     alignItems: 'center',
//   },
//   offlineTitle: {
//     marginTop: 6,
//     fontSize: 14,
//     fontWeight: '900',
//     color: COLORS.secondary,
//   },
//   offlineText: {
//     marginTop: 4,
//     fontSize: 11,
//     color: '#667085',
//     textAlign: 'center',
//     lineHeight: 16,
//   },

//   // Stats rapides (Haut de l'écran sous le header)
//   quickStats: {
//     position: 'absolute',
//     top: 110,
//     left: 20,
//     right: 20,
//     backgroundColor: COLORS.white,
//     ...COMMON_STYLE_VALUES.rowCenter,
//     padding: 15,
//     borderRadius: 15,
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//   },
//   statItem: { flex: 1, alignItems: 'center' },
//   statValue: { fontWeight: '900', ...COMMON_STYLE_VALUES.textSecondary, fontSize: 16 },
//   statLabelMini: { fontSize: 10, ...COMMON_STYLE_VALUES.textMuted, textTransform: 'uppercase' },

//   missionsOverlay: {
//     position: 'absolute',
//     top: 184,
//     left: 14,
//     right: 0,
//   },
//   missionsHeader: {
//     paddingHorizontal: 6,
//     marginBottom: 8,
//     ...COMMON_STYLE_VALUES.rowBetween,
//   },
//   missionsTitle: {
//     fontSize: 13,
//     ...COMMON_STYLE_VALUES.textSecondary,
//     fontWeight: '800',
//   },
//   missionsSub: {
//     fontSize: 11,
//     ...COMMON_STYLE_VALUES.textMuted,
//     marginRight: 20,
//   },
//   offlineMissionsBox: {
//     marginRight: 16,
//     padding: 14,
//     borderRadius: 14,
//     backgroundColor: COLORS.white,
//     borderWidth: 1,
//     borderColor: COLORS.border,
//   },
//   offlineMissionsText: {
//     ...COMMON_STYLE_VALUES.textMuted,
//     fontSize: 12,
//     lineHeight: 17,
//   },
//   missionsScroll: {
//     paddingRight: 16,
//     gap: 10,
//   },
//   missionCard: {
//     width: 210,
//     backgroundColor: COLORS.white,
//     borderRadius: 14,
//     borderWidth: 1,
//     borderColor: COLORS.border,
//     padding: 12,
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOpacity: 0.12,
//     shadowRadius: 4,
//   },
//   missionStore: {
//     ...COMMON_STYLE_VALUES.textSecondary,
//     fontWeight: '800',
//     fontSize: 13,
//   },
//   missionMeta: {
//     marginTop: 4,
//     ...COMMON_STYLE_VALUES.textMuted,
//     fontSize: 11,
//   },
//   missionAddress: {
//     marginTop: 3,
//     ...COMMON_STYLE_VALUES.textMuted,
//     fontSize: 10,
//   },
//   missionReward: {
//     marginTop: 8,
//     color: COLORS.primary,
//     fontSize: 14,
//     fontWeight: '900',
//   },
//   missionLink: {
//     marginTop: 8,
//     ...COMMON_STYLE_VALUES.textSecondary,
//     fontSize: 11,
//     fontWeight: '700',
//   },

//   // Bouton recentrer
//   recenterBtn: {
//     position: 'absolute',
//     bottom: 130,
//     right: 20,
//     backgroundColor: COLORS.white,
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     justifyContent: 'center',
//     alignItems: 'center',
//     elevation: 5,
//   },
//   recenterBtnOnline: {
//     bottom: 40,
//   },
// });

// // Style de carte 
// const mapStyle = [
//   { "featureType": "poi", "stylers": [{ "visibility": "off" }] },
//   { "featureType": "transit", "stylers": [{ "visibility": "simplified" }] }
// ];


import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Circle, Marker } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useFocusEffect } from '@react-navigation/native';

import Header from '../components/Header';
import { COLORS } from '../constants/theme';
import { useAvailabilityStore } from '../store/useAvailabilityStore';
import { useMissionStore } from '../store/useMissionStore'; 
import { COMMON_STYLE_VALUES } from '../styles/commonStyles';
import {
  getDriverDashboard,o
  getAvailableMissions,
  updateDriverLocation,
} from '../../lib/driver-client';

const { width, height } = Dimensions.get('window');

// Fonction utilitaire pour parser les coordonnées du backend en toute sécurité
const parseLocation = (locationObj, fallbackObj) => {
  if (locationObj && typeof locationObj.latitude === 'number' && typeof locationObj.longitude === 'number') {
    return { latitude: locationObj.latitude, longitude: locationObj.longitude };
  }
  return fallbackObj;
};

export default function DashboardScreen({ navigation }) {
  const isOnline = useAvailabilityStore((state) => state.isOnline);
  const setOnlineStatus = useAvailabilityStore((state) => state.setOnlineStatus);
  const declinedMissionIds = useMissionStore((state) => state.declinedMissionIds); // IMPORT DES REFUS

  const [isLocating, setIsLocating] = useState(false);
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [todayTrips, setTodayTrips] = useState(0);
  const [proposedMissions, setProposedMissions] = useState([]);
  
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
        const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (!isMounted) return;

        setCurrentPosition({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        setRegion({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        });

        if (isOnline) {
          await updateDriverLocation(position.coords.latitude, position.coords.longitude);
        }
      } catch (error) {
      } finally {
        if (isMounted) setIsLocating(false);
      }
    };
    loadPosition();
    return () => { isMounted = false; };
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      let refreshTimer;

      const refreshDashboard = async () => {
        try {
          const dashboard = await getDriverDashboard();
          if (!isActive) return;

          const nextOnline = Boolean(dashboard?.isOnline);
          setOnlineStatus(nextOnline);
          setTodayEarnings(dashboard?.todayEarnings || 0);
          setTodayTrips(dashboard?.todayTrips || 0);

          if (!nextOnline) {
            setProposedMissions([]);
            return;
          }

          const missions = await getAvailableMissions();
          if (!isActive) return;

          // FILTRAGE ET COORDONNÉES DYNAMIQUES
          const mappedMissions = (missions || [])
            .filter(mission => !declinedMissionIds.includes(mission.id))
            .map((mission) => ({
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
              mapRegion: region,
              // Utilisation des coordonnées reçues, ou fallback sur la position actuelle
              pickup: parseLocation(mission.pickupLocation, currentPosition),
              dropoff: parseLocation(mission.dropoffLocation, currentPosition),
          }));

          setProposedMissions(mappedMissions);
        } catch {
          if (!isActive) return;
          setProposedMissions([]);
        }
      };

      refreshDashboard();
      refreshTimer = setInterval(refreshDashboard, 10000);

      return () => {
        isActive = false;
        if (refreshTimer) {
          clearInterval(refreshTimer);
        }
      };
    }, [currentPosition.latitude, currentPosition.longitude, setOnlineStatus, declinedMissionIds])
  );

  const openMissionDetails = (mission) => {
    navigation.navigate('MissionDetails', {
      mission: { ...mission, currentPosition },
    });
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

        {isOnline && proposedMissions.map((mission) => (
          <Marker
            key={`pickup-${mission.id}`}
            coordinate={mission.pickup}
            title={mission.store}
            pinColor={COLORS.primary}
            onPress={() => openMissionDetails(mission)}
          />
        ))}

        {isOnline && (
          <Circle center={currentPosition} radius={1000} fillColor="rgba(255, 193, 7, 0.1)" strokeColor={COLORS.primary} />
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
            {proposedMissions.map((mission) => (
              <TouchableOpacity
                key={mission.id}
                style={styles.missionCard}
                activeOpacity={0.85}
                onPress={() => openMissionDetails(mission)}
              >
                <Text style={styles.missionStore} numberOfLines={1}>{mission.store}</Text>
                <Text style={styles.missionMeta}>{mission.type} • {mission.distance}</Text>
                <Text style={styles.missionAddress} numberOfLines={1}>Pick-up: {mission.storeAddress}</Text>
                <Text style={styles.missionAddress} numberOfLines={1}>Destination: {mission.customerArea}</Text>
                <Text style={styles.missionReward}>+{mission.reward} EUR</Text>
                <Text style={styles.missionLink}>Voir détails</Text>
              </TouchableOpacity>
            ))}
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
  map: { width: width, height: height },
  quickStats: {
    position: 'absolute', top: 110, left: 20, right: 20, backgroundColor: COLORS.white, ...COMMON_STYLE_VALUES.rowCenter, padding: 15, borderRadius: 15, elevation: 5,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontWeight: '900', ...COMMON_STYLE_VALUES.textSecondary, fontSize: 16 },
  statLabelMini: { fontSize: 10, ...COMMON_STYLE_VALUES.textMuted, textTransform: 'uppercase' },
  missionsOverlay: { position: 'absolute', top: 184, left: 14, right: 0 },
  missionsHeader: { paddingHorizontal: 6, marginBottom: 8, ...COMMON_STYLE_VALUES.rowBetween },
  missionsTitle: { fontSize: 13, ...COMMON_STYLE_VALUES.textSecondary, fontWeight: '800' },
  missionsSub: { fontSize: 11, ...COMMON_STYLE_VALUES.textMuted, marginRight: 20 },
  offlineMissionsBox: { marginRight: 16, padding: 14, borderRadius: 14, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border },
  offlineMissionsText: { ...COMMON_STYLE_VALUES.textMuted, fontSize: 12, lineHeight: 17 },
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

const mapStyle = [ { "featureType": "poi", "stylers": [{ "visibility": "off" }] }, { "featureType": "transit", "stylers": [{ "visibility": "simplified" }] } ];