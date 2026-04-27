import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

export default function GoMileInput({ label, ...props }) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput 
        style={styles.input} 
        placeholderTextColor={COLORS.placeholder}
        {...props} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 15 },
  label: { color: COLORS.secondary, fontWeight: '600', marginBottom: 5 },
  input: { 
    borderWidth: 1, borderColor: COLORS.border, padding: 12, 
    borderRadius: 10, backgroundColor: COLORS.white, color: COLORS.secondary 
  },
});