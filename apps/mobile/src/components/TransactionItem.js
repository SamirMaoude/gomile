import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

export default function TransactionItem({ label, date, amount }) {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.date}>{date}</Text>
      </View>
      <Text style={styles.amount}>+{amount} €</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    backgroundColor: COLORS.white, padding: 15, borderRadius: 12, marginBottom: 10,
    borderWidth: 1, borderColor: COLORS.border 
  },
  label: { fontWeight: '700', color: COLORS.secondary },
  date: { fontSize: 12, color: COLORS.placeholder },
  amount: { fontWeight: '800', color: COLORS.primary }
});