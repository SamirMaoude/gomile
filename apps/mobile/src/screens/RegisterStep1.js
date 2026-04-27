import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Keyboard, TouchableOpacity, Platform, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import FormLayout from '../components/FormLayout';
import SectionTitle from '../components/SectionTitle';
import GoMileInput from '../components/GoMileInput';
import SmartTouch from '../components/SmartTouch';
import FormButtons from '../components/FormButtons'; // Le nouveau composant pour les boutons alignés

// Config et Store
import { COLORS } from '../constants/theme';
import { COMMON_STYLE_VALUES } from '../styles/commonStyles';
import { useRegistrationStore } from '../store/useRegistrationStore';

export default function RegisterStep1({ navigation }) {
  const { updateField, firstName, lastName, email, phone, password, birthDate, gender } = useRegistrationStore();
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Gestion de la fermeture automatique
  useEffect(() => {
    const keyboardListener = Keyboard.addListener('keyboardDidShow', () => setShowDatePicker(false));
    return () => keyboardListener.remove();
  }, []);

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (event?.type !== 'set') return;
    }

    if (selectedDate) {
      updateField('birthDate', selectedDate.toISOString().split('T')[0]);
    }
  };

  const handleNext = () => {
    if (!firstName || !lastName || !email || !phone || !password || !birthDate || !gender) {
      Alert.alert(
        "Champs manquants", 
        "Veuillez remplir toutes les informations avant de continuer."
      );
      return;
    }

    // Si tout est bon, on passe à la suite
    navigation.navigate('RegisterStep2');
  };

  return (
    <FormLayout title="IDENTITÉ" progress={25}>
      <SectionTitle>Informations personnelles (1/4)</SectionTitle>

      {/* INPUTS FACTORISÉS */}
      <GoMileInput 
        label="Prénom" value={firstName} 
        onChangeText={(v) => updateField('firstName', v)} 
        placeholder="Jean" 
        onFocus={() => setShowDatePicker(false)} 
      />

      <GoMileInput 
        label="Nom" value={lastName} 
        onChangeText={(v) => updateField('lastName', v)} 
        placeholder="Dupont" 
        onFocus={() => setShowDatePicker(false)} 
      />


      <GoMileInput 
        label="Email professionnel" value={email} 
        onChangeText={(v) => updateField('email', v)} 
        keyboardType="email-address" 
        placeholder="nom@exemple.com" 
        onFocus={() => setShowDatePicker(false)} 
      />

      <GoMileInput 
        label="Mot de passe" 
        value={password} 
        onChangeText={(v) => updateField('password', v)} 
        placeholder="••••••••" 
        onFocus={() => setShowDatePicker(false)} 
      />

      <GoMileInput 
        label="Numéro de téléphone" value={phone} 
        onChangeText={(v) => updateField('phone', v)} 
        keyboardType="phone-pad" 
        placeholder="06 12 34 56 78" 
        onFocus={() => setShowDatePicker(false)} 
      />

      {/* SÉLECTEUR DE DATE (Spécifique à cette page) */}
      <Text style={styles.label}>Date de naissance</Text>
      <TouchableOpacity 
        style={styles.dateInput} 
        onPress={() => { Keyboard.dismiss(); setShowDatePicker(!showDatePicker); }}
      >
        <Text style={{ color: birthDate ? COLORS.secondary : COLORS.placeholder }}>
          {birthDate || "Sélectionner une date"}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker 
          value={birthDate ? new Date(birthDate) : new Date(2000, 0, 1)} 
          mode="date" 
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
        />
      )}

      {/* SÉLECTEUR DE GENRE */}
      <Text style={styles.label}>Genre</Text>
      <View style={styles.genderContainer}>
        {['Homme', 'Femme', 'Autre'].map((item) => (
          <SmartTouch 
            key={item} 
            setShowDatePicker={setShowDatePicker}
            style={[
              styles.genderButton, 
              gender === item && { backgroundColor: COLORS.secondary, borderColor: COLORS.secondary }
            ]}
            onPress={() => updateField('gender', item)}
          >
            <Text style={{ color: gender === item ? COLORS.white : COLORS.placeholder, fontWeight: '600' }}>
              {item}
            </Text>
          </SmartTouch>
        ))}
      </View>

      {/* NOUVEAU COMPOSANT DE BOUTONS (RETOUR + CONTINUER) */}
      <FormButtons 
        onBack={() => navigation.goBack()} 
        onNext={() => handleNext()} 
      />
      
    </FormLayout>
  );
}

const styles = StyleSheet.create({
  label: { ...COMMON_STYLE_VALUES.textSecondary, fontWeight: '600', marginBottom: 5, marginTop: 15 },
  dateInput: { 
    borderWidth: 1, 
    borderColor: COLORS.border, 
    padding: 15, 
    borderRadius: 10, 
    backgroundColor: COLORS.white 
  },
  genderContainer: { ...COMMON_STYLE_VALUES.rowBetween, marginTop: 5 },
  genderButton: { 
    flex: 1, 
    padding: 10, 
    marginBottom : 20,
    borderWidth: 1, 
    borderColor: COLORS.border, 
    borderRadius: 10, 
    alignItems: 'center', 
    marginHorizontal: 2, 
    backgroundColor: COLORS.white 
  },
});