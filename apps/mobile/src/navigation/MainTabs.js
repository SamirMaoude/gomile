import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Import des constantes de thème
import { COLORS } from '../constants/theme';

import MissionsScreen from '../screens/MissionsScreen';
import WalletScreen from '../screens/WalletScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TableauDeBord from '../screens/TableauDeBord';
import { useMissionStore } from '../store/useMissionStore';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  const activeMission = useMissionStore((state) => state.activeMission);

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: COLORS.secondary, // Utilisation du Bleu GoMile
          tabBarInactiveTintColor: COLORS.placeholder, // Utilisation du Gris factorisé
          tabBarStyle: {
            height: 85,
            paddingBottom: 12,
            paddingTop: 8,
            borderTopWidth: 0,
            backgroundColor: COLORS.white, // Blanc du thème
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

            // Mapping des icônes
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
        {/* Route utilisée pour la navigation depuis MissionsScreen */}
        <Tab.Screen 
          name="Profil" 
          component={ProfileScreen} 
          options={{ tabBarLabel: 'Profil' }}
        />
      </Tab.Navigator>

      {activeMission && (
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