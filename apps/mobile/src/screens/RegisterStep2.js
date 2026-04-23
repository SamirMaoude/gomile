import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRegistrationStore } from '../store/useRegistrationStore';

import FormLayout from '../components/FormLayout';
import GoMileInput from '../components/GoMileInput';
import FormButtons from '../components/FormButtons';
import OptionCard from '../components/OptionCard';
import SectionTitle from '../components/SectionTitle';
import AddressAutocomplete from '../components/AddressAutocomplete';
import { COMMON_STYLE_VALUES } from '../styles/commonStyles';

export default function RegisterStep2({ navigation }) {
  // On récupère tout du store pour que rien ne disparaisse au retour (Back)
  const { 
    updateField, address, city, zipCode, 
    transportType, deliveryCity, deliveryRadius
  } = useRegistrationStore();

  const onSelectAddress = (data) => {
    updateField('address', data.fullAddress);
    updateField('city', data.city);
    updateField('zipCode', data.zip);
    updateField('street', data.street);
    
    // Auto-remplissage de la ville de livraison avec la ville de résidence
    if (!deliveryCity) {
      updateField('deliveryCity', data.city);
    }
  };

  const handleNext = () => {
    // Validation stricte : Tous les champs obligatoires
    if (!address || !city) return Alert.alert("Champs requis", "Veuillez sélectionner une adresse valide.");
    if (!deliveryCity) return Alert.alert("Champs requis", "Indiquez votre ville de livraison.");
    if (!deliveryRadius) return Alert.alert("Champs requis", "Indiquez votre rayon d'action.");
    if (!transportType) return Alert.alert("Champs requis", "Choisissez un mode de transport.");

    navigation.navigate('RegisterStep3');
  };

  return (
    <FormLayout title="TRANSPORT" progress={50}>
      <SectionTitle>Logistique (2/4)</SectionTitle>

      <AddressAutocomplete 
        label="Adresse de résidence"
        value={address}
        updateValue={(v) => updateField('address', v)}
        onAddressSelect={onSelectAddress}
      />

      <View style={styles.detailsRow}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <GoMileInput 
            label="Ville de livraison" 
            value={deliveryCity} 
            onChangeText={(v) => updateField('deliveryCity', v)} 
          />
        </View>
        <View style={{ width: 120 }}>
          <GoMileInput 
            label="Rayon (km)" 
            keyboardType="numeric"
            value={deliveryRadius} 
            onChangeText={(v) => updateField('deliveryRadius', String(v).replace(/[^0-9]/g, ''))}
          />
        </View>
      </View>

      <SectionTitle style={{ marginTop: 25 }}>Mode de transport</SectionTitle>
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
  detailsRow: { ...COMMON_STYLE_VALUES.rowCenter, marginTop: 5 },
  grid: { ...COMMON_STYLE_VALUES.rowBetween, flexWrap: 'wrap', marginTop: 5 },
});