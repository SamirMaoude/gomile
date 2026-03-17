import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Text, 
  KeyboardAvoidingView, 
  Platform,
  Alert 
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Header from '../components/Header';

export default function LoginScreen({ navigation }) {
  const [identifier, setIdentifier] = useState(''); // Email ou NumTel
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // if (!identifier || !password) {
    //   Alert.alert("Erreur", "Veuillez remplir tous les champs.");
    //   return;
    // }
    navigation.replace('MainApp');
  };

  const startRegistration = () => {
    // s'inscrire et devenir livreur : 
    navigation.navigate('RegisterStep1');
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <View style={styles.mainContainer}>
        <Header title="BIENVENUE" />
        
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.content}
        >
          <View style={styles.formCard}>
            <Text style={styles.welcomeTitle}>Espace Livreur</Text>
            
            <Text style={styles.label}>Email ou Numéro de téléphone</Text>
            <TextInput 
              style={styles.input}
              placeholder="votre@email.com ou 06..."
              value={identifier}
              onChangeText={setIdentifier}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Text style={styles.label}>Mot de passe</Text>
            <TextInput 
              style={styles.input}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
            />

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>SE CONNECTER</Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.line} />
              <Text style={styles.dividerText}>OU</Text>
              <View style={styles.line} />
            </View>

            <TouchableOpacity style={styles.registerButton} onPress={startRegistration}>
              <Text style={styles.registerButtonText}>DEVENIR LIVREUR GOMILE</Text>
            </TouchableOpacity>
          </View>
          
        </KeyboardAvoidingView>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  formCard: {
    backgroundColor: '#FFF',
    padding: 25,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A3C5A',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    color: '#1A3C5A',
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#FAFAFA',
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#1A3C5A',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 25,
  },
  loginButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 25,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#DDD',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#AAA',
    fontWeight: 'bold',
  },
  registerButton: {
    borderWidth: 2,
    borderColor: '#8BC34A', // Vert GoMile
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#8BC34A',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
