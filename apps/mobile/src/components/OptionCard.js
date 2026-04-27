import React from 'react';
import { Text, StyleSheet } from 'react-native';
import SmartTouch from './SmartTouch';
import { COLORS } from '../constants/theme';

export default function OptionCard({ label, active, onPress, width = '48%' }) {
  return (
    <SmartTouch 
      onPress={onPress}
      style={[
        styles.card, 
        { width },
        active && styles.activeCard
      ]}
    >
      <Text style={[styles.text, active && styles.activeText]}>
        {label}
      </Text>
    </SmartTouch>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center'
  },
  activeCard: {
    borderColor: COLORS.secondary,
    backgroundColor: '#E6F4FE', // Bleu très clair pour le focus
    borderWidth: 2
  },
  text: { fontWeight: 'bold', color: COLORS.placeholder },
  activeText: { color: COLORS.secondary }
});
