import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert, Keyboard } from 'react-native';
import { forgotPassword } from '../../lib/auth-client';
import Header from '../components/Header';
import GoMileInput from '../components/GoMileInput';
import GoMileButton from '../components/GoMileButton';
import { COLORS } from '../constants/theme';
import ScreenWrapper from '../components/ScreenWrapper';
import { COMMON_STYLE_VALUES } from '../styles/commonStyles';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async () => {
    Keyboard.dismiss();
    if (!email) {
      return Alert.alert("Erreur", "Veuillez entrer votre email.");
    }

    setIsLoading(true);
    try {
      await forgotPassword({ email: email.trim() });
      Alert.alert(
        "Succès",
        "Un code de réinitialisation a été envoyé à votre email.",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate('ResetPassword', { email: email.trim() }),
          },
        ]
      );
    } catch (error) {
      Alert.alert("Erreur", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.goBack();
  };

  return (
    <ScreenWrapper>
      <Header title="MOT DE PASSE OUBLIÉ" />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
        <View style={styles.card}>
          

          <GoMileInput 
            label="Email" 
            value={email} 
            onChangeText={setEmail} 
            placeholder="votre@email.com"
            keyboardType="email-address"
          />

            <Text style={styles.description}>
                Vous allez recevoir un Code de réinitialisation dans votre boîte mail
            </Text>

          <GoMileButton 
            title="ENVOYER LE CODE" 
            type="secondary" 
            onPress={handleForgotPassword} 
            loading={isLoading} 
            style={styles.primaryButton}
          />

          <GoMileButton 
            title="RETOUR À LA CONNEXION" 
            type="primary" 
            outline 
            onPress={handleBackToLogin} 
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
    padding: 20 
  },
  card: { 
    ...COMMON_STYLE_VALUES.cardSurface, 
    padding: 25, 
    borderRadius: 20, 
    elevation: 5 
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
    textAlign:'center'
  },
});
