import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';

import FormLayout from '../components/FormLayout';
import SectionTitle from '../components/SectionTitle';
import GoMileInput from '../components/GoMileInput';
import GoMileButton from '../components/GoMileButton';
import { Text } from 'react-native';

import { useRegistrationStore } from '../store/useRegistrationStore';
import { COMMON_STYLE_VALUES } from '../styles/commonStyles';
import { registerDriver } from '../../lib/auth-client';
import { uploadLocalFileAnonymous } from '../../lib/upload-client';
import { setCachedProfileAvatarUrl } from '../../lib/profile-cache';

const FALLBACK_AVATAR_URL = 'https://placehold.co/512x512/png?text=GoMile';

export default function RegisterStep4({ navigation }) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    updateField, siret,
    firstName, lastName, email, phone, avatarUrl,
    birthDate, gender, address, city, zipCode, street, deliveryCity, deliveryRadius, transportType,
    password,
  } = useRegistrationStore();

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
        if (cleaned.startsWith('0') && cleaned.length === 10) return `+33${cleaned.slice(1)}`;
        return cleaned;
      };

      const genderMap = { 'Homme': 'MALE', 'Femme': 'FEMALE', 'Autre': 'UNDEFINED' };
      const vehicleMap = { velo: 'BIKE', moto: 'SCOOTER', voiture: 'CAR', utilitaire: 'TRUCK' };

      const avatarUrlUploaded = avatarUrl
        ? await uploadLocalFileAnonymous(avatarUrl, 'avatar.jpg').catch(() => undefined)
        : undefined;

      if (avatarUrlUploaded) setCachedProfileAvatarUrl(avatarUrlUploaded);

      const signupData = {
        email: String(email).trim().toLowerCase(),
        password,
        firstName: String(firstName).trim(),
        lastName: String(lastName).trim(),
        gender: genderMap[gender] || 'UNDEFINED',
        phone: normalizePhone(phone),
        dateOfBirth: birthDate,
        avatarUrl: avatarUrlUploaded ?? FALLBACK_AVATAR_URL,
        address: String(address).trim(),
        city: city ? String(city).trim() : undefined,
        zipCode: zipCode ? String(zipCode).trim() : undefined,
        street: street ? String(street).trim() : undefined,
        deliveryCity: String(deliveryCity).trim(),
        deliveryRadius: safeDeliveryRadius,
        transportType: vehicleMap[transportType] || 'BIKE',
        siret: siret ? String(siret).trim() : undefined,
      };

      const cleanedSignupData = Object.fromEntries(
        Object.entries(signupData).filter(([_, v]) => v !== undefined),
      );

      await registerDriver(cleanedSignupData);

      // Les documents KYC se déposent depuis la page Profil après inscription.
      navigation.replace('EmailVerification');

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
        label="Numéro SIRET (optionnel)"
        placeholder="Ex: 123 456 789 00012"
        value={siret}
        onChangeText={(v) => updateField('siret', v)}
        keyboardType="numeric"
      />

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          Tes documents KYC (pièce d'identité, permis, RIB…) se déposent depuis ton profil après l'inscription.
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
          type="secondary"
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
    borderRadius: 8,
  },
  infoText: {
    ...COMMON_STYLE_VALUES.textSecondary,
    fontSize: 12,
    textAlign: 'center',
  },
  buttonRow: {
    ...COMMON_STYLE_VALUES.rowCenter,
    gap: 15,
    marginTop: 30,
    marginBottom: 20,
  },
});
