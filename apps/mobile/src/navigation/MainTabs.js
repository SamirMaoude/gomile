import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// On utilise MaterialCommunityIcons pour un look plus "App Pro"
import { MaterialCommunityIcons } from '@expo/vector-icons'; 

import MissionsScreen from '../screens/MissionsScreen';
import WalletScreen from '../screens/WalletScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TableauDeBord from '../screens/TableauDeBord';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#1A3C5A', // Bleu GoMile
        tabBarInactiveTintColor: '#94A3B8', // Gris bleuté plus moderne
        tabBarStyle: {
          height: 70, // Un peu plus haut pour l'élégance
          paddingBottom: 12,
          paddingTop: 8,
          borderTopWidth: 0,
          backgroundColor: '#FFFFFF',
          elevation: 10, // Ombre sur Android
          shadowColor: '#000', // Ombre sur iOS
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          // On définit des icônes spécifiques "Logistique & Dashboard"
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
      <Tab.Screen 
        name="Profil" 
        component={ProfileScreen} 
        options={{ tabBarLabel: 'Profil' }}
      />
    </Tab.Navigator>
  );
}