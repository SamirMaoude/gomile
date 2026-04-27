import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';
import GoMileButton from './GoMileButton';

export default function BalanceCard({ amount, onAction }) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>Solde disponible</Text>
      <Text style={styles.amount}>{amount} €</Text>
      <GoMileButton 
        title="DEMANDER UN VIREMENT" 
        type="primary" 
        style={styles.button}
        onPress={onAction}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: COLORS.secondary, padding: 25, borderRadius: 20, alignItems: 'center', elevation: 5 },
  label: { color: COLORS.white, fontSize: 14, opacity: 0.8, fontWeight: '600' },
  amount: { color: COLORS.white, fontSize: 36, fontWeight: '900', marginTop: 5 },
  button: { marginTop: 20, width: '100%' }
});