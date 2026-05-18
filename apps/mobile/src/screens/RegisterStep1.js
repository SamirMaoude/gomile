import React from 'react';
import { Alert, StyleSheet, Text } from 'react-native';

import FormLayout from '../components/FormLayout';
import SectionTitle from '../components/SectionTitle';
import GoMileInput from '../components/GoMileInput';
import DocPicker from '../components/DocPicker';
import FormButtons from '../components/FormButtons';
import { pickImageSource } from '../lib/media-picker';
import { COLORS } from '../constants/theme';
import { useRegistrationStore } from '../store/useRegistrationStore';

export default function RegisterStep1({ navigation }) {
  const {
    updateField,
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
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

  const handleNext = async () => {
    if (!avatarUrl || !firstName || !lastName || !email || !password || !confirmPassword) {
      Alert.alert('Champs manquants', 'Veuillez remplir toutes les informations avant de continuer.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Le mot de passe et sa confirmation ne correspondent pas.');
      return;
    }

    navigation.navigate('RegisterStep2Identity');
  };

  return (
    <FormLayout title="IDENTITÉ" progress={20}>
      <SectionTitle>Informations de base (1/3)</SectionTitle>

      <DocPicker
        label="Photo de profil"
        value={avatarUrl}
        onPress={handlePickAvatar}
        placeholderText="+ Ajouter une photo"
        shape="circle"
        isImage={true}
      />

      <GoMileInput
        label="Prénom"
        value={firstName}
        onChangeText={(v) => updateField('firstName', v)}
        placeholder="Jean"
        autoCapitalize="words"
        containerStyle={styles.fullInput}
      />

      <GoMileInput
        label="Nom"
        value={lastName}
        onChangeText={(v) => updateField('lastName', v)}
        placeholder="Dupont"
        autoCapitalize="words"
        containerStyle={styles.fullInput}
      />

      <GoMileInput
        label="Email"
        value={email}
        onChangeText={(v) => updateField('email', v)}
        keyboardType="email-address"
        placeholder="nom@exemple.com"
        containerStyle={styles.fullInput}
      />

      <GoMileInput
        label="Mot de passe"
        value={password}
        onChangeText={(v) => updateField('password', v)}
        placeholder="••••••••••••••••"
        containerStyle={styles.fullInput}
      />

      <GoMileInput
        label="Confirmation de Mot de passe"
        value={confirmPassword}
        onChangeText={(v) => updateField('confirmPassword', v)}
        placeholder="••••••••••••••••"
        containerStyle={styles.fullInput}
      />

      <Text style={styles.noteText}>
        Le numéro de téléphone, la date de naissance et le genre seront demandés à l'étape suivante.
      </Text>

      <FormButtons
        onBack={() => navigation.goBack()}
        onNext={handleNext}
      />
    </FormLayout>
  );
}

const styles = StyleSheet.create({
  photoHint: {
    marginTop: 4,
    marginBottom: 15,
    color: COLORS.textLight || '#666',
    fontSize: 13,
    textAlign: 'left',
    lineHeight: 18,
  },
  fullInput: {
    marginBottom: 15,
  },
  noteText: {
    marginTop: 4,
    marginBottom: 18,
    color: COLORS.textLight || '#666',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
  },
});
