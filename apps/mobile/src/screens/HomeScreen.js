import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COMMON_STYLE_VALUES } from '../styles/commonStyles';
import { useAvailabilityStore } from '../store/useAvailabilityStore';
import Header from '../components/Header';
import GoMileButton from '../components/GoMileButton';

export default function HomeScreen() {
  const isOnline = useAvailabilityStore((state) => state.isOnline);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <Header title="TABLEAU DE BORD" showAvailabilityToggle />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {!isOnline && (
          <View style={styles.offlineBanner}>
            <MaterialCommunityIcons name="wifi-off" size={22} color="#1A3C5A" />
            <Text style={styles.offlineTitle}>Mode hors ligne</Text>
            <Text style={styles.offlineText}>
              Les missions proposées, les notifications et les actions de service sont désactivées.
            </Text>
          </View>
        )}
        
        <View style={styles.mainCard}>
          <Text style={styles.cardTitle}>Disponibilité</Text>
          <Text style={styles.cardDescription}>
            {isOnline 
              ? "Vous êtes visible. L'API peut vous envoyer des missions proches." 
              : "Passez en ligne pour commencer à recevoir des livraisons."}
          </Text>
          <View style={[styles.toggleButton, isOnline ? styles.onlineButton : styles.offlineButton]}>
            <Text style={styles.buttonText}>
              {isOnline ? 'Service actif' : 'Service arrêté'}
            </Text>
          </View>
        </View>

        {isOnline ? (
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Portefeuille</Text>
              <Text style={styles.statValue}>124.50 €</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Missions (J)</Text>
              <Text style={styles.statValue}>8</Text>
            </View>
          </View>
        ) : (
          <View style={styles.offlineStats}>
            <Text style={styles.offlineStatsText}>Les indicateurs en ligne sont masqués tant que tu es hors ligne.</Text>
          </View>
        )}

        {isOnline && (
          <View style={styles.missionPlaceholder}>
            <Text style={styles.placeholderText}>Aucune mission en cours</Text>
            <GoMileButton title="VOIR LES MISSIONS" style={styles.missionBtn} onPress={() => {}} />
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    padding: 20,
  },
  offlineBanner: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 15,
    backgroundColor: '#EEF3F7',
    alignItems: 'center',
  },
  offlineTitle: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: '900',
    color: '#1A3C5A',
  },
  offlineText: {
    marginTop: 6,
    color: '#667085',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
  },
  mainCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardDescription: {
    color: '#777',
    marginBottom: 20,
    lineHeight: 20,
  },
  toggleButton: {
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  onlineButton: {
    backgroundColor: '#E74C3C',
  },
  offlineButton: {
    backgroundColor: '#1A3C5A',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statsRow: {
    ...COMMON_STYLE_VALUES.rowBetween,
    marginBottom: 20,
  },
  statItem: {
    backgroundColor: '#FFF',
    width: '48%',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEE',
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A3C5A',
  },
  offlineStats: {
    marginBottom: 20,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#EEE',
  },
  offlineStatsText: {
    color: '#667085',
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
  },
  missionPlaceholder: {
    height: 150,
    borderWidth: 2,
    borderColor: '#EEE',
    borderStyle: 'dashed',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  placeholderText: {
    color: '#AAA',
    textAlign: 'center',
  },
  missionBtn: {
    marginTop: 12,
  }
});