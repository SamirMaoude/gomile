import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert, Keyboard, TouchableOpacity } from 'react-native';
import { login } from '../../lib/auth-client';
import { registerDriverPushToken } from '../lib/push-notifications';
import Header from '../components/Header';
import GoMileInput from '../components/GoMileInput';
import GoMileButton from '../components/GoMileButton';
import { COLORS } from '../constants/theme';
import ScreenWrapper from '../components/ScreenWrapper';
import { COMMON_STYLE_VALUES } from '../styles/commonStyles';

function AuthDivider() {
  return (
    <View style={styles.dividerContainer}>
      <View style={styles.dividerLine} />
      <Text style={styles.dividerText}>OU</Text>
      <View style={styles.dividerLine} />
    </View>
  );
}

export default function LoginScreen({ navigation }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    Keyboard.dismiss();
    if (!identifier || !password) return Alert.alert("Erreur", "Remplissez tout.");

    setIsLoading(true);
    try {
      await login({ identifier, password });
      registerDriverPushToken();
      navigation.replace('MainApp');
    } catch (error) {
      Alert.alert("Erreur", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToRegister = () => {
    navigation.navigate('RegisterStep1');
  };

  const handleGoToForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  return (
    <ScreenWrapper>
      <Header title="BIENVENUE" />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
        <View style={styles.card}>
          <GoMileInput label="Email" value={identifier} onChangeText={setIdentifier} placeholder="votre@email.com"  keyboardType="email-address"/>
          <GoMileInput label="Mot de passe" value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" />

          <TouchableOpacity onPress={handleGoToForgotPassword} style={styles.forgotPasswordContainer}>
            <Text style={styles.forgotPasswordText}>Mot de passe oublié?</Text>
          </TouchableOpacity>

          <GoMileButton title="SE CONNECTER" type="secondary" onPress={handleLogin} loading={isLoading} />

          <AuthDivider />

          <GoMileButton title="DEVENIR LIVREUR" type="primary" outline onPress={handleGoToRegister} />
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: { ...COMMON_STYLE_VALUES.flex1, justifyContent: 'center', padding: 20 },
  card: { ...COMMON_STYLE_VALUES.cardSurface, padding: 25, borderRadius: 20, elevation: 5 },
  dividerContainer: { ...COMMON_STYLE_VALUES.rowCenter, marginVertical: 20 },
  dividerLine: {flex: 1, height: 1,backgroundColor: COLORS.border,},
  dividerText: {paddingHorizontal: 10, color: COLORS.textLight || '#888', fontSize: 14, fontWeight: '600',},
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 15,
    marginTop: -10,
  },
  forgotPasswordText: {
    color: COLORS.secondary || '#1E88E5',
    fontSize: 13,
    fontWeight: '600',
  },
});