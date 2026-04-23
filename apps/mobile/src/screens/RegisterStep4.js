import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import FormLayout from '../components/FormLayout';
import SectionTitle from '../components/SectionTitle';
import GoMileInput from '../components/GoMileInput';
import GoMileButton from '../components/GoMileButton';
import DocPicker from '../components/DocPicker'; // Réutilisation du picker de l'étape 3

// Store, Thème et API
import { useRegistrationStore } from '../store/useRegistrationStore';
import { COLORS } from '../constants/theme';
import { COMMON_STYLE_VALUES } from '../styles/commonStyles';
import { registerDriver } from '../../lib/auth-client';
import { uploadLocalFile } from '../../lib/upload-client';

export default function RegisterStep4({ navigation }) {
  const [isLoading, setIsLoading] = useState(false);
  
  // Extraction des données du store
  const { 
    updateField, siret, kbisFile, ribFile,
    firstName, lastName, email, phone, 
    birthDate, gender, address, city, zipCode, street, deliveryCity, deliveryRadius, equipments, transportType,
    cniFile, justificatifFile, password,
    permisFile, carteGriseFile,
    resetForm,
  } = useRegistrationStore();

  const pickDoc = async (field) => {
    const result = await ImagePicker.launchImageLibraryAsync({ 
      mediaTypes: ImagePicker.MediaType.Images,
      quality: 0.7 
    });
    if (!result.canceled) updateField(field, result.assets[0].uri);
  };

  
  const handleFinish = async () => {
    if (!email || !password || !firstName || !lastName || !phone || !birthDate || !gender) {
      return Alert.alert('Erreur', 'Informations personnelles incomplètes.');
    }
    if (!address || !deliveryCity || !deliveryRadius || !transportType) {
      return Alert.alert('Erreur', 'Informations transport incomplètes.');
    }

    setIsLoading(true);

    try {
      const safeDeliveryRadius = Number.parseInt(String(deliveryRadius), 10);
      if (!Number.isFinite(safeDeliveryRadius) || safeDeliveryRadius < 1) {
        throw new Error('Rayon de livraison invalide.');
      }

      const normalizePhone = (value) => {
        const cleaned = String(value || '').replace(/\s+/g, '');
        if (cleaned.startsWith('+')) return cleaned;
        if (cleaned.startsWith('0') && cleaned.length === 10) {
          return `+33${cleaned.slice(1)}`;
        }
        return cleaned;
      };

      const genderMap = {
        'Homme': 'MALE',
        'Femme': 'FEMALE',
        'Autre': 'UNDEFINED'
      };

      const vehicleMap = {
        velo: 'BIKE',
        moto: 'SCOOTER',
        voiture: 'CAR',
        utilitaire: 'TRUCK',
      };

      const cniUrl = cniFile ? await uploadLocalFile(cniFile, 'cni.jpg') : undefined;
      const justificatifUrl = justificatifFile
        ? await uploadLocalFile(justificatifFile, 'justificatif.jpg')
        : undefined;
      const permisUrl = permisFile ? await uploadLocalFile(permisFile, 'permis.jpg') : undefined;
      const carteGriseUrl = carteGriseFile
        ? await uploadLocalFile(carteGriseFile, 'carte-grise.jpg')
        : undefined;
      const kbisUrl = kbisFile ? await uploadLocalFile(kbisFile, 'kbis.jpg') : undefined;
      const ribUrl = ribFile ? await uploadLocalFile(ribFile, 'rib.jpg') : undefined;

      const signupData = {
        email: String(email).trim().toLowerCase(),
        password,
        firstName: String(firstName).trim(),
        lastName: String(lastName).trim(),
        gender: genderMap[gender] || 'UNDEFINED',
        phone: normalizePhone(phone),
        dateOfBirth: birthDate,
        address: String(address).trim(),
        city: city ? String(city).trim() : undefined,
        zipCode: zipCode ? String(zipCode).trim() : undefined,
        street: street ? String(street).trim() : undefined,
        deliveryCity: String(deliveryCity).trim(),
        deliveryRadius: safeDeliveryRadius,
        transportType: vehicleMap[transportType] || 'BIKE',
        equipments,
        cniFile: cniUrl,
        justificatifFile: justificatifUrl,
        permisFile: permisUrl,
        carteGriseFile: carteGriseUrl,
        siret: siret ? String(siret).trim() : undefined,
        kbisFile: kbisUrl,
        ribFile: ribUrl,
      };

      await registerDriver(signupData);
      resetForm();

      Alert.alert(
        "Félicitations !",
        "Ton compte GoMile a été créé avec succès.",
        [{ text: "C'est parti !", onPress: () => navigation.replace('MainApp') }]
      );

    } catch (error) {
      Alert.alert("Erreur d'inscription", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormLayout title="INFOS PRO" progress={100}>
      <SectionTitle>Dernière étape (4/4)</SectionTitle>

      <GoMileInput 
        label="Numéro SIRET"
        placeholder="Ex: 123 456 789 00012"
        value={siret}
        onChangeText={(v) => updateField('siret', v)}
        keyboardType="numeric"
      />

      {/* On réutilise DocPicker pour le KBIS et le RIB pour garder le même style dashed */}
      <DocPicker 
        label="Extrait KBIS (ou déclaration auto-entrepreneur)"
        value={kbisFile}
        onPress={() => pickDoc('kbisFile')}
      />

      <DocPicker 
        label="RIB (Pour tes futurs virements)"
        value={ribFile}
        onPress={() => pickDoc('ribFile')}
      />

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          En cliquant sur Terminer, tu certifies l'exactitude des documents fournis.
        </Text>
      </View>

      <View style={styles.buttonRow}>
        <GoMileButton 
          title="RETOUR"
          type="secondary"
          outline
          style={{ flex: 1 }}
          onPress={() => navigation.goBack()}
        />
        <GoMileButton 
          title="TERMINER"
          type="secondary" // Vert pour la validation finale
          style={{ flex: 2 }}
          loading={isLoading}
          onPress={handleFinish}
        />
      </View>
    </FormLayout>
  );
}

const styles = StyleSheet.create({
  infoBox: { 
    marginTop: 10, 
    padding: 15, 
    backgroundColor: '#E3F2FD', 
    borderRadius: 8 
  },
  infoText: { 
    ...COMMON_STYLE_VALUES.textSecondary,
    fontSize: 12, 
    textAlign: 'center' 
  },
  buttonRow: { 
    ...COMMON_STYLE_VALUES.rowCenter,
    gap: 15, 
    marginTop: 30, 
    marginBottom: 20 
  }
});