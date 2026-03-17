import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function HomeScreen() {
  const [isOnline, setIsOnline] = useState(false);

  // Couleurs basées sur ton logo
  const colors = {
    primary: '#1A3C5A', // Bleu GoMile
    secondary: '#8BC34A', // Vert GoMile
    danger: '#E74C3C',
    bg: '#F8F9FA'
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header avec Statut */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Bonjour, Livreur 👋</Text>
          <Text style={styles.brandText}>GoMile Logistics</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: isOnline ? colors.secondary : '#DDD' }]}>
          <Text style={styles.statusBadgeText}>{isOnline ? 'EN LIGNE' : 'OFFLINE'}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Carte de Statut Globale */}
        <View style={styles.mainCard}>
          <Text style={styles.cardTitle}>Disponibilité</Text>
          <Text style={styles.cardDescription}>
            {isOnline 
              ? "Vous êtes visible. L'API peut vous envoyer des missions proches." 
              : "Passez en ligne pour commencer à recevoir des livraisons."}
          </Text>
          
          <TouchableOpacity 
            activeOpacity={0.8}
            style={[styles.toggleButton, { backgroundColor: isOnline ? colors.danger : colors.primary }]}
            onPress={() => setIsOnline(!isOnline)}
          >
            <Text style={styles.buttonText}>
              {isOnline ? 'Arrêter le service' : 'Prendre mon service'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Statistiques Rapides (Wallet / Missions) */}
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

        {/* Zone de Mission (Vide pour l'instant) */}
        <View style={styles.missionPlaceholder}>
          <Text style={styles.placeholderText}>Aucune mission en cours</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  welcomeText: {
    fontSize: 14,
    color: '#666',
  },
  brandText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A3C5A',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 20,
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
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  missionPlaceholder: {
    height: 150,
    borderWidth: 2,
    borderColor: '#EEE',
    borderStyle: 'dashed',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#AAA',
  }
});