import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/theme';

export default function DocPicker({ label, value, onPress }) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity 
        style={[styles.uploadBox, value && styles.uploadBoxActive]} 
        onPress={onPress}
      >
        {value ? (
          <Image source={{ uri: value }} style={styles.previewImage} />
        ) : (
          <Text style={styles.uploadText}>+ Ajouter le document</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  label: { color: COLORS.secondary, fontWeight: '600', marginBottom: 8 },
  uploadBox: { 
    height: 120, 
    borderWidth: 2, 
    borderStyle: 'dashed', 
    borderColor: COLORS.border, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: COLORS.white 
  },
  uploadBoxActive: { borderColor: COLORS.primary, borderStyle: 'solid' },
  uploadText: { color: COLORS.placeholder, fontWeight: '600' },
  previewImage: { width: '100%', height: '100%', borderRadius: 10 },
});