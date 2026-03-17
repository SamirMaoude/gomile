import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRegistrationStore } from '../store/useRegistrationStore';
import Header from '../components/Header';

export default function RegisterStep2({navigation}) {
  const { updateField, nextStep, prevStep, address, transportType } = useRegistrationStore();

  const transportOptions = [
    { label: 'Vélo', value: 'velo' },
    { label: 'Moto / Scooter', value: 'moto' },
    { label: 'Voiture', value: 'voiture' },
    { label: 'Utilitaire', value: 'utilitaire' },
  ];

  const prevState = () => {
    navigation.navigate('RegisterStep1');
    // Sera géré par la navigation vers l'Étape 1
  };

  return (
    <View style={styles.container}>
      <Header title="TRANSPORT" />

      <View style={styles.progressBar}>
        <View style={[styles.progressLine, { width: '50%' }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Logistique (2/4)</Text>

        <Text style={styles.label}>Adresse de résidence</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Numéro, rue, code postal, ville"
          value={address}
          onChangeText={(v) => updateField('address', v)}
        />

        <Text style={styles.label}>Moyen de transport</Text>
        <View style={styles.optionsGrid}>
          {transportOptions.map((option) => (
            <TouchableOpacity 
              key={option.value}
              style={[
                styles.optionCard, 
                transportType === option.value && styles.optionCardActive
              ]}
              onPress={() => updateField('transportType', option.value)}
            >
              <Text style={[
                styles.optionLabel,
                transportType === option.value && styles.optionLabelActive
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.backButton} onPress={prevState}>
            <Text style={styles.backButtonText}>RETOUR</Text>

          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.nextButton, !transportType && { opacity: 0.5 }]} 
            onPress={() => navigation.navigate('RegisterStep3')}
            disabled={!transportType}
          >
            <Text style={styles.nextButtonText}>CONTINUER</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F2' },
  progressBar: { height: 6, backgroundColor: '#DDD' },
  progressLine: { height: '100%', backgroundColor: '#8BC34A' },
  scrollContent: { padding: 25 },
  title: { fontSize: 20, fontWeight: '800', color: '#1A3C5A' },
  label: { color: '#1A3C5A', fontWeight: '600', marginBottom: 8, marginTop: 20 },
  input: { borderWidth: 1, borderColor: '#DDD', padding: 15, borderRadius: 10, backgroundColor: '#FFF' },
  
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 10 },
  optionCard: { 
    width: '48%', 
    padding: 20, 
    borderWidth: 1, 
    borderColor: '#DDD', 
    borderRadius: 12, 
    backgroundColor: '#FFF',
    marginBottom: 15,
    alignItems: 'center'
  },
  optionCardActive: { borderColor: '#1A3C5A', backgroundColor: '#E6F4FE', borderWidth: 2 },
  optionLabel: { fontWeight: 'bold', color: '#666' },
  optionLabelActive: { color: '#1A3C5A' },

  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30 },
  backButton: { flex: 1, padding: 16, alignItems: 'center', marginRight: 10 },
  backButtonText: { color: '#666', fontWeight: 'bold' },
  nextButton: { flex: 2, backgroundColor: '#1A3C5A', padding: 16, borderRadius: 10, alignItems: 'center' },
  nextButtonText: { color: '#FFF', fontWeight: 'bold' }
});