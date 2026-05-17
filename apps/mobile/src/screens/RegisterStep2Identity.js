import React, { useState } from 'react';
import { Alert, StyleSheet, View, Text, TouchableOpacity, Platform, Keyboard } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import FormLayout from '../components/FormLayout';
import SectionTitle from '../components/SectionTitle';
import DocPicker from '../components/DocPicker';
import FormButtons from '../components/FormButtons';
import SmartTouch from '../components/SmartTouch';
import GoMileInput from '../components/GoMileInput';
import { useRegistrationStore } from '../store/useRegistrationStore';
import { COMMON_STYLE_VALUES } from '../styles/commonStyles';
import { COLORS } from '../constants/theme';
import { pickImageSource } from '../lib/media-picker';

export default function RegisterStep2Identity({ navigation }) {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const {
    updateField,
    birthDate,
    gender,
    phone,
    avatarUrl,
  } = useRegistrationStore();

  const handlePickAvatar = async () => {
    try {
      const uri = await pickImageSource();
      if (uri) {
        updateField('avatarUrl', uri);
      }
    } catch (error) {
      Alert.alert('Erreur', error.message || 'Impossible d’ouvrir le sélecteur.');
    }
  };

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
      updateField('birthDate', dateStr);
    }
  };

  const handleNext = () => {
    if (!phone) return Alert.alert('Champs requis', 'Veuillez renseigner votre numéro de téléphone.');
    if (!birthDate) return Alert.alert('Champs requis', 'Veuillez renseigner votre date de naissance.');
    if (!gender) return Alert.alert('Champs requis', 'Veuillez choisir votre genre.');

    navigation.navigate('RegisterStep2');
  };

  return (
    <FormLayout title="IDENTITÉ" progress={40}>
      <SectionTitle>Complète ton identité (2/3)</SectionTitle>

      <DocPicker
        label="Photo de profil"
        value={avatarUrl}
        onPress={handlePickAvatar}
        placeholderText="+ Ajouter une photo"
        shape="circle"
      />

      <GoMileInput
        label="Numéro de téléphone"
        value={phone}
        onChangeText={(v) => updateField('phone', v)}
        keyboardType="phone-pad"
        placeholder="06 12 34 56 78"
        containerStyle={styles.fullInput}
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
          value={birthDate ? new Date(birthDate + 'T00:00:00') : new Date(2000, 0, 1)} 
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

      <FormButtons
        onBack={() => navigation.goBack()}
        onNext={handleNext}
      />
    </FormLayout>
  );
}

const styles = StyleSheet.create({
  fullInput: { marginBottom: 15 },
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
    marginBottom: 20,
    borderWidth: 1, 
    borderColor: COLORS.border, 
    borderRadius: 10, 
    alignItems: 'center', 
    marginHorizontal: 2, 
    backgroundColor: COLORS.white 
  },
});