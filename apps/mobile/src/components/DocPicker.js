import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/theme';

export default function DocPicker({
  label,
  value,
  onPress,
  placeholderText = '+ Ajouter le document',
  shape = 'rectangle',
}) {
  const isCircle = shape === 'circle';

  return (
    <View style={[styles.container, isCircle && styles.circleContainer]}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity 
        style={[
          styles.uploadBox,
          isCircle && styles.circleUploadBox,
          value && styles.uploadBoxActive,
        ]} 
        onPress={onPress}
      >
        {value ? (
          <Image
            source={{ uri: value }}
            style={[styles.previewImage, isCircle && styles.circlePreviewImage]}
          />
        ) : (
          <Text style={[styles.uploadText, isCircle && styles.circleUploadText]}>
            {placeholderText}
          </Text>
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
  circleContainer: {
    alignItems: 'center',
  },
  circleUploadBox: {
    width: 128,
    height: 128,
    borderRadius: 64,
    overflow: 'hidden',
  },
  uploadBoxActive: { borderColor: COLORS.primary, borderStyle: 'solid' },
  uploadText: { color: COLORS.placeholder, fontWeight: '600' },
  circleUploadText: { textAlign: 'center', paddingHorizontal: 12 },
  previewImage: { width: '100%', height: '100%', borderRadius: 10 },
  circlePreviewImage: { borderRadius: 64 },
});