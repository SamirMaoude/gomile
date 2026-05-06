import React, { useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRegistrationStore } from '../store/useRegistrationStore';

import FormLayout from '../components/FormLayout';
import GoMileInput from '../components/GoMileInput';
import FormButtons from '../components/FormButtons';
import OptionCard from '../components/OptionCard';
import SectionTitle from '../components/SectionTitle';
import AddressAutocomplete from '../components/AddressAutocomplete';
import { COMMON_STYLE_VALUES } from '../styles/commonStyles';
import { COLORS } from '../constants/theme';

export default function RegisterStep2({ navigation }) {
  const { 
    updateField,
    address,
    city,
    deliveryCity,
    deliveryRadius,
    transportType,
  } = useRegistrationStore();

  const onSelectAddress = (data) => {
    updateField('address', data.fullAddress);
    updateField('city', data.city);
    updateField('zipCode', data.zip);
    updateField('street', data.street);
    if (!deliveryCity) {
      updateField('deliveryCity', data.city);
    }
  };

  useEffect(() => {
    if (!deliveryCity && city) {
      updateField('deliveryCity', city);
    }
  }, [city, deliveryCity, updateField]);

  const handleNext = () => {
    if (!address || !city) return Alert.alert("Champs requis", "Veuillez sélectionner une adresse valide.");
    if (!deliveryCity) return Alert.alert("Champs requis", "Indiquez votre ville de livraison.");
    if (!deliveryRadius) return Alert.alert("Champs requis", "Indiquez votre rayon d'action.");
    if (!transportType) return Alert.alert("Champs requis", "Choisissez un mode de transport.");

    navigation.navigate('RegisterStep3');
  };

  return (
    <FormLayout title="LOGISTIQUE" progress={60}>
      <SectionTitle>Logistique (3/5)</SectionTitle>

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
      />
    </FormLayout>
  );
}

const styles = StyleSheet.create({
  fullInput: { marginBottom: 15 },
  grid: { ...COMMON_STYLE_VALUES.rowBetween, flexWrap: 'wrap', marginTop: 5 },
});