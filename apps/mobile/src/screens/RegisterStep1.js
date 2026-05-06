import React, { useState } from 'react';
import { Alert, StyleSheet, Text, ActivityIndicator, View } from 'react-native';

import FormLayout from '../components/FormLayout';
import SectionTitle from '../components/SectionTitle';
import GoMileInput from '../components/GoMileInput';
import DocPicker from '../components/DocPicker';
import FormButtons from '../components/FormButtons';
import { pickImageSource } from '../lib/media-picker';
import { startDriverRegistration } from '../../lib/auth-client';
import { uploadLocalFile } from '../../lib/upload-client';
import { COLORS } from '../constants/theme';
import { useRegistrationStore } from '../store/useRegistrationStore';

export default function RegisterStep1({ navigation }) {
  const {
    updateField,
    firstName,
    lastName,
    email,
    phone,
    password,
    confirmPassword,
    avatarUrl,
  } = useRegistrationStore();

  const [isLoading, setIsLoading] = useState(false);

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
    if (!avatarUrl || !firstName || !lastName || !email || !phone || !password || !confirmPassword) {
      Alert.alert('Champs manquants', 'Veuillez remplir toutes les informations avant de continuer.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Le mot de passe et sa confirmation ne correspondent pas.');
      return;
    }

    setIsLoading(true);

    try {
      // Upload avatar if it's a local file (starts with file://)
      let uploadedAvatarUrl = avatarUrl;
      if (avatarUrl.startsWith('file://')) {
        const uploadedUrl = await uploadLocalFile(avatarUrl, 'avatars');
        if (uploadedUrl) {
          uploadedAvatarUrl = uploadedUrl;
          updateField('avatarUrl', uploadedAvatarUrl);
        }
      }

      // Register the driver with email verification
      await startDriverRegistration({
        firstName,
        lastName,
        email,
        phone,
        password,
        avatarUrl: uploadedAvatarUrl,
      });

      // Navigate to email verification screen
      navigation.navigate('EmailVerification');
    } catch (error) {
      Alert.alert('Erreur lors de l\'inscription', error.message || 'Une erreur s\'est produite.');
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormLayout title="IDENTITÉ" progress={25}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary || '#FF6B35'} />
          <Text style={styles.loadingText}>Inscription en cours...</Text>
        </View>
      ) : (
        <>
          <SectionTitle>Informations personnelles (1/4)</SectionTitle>

      <DocPicker
        label="Photo de profil"
        value={avatarUrl}
        onPress={handlePickAvatar}
        placeholderText="+ Ajouter une photo"
        shape="circle"
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
        label="Numéro de téléphone"
        value={phone}
        onChangeText={(v) => updateField('phone', v)}
        keyboardType="phone-pad"
        placeholder="06 12 34 56 78"
        containerStyle={styles.fullInput}
      />

      <GoMileInput
        label="Mot de passe"
        value={password}
        onChangeText={(v) => updateField('password', v)}
        placeholder="••••••••••••••••"
        secureTextEntry
        containerStyle={styles.fullInput}
      />

      <GoMileInput
        label="Confirmation de Mot de passe"
        value={confirmPassword}
        onChangeText={(v) => updateField('confirmPassword', v)}
        placeholder="••••••••••••••••"
        secureTextEntry
        containerStyle={styles.fullInput}
      />

      <Text style={styles.noteText}>
        La date de naissance et le genre seront demandés à l’étape suivante.
      </Text>

      <FormButtons
        onBack={() => navigation.goBack()}
        onNext={handleNext}
      />
        </>
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.text || '#1a1a1a',
    textAlign: 'center',
  },
});
