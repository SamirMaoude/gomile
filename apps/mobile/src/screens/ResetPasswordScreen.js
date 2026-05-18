import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Keyboard,
} from 'react-native';
import { verifyOtp, resetPassword } from '../../lib/auth-client';
import Header from '../components/Header';
import GoMileInput from '../components/GoMileInput';
import GoMileButton from '../components/GoMileButton';
import { COLORS } from '../constants/theme';
import ScreenWrapper from '../components/ScreenWrapper';
import { COMMON_STYLE_VALUES } from '../styles/commonStyles';

export default function ResetPasswordScreen({ route, navigation }) {
  const { email } = route.params ?? {};

  const [step, setStep] = useState('otp'); // 'otp' | 'newPassword'
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleVerifyOtp = async () => {
    Keyboard.dismiss();
    if (!otp) {
      return Alert.alert('Erreur', 'Veuillez entrer le code reçu par email.');
    }

    setIsLoading(true);
    try {
      const result = await verifyOtp({ email, otp });
      setResetToken(result.resetToken);
      setStep('newPassword');
    } catch (error) {
      Alert.alert('Code invalide', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    Keyboard.dismiss();
    if (!newPassword) {
      return Alert.alert('Erreur', 'Veuillez entrer un nouveau mot de passe.');
    }
    if (newPassword !== confirmPassword) {
      return Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
    }

    setIsLoading(true);
    try {
      await resetPassword({ email, resetToken, newPassword });
      Alert.alert(
        'Succès',
        'Votre mot de passe a été réinitialisé.',
        [{ text: 'Se connecter', onPress: () => navigation.navigate('Login') }],
      );
    } catch (error) {
      Alert.alert('Erreur', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <Header title="RÉINITIALISATION" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <View style={styles.card}>
          {step === 'otp' ? (
            <>
              <Text style={styles.description}>
                Entrez le code à 6 chiffres envoyé à {email}
              </Text>
              <GoMileInput
                label="Code de vérification"
                value={otp}
                onChangeText={setOtp}
                placeholder="000000"
                keyboardType="number-pad"
                maxLength={6}
              />
              <GoMileButton
                title="VÉRIFIER LE CODE"
                type="secondary"
                onPress={handleVerifyOtp}
                loading={isLoading}
                style={styles.primaryButton}
              />
            </>
          ) : (
          <>
            <Text style={styles.description}>
              Choisissez votre nouveau mot de passe
            </Text>
            <GoMileInput
              key="new-password-field" 
              label="Nouveau mot de passe"
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Nouveau mot de passe"
            />
            <GoMileInput
              key="confirm-password-field" 
              label="Confirmer le mot de passe"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirmer le mot de passe"
            />
            <GoMileButton
              title="RÉINITIALISER"
              type="secondary"
              onPress={handleResetPassword}
              loading={isLoading}
              style={styles.primaryButton}
            />
          </>
        )}
          <GoMileButton
            title="RETOUR"
            type="primary"
            outline
            onPress={() => navigation.goBack()}
            style={styles.secondaryButton}
          />
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    ...COMMON_STYLE_VALUES.flex1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    ...COMMON_STYLE_VALUES.cardSurface,
    padding: 25,
    borderRadius: 20,
    elevation: 5,
  },
  primaryButton: {
    marginBottom: 12,
  },
  secondaryButton: {
    marginTop: 4,
  },
  description: {
    fontSize: 14,
    color: COLORS.textLight || '#666',
    marginBottom: 20,
    lineHeight: 20,
    fontWeight: '500',
    textAlign: 'center',
  },
});
