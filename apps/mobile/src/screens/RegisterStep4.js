import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRegistrationStore } from '../store/useRegistrationStore';
import Header from '../components/Header';

export default function RegisterStep4({ navigation }) {
  const { updateField, siret, kbisFile, ribFile } = useRegistrationStore();

  const pickDoc = async (field) => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (!result.canceled) updateField(field, result.assets[0].uri);
  };

  const handleFinish = () => {
    // Ici, on enverra tout l'objet Zustand à ton API NestJS plus tard
    Alert.alert(
      "Dossier complet !",
      "Tes informations ont été transmises à l'équipe GoMile pour validation.",
      [{ text: "OK", onPress: () => navigation.navigate('Login') }]
    );
    navigation.replace('MainApp');
  };

  return (
    <View style={styles.container}>
      <Header title="INFOS PRO" />
      <View style={styles.progressBar}><View style={[styles.progressLine, { width: '100%' }]} /></View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Dernière étape (4/4)</Text>

        <Text style={styles.label}>Numéro SIRET</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ex: 123 456 789 00012"
          value={siret}
          onChangeText={(v) => updateField('siret', v)}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Extrait KBIS (ou déclaration auto-entrepreneur)</Text>
        <TouchableOpacity style={styles.uploadBtn} onPress={() => pickDoc('kbisFile')}>
          <Text style={styles.uploadBtnText}>{kbisFile ? " KBIS Ajouté" : "Sélectionner le document"}</Text>
        </TouchableOpacity>

        <Text style={styles.label}>RIB (Pour tes futurs virements)</Text>
        <TouchableOpacity style={styles.uploadBtn} onPress={() => pickDoc('ribFile')}>
          <Text style={styles.uploadBtnText}>{ribFile ? " RIB Ajouté" : "Sélectionner le document"}</Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            En cliquant sur Terminer, tu certifies l'exactitude des documents fournis.
          </Text>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>RETOUR</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
            <Text style={styles.finishButtonText}>TERMINER</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F2' },
  progressBar: { height: 6, backgroundColor: '#DDD' },
  progressLine: { height: '100%', backgroundColor: '#8BC34A' },
  scrollContent: { padding: 25 },
  title: { fontSize: 20, fontWeight: '800', color: '#1A3C5A' },
  label: { color: '#1A3C5A', fontWeight: '600', marginBottom: 8, marginTop: 20 },
  input: { borderWidth: 1, borderColor: '#DDD', padding: 15, borderRadius: 10, backgroundColor: '#FFF' },
  uploadBtn: { padding: 15, borderRadius: 10, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#1A3C5A', borderStyle: 'dashed', alignItems: 'center' },
  uploadBtnText: { color: '#1A3C5A', fontWeight: 'bold' },
  infoBox: { marginTop: 20, padding: 15, backgroundColor: '#E3F2FD', borderRadius: 8 },
  infoText: { color: '#1A3C5A', fontSize: 12, textAlign: 'center' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30, marginBottom: 40 },
  backButton: { flex: 1, padding: 16, alignItems: 'center' },
  backButtonText: { color: '#666', fontWeight: 'bold' },
  finishButton: { flex: 2, backgroundColor: '#8BC34A', padding: 16, borderRadius: 10, alignItems: 'center' },
  finishButtonText: { color: '#FFF', fontWeight: 'bold' }
});