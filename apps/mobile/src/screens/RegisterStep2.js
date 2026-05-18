import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRegistrationStore } from '../store/useRegistrationStore';

import FormLayout from '../components/FormLayout';
import GoMileInput from '../components/GoMileInput';
import FormButtons from '../components/FormButtons';
import OptionCard from '../components/OptionCard';
import SectionTitle from '../components/SectionTitle';
import AddressAutocomplete from '../components/AddressAutocomplete';
import { COMMON_STYLE_VALUES } from '../styles/commonStyles';
import { registerDriver } from '../../lib/auth-client';
import { uploadLocalFileAnonymous } from '../../lib/upload-client';
import { setCachedProfileAvatarUrl } from '../../lib/profile-cache';

const FALLBACK_AVATAR_URL = 'https://placehold.co/512x512/png?text=GoMile';

export default function RegisterStep2({ navigation }) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    updateField,
    address, city, zipCode, street, deliveryCity, deliveryRadius, transportType,
    firstName, lastName, email, phone, avatarUrl, birthDate, gender, password,
  } = useRegistrationStore();

  const onSelectAddress = (data) => {
    updateField('address', data.fullAddress);
    updateField('city', data.city);
    updateField('zipCode', data.zip);
    updateField('street', data.street);
    if (!deliveryCity) updateField('deliveryCity', data.city);
  };

  useEffect(() => {
    if (!deliveryCity && city) updateField('deliveryCity', city);
  }, [city, deliveryCity, updateField]);

  const handleNext = async () => {
    if (!address || !city) return Alert.alert('Champs requis', 'Veuillez sélectionner une adresse valide.');
    if (!deliveryCity) return Alert.alert('Champs requis', "Indiquez votre ville de livraison.");
    if (!deliveryRadius) return Alert.alert('Champs requis', "Indiquez votre rayon d'action.");
    if (!transportType) return Alert.alert('Champs requis', 'Choisissez un mode de transport.');

    setIsLoading(true);
    try {
      const safeRadius = Number.parseInt(String(deliveryRadius), 10);
      if (!Number.isFinite(safeRadius) || safeRadius < 1) throw new Error('Rayon de livraison invalide.');

      const normalizePhone = (v) => {
        const c = String(v || '').replace(/\s+/g, '');
        if (c.startsWith('+')) return c;
        if (c.startsWith('0') && c.length === 10) return `+33${c.slice(1)}`;
        return c;
      };

      const genderMap = { Homme: 'MALE', Femme: 'FEMALE', Autre: 'UNDEFINED' };
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
        deliveryRadius: safeRadius,
        transportType: vehicleMap[transportType] || 'BIKE',
      };

      const cleaned = Object.fromEntries(Object.entries(signupData).filter(([, v]) => v !== undefined));
      await registerDriver(cleaned);

      navigation.replace('EmailVerification');
    } catch (err) {
      Alert.alert("Erreur d'inscription", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormLayout title="LOGISTIQUE" progress={60}>
      <SectionTitle>Logistique (3/3)</SectionTitle>

      <AddressAutocomplete
        label="Adresse de résidence"
        value={address}
        updateValue={(v) => updateField('address', v)}
        onAddressSelect={onSelectAddress}
      />

      <GoMileInput
        label="Ville de livraison"
        value={deliveryCity || city}
        onChangeText={(v) => updateField('deliveryCity', v)}
        placeholder={city || 'Ville'}
        containerStyle={styles.fullInput}
      />

      <GoMileInput
        label="Rayon (km)"
        keyboardType="numeric"
        value={deliveryRadius}
        onChangeText={(v) => updateField('deliveryRadius', String(v).replace(/[^0-9]/g, ''))}
        containerStyle={styles.fullInput}
      />

      <SectionTitle style={{ marginTop: 10 }}>Mode de transport</SectionTitle>
      <View style={styles.grid}>
        {['velo', 'moto', 'voiture', 'utilitaire'].map((type) => (
          <OptionCard
            key={type}
            label={type.charAt(0).toUpperCase() + type.slice(1)}
            active={transportType === type}
            onPress={() => updateField('transportType', type)}
          />
        ))}
      </View>

      <FormButtons
        onBack={() => navigation.goBack()}
        onNext={handleNext}
        loading={isLoading}
      />
    </FormLayout>
  );
}

const styles = StyleSheet.create({
  fullInput: { marginBottom: 15 },
  grid: { ...COMMON_STYLE_VALUES.rowBetween, flexWrap: 'wrap', marginTop: 5 },
});
