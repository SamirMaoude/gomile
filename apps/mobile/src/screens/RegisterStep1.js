import React from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import { useRegistrationStore } from '../store/useRegistrationStore';
import Header from '../components/Header';

export default function RegisterStep1({ navigation }) {
  const { 
    updateField, 
    nextStep, 
    firstName, 
    lastName, 
    email, 
    phone, 
    birthDate, 
    gender 
  } = useRegistrationStore();

  return (
    <View style={styles.container}>
      <Header title="IDENTITÉ" />

      <View style={styles.progressBar}>
        <View style={[styles.progressLine, { width: '25%' }]} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Informations personnelles (1/4)</Text>

          {/* PRÉNOM & NOM */}
          <Text style={styles.label}>Prénom</Text>
          <TextInput 
            style={styles.input} 
            value={firstName}
            onChangeText={(v) => updateField('firstName', v)}
            placeholder="Jean"
          />

          <Text style={styles.label}>Nom</Text>
          <TextInput 
            style={styles.input} 
            value={lastName}
            onChangeText={(v) => updateField('lastName', v)}
            placeholder="Dupont"
          />

          {/* DATE DE NAISSANCE (Clavier numérique pour faciliter) */}
          <Text style={styles.label}>Date de naissance</Text>
          <TextInput 
            style={styles.input} 
            value={birthDate}
            onChangeText={(v) => updateField('birthDate', v)}
            placeholder="JJ/MM/AAAA"
            keyboardType="numbers-and-punctuation" 
          />

          {/* GENRE (Sélecteur simple) */}
          <Text style={styles.label}>Genre</Text>
          <View style={styles.genderContainer}>
            {['Homme', 'Femme', 'Autre'].map((item) => (
              <TouchableOpacity 
                key={item}
                style={[styles.genderButton, gender === item && styles.genderButtonActive]}
                onPress={() => updateField('gender', item)}
              >
                <Text style={[styles.genderText, gender === item && styles.genderTextActive]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* CONTACT */}
          <Text style={styles.label}>Email professionnel</Text>
          <TextInput 
            style={styles.input} 
            value={email}
            onChangeText={(v) => updateField('email', v)}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="nom@exemple.com"
          />

          <Text style={styles.label}>Numéro de téléphone</Text>
          <TextInput 
            style={styles.input} 
            value={phone}
            onChangeText={(v) => updateField('phone', v)}
            keyboardType="phone-pad"
            placeholder="06 12 34 56 78"
          />

          <TouchableOpacity 
            style={styles.nextButton} 
            onPress={() => navigation.navigate('RegisterStep2')}
          >
            <Text style={styles.nextButtonText}>CONTINUER</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F2' },
  progressBar: { height: 6, backgroundColor: '#DDD' },
  progressLine: { height: '100%', backgroundColor: '#8BC34A' },
  scrollContent: { padding: 25, paddingBottom: 50 },
  title: { fontSize: 20, fontWeight: '800', color: '#1A3C5A', marginBottom: 10 },
  label: { color: '#1A3C5A', fontWeight: '600', marginBottom: 5, marginTop: 15 },
  input: { borderWidth: 1, borderColor: '#DDD', padding: 12, borderRadius: 10, backgroundColor: '#FFF' },
  
  // Style pour le genre
  genderContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  genderButton: { flex: 1, padding: 10, borderWidth: 1, borderColor: '#DDD', borderRadius: 10, alignItems: 'center', marginHorizontal: 2, backgroundColor: '#FFF' },
  genderButtonActive: { backgroundColor: '#1A3C5A', borderColor: '#1A3C5A' },
  genderText: { color: '#666', fontWeight: '600' },
  genderTextActive: { color: '#FFF' },

  nextButton: { backgroundColor: '#1A3C5A', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 35 },
  nextButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});