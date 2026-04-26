import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRegistrationStore } from '../store/useRegistrationStore';
import Header from '../components/Header';

export default function RegisterStep3({ navigation }) {
  const { updateField, transportType, cniFile, justificatifFile, permisFile, carteGriseFile } = useRegistrationStore();

  const pickImage = async (field) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      updateField(field, result.assets[0].uri);
    }
  };

  const renderDocPicker = (label, field, isFilled) => (
    <View style={styles.docContainer}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity 
        style={[styles.uploadBox, isFilled && styles.uploadBoxActive]} 
        onPress={() => pickImage(field)}
      >
        {isFilled ? (
          <Image source={{ uri: isFilled }} style={styles.previewImage} />
        ) : (
          <Text style={styles.uploadText}>+ Ajouter le document</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="DOCUMENTS" />
      <View style={styles.progressBar}><View style={[styles.progressLine, { width: '75%' }]} /></View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Justificatifs (3/4)</Text>
        
        {renderDocPicker("Pièce d'identité (CNI ou Titre de séjour)", 'cniFile', cniFile)}
        {renderDocPicker("Justificatif de domicile (-3 mois)", 'justificatifFile', justificatifFile)}

        {/* Affichage conditionnel selon le transport */}
        {transportType !== 'velo' && (
          <>
            {renderDocPicker("Permis de conduire", 'permisFile', permisFile)}
            {renderDocPicker("Carte grise du véhicule", 'carteGriseFile', carteGriseFile)}
          </>
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>RETOUR</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.nextButton} 
            onPress={() => navigation.navigate('RegisterStep4')}
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
  title: { fontSize: 20, fontWeight: '800', color: '#1A3C5A', marginBottom: 10 },
  label: { color: '#1A3C5A', fontWeight: '600', marginBottom: 8, marginTop: 15 },
  uploadBox: { height: 120, borderWidth: 2, borderStyle: 'dashed', borderColor: '#CCC', borderRadius: 12, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' },
  uploadBoxActive: { borderColor: '#8BC34A', borderStyle: 'solid' },
  uploadText: { color: '#AAA', fontWeight: '600' },
  previewImage: { width: '100%', height: '100%', borderRadius: 10 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 40, marginBottom: 30 },
  backButton: { flex: 1, padding: 16, alignItems: 'center' },
  backButtonText: { color: '#666', fontWeight: 'bold' },
  nextButton: { flex: 2, backgroundColor: '#1A3C5A', padding: 16, borderRadius: 10, alignItems: 'center' },
  nextButtonText: { color: '#FFF', fontWeight: 'bold' }
});