import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';

import FormLayout from '../components/FormLayout';
import SectionTitle from '../components/SectionTitle';
import DocPicker from '../components/DocPicker';
import GoMileButton from '../components/GoMileButton';

// Store et Thème
import { useRegistrationStore } from '../store/useRegistrationStore';
import { COMMON_STYLE_VALUES } from '../styles/commonStyles';
import { pickImageSource } from '../lib/media-picker';

export default function RegisterStep3({ navigation }) {
  const { 
    updateField, 
    transportType, 
    cniFile, 
    justificatifFile, 
    permisFile, 
    carteGriseFile 
  } = useRegistrationStore();

  const pickImage = async (field) => {
    try {
      const uri = await pickImageSource();
      if (uri) {
        updateField(field, uri);
      }
    } catch (error) {
      Alert.alert('Erreur', error.message || 'Impossible d’ouvrir le sélecteur.');
    }
  };

  return (
    <FormLayout title="DOCUMENTS" progress={75}>
      <SectionTitle>Justificatifs (3/4)</SectionTitle>
      
      <DocPicker 
        label="Pièce d'identité (CNI ou Titre de séjour)" 
        value={cniFile} 
        onPress={() => pickImage('cniFile')} 
      />

      <DocPicker 
        label="Justificatif de domicile (-3 mois)" 
        value={justificatifFile} 
        onPress={() => pickImage('justificatifFile')} 
      />

      {/* Affichage conditionnel selon le transport */}
      {transportType !== 'velo' && (
        <>
          <DocPicker 
            label="Permis de conduire" 
            value={permisFile} 
            onPress={() => pickImage('permisFile')} 
          />
          <DocPicker 
            label="Carte grise du véhicule" 
            value={carteGriseFile} 
            onPress={() => pickImage('carteGriseFile')} 
          />
        </>
      )}

      <View style={styles.buttonRow}>
        <GoMileButton 
          title="RETOUR" 
          type="secondary" 
          outline 
          style={{ flex: 1 }} 
          onPress={() => navigation.goBack()} 
        />
        <GoMileButton 
          title="CONTINUER" 
          type="secondary" 
          style={{ flex: 2 }} 
          onPress={() => navigation.navigate('RegisterStep4')} 
        />
      </View>
    </FormLayout>
  );
}

const styles = StyleSheet.create({
  buttonRow: { 
    ...COMMON_STYLE_VALUES.rowCenter,
    gap: 15, 
    marginTop: 20, 
    marginBottom: 20 
  }
});