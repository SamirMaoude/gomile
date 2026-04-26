import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Header from '../components/Header';

export default function MissionsScreen() {
  return (
    <View style={styles.container}>
      <Header title="MES MISSIONS" />
      <View style={styles.content}>
        <Text>Nous relechissons sur votre profil.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F2' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});