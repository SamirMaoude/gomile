import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/theme';

const getFileExtension = (filePath) => {
  if (!filePath) return '';
  const parts = filePath.split('.');
  return parts[parts.length - 1].toUpperCase();
};

const getFileName = (filePath) => {
  if (!filePath) return '';
  const parts = filePath.split('/');
  return parts[parts.length - 1];
};

const isImagePath = (filePath) => {
  if (!filePath) return false;
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  const ext = getFileExtension(filePath).toLowerCase();
  return imageExtensions.includes(ext);
};

export default function DocPicker({
  label,
  value,
  onPress,
  placeholderText = '+ Ajouter le document',
  shape = 'rectangle',
  isImage = false,
}) {
  const isCircle = shape === 'circle';
  const showAsImage = isImage || isImagePath(value);
  const fileName = getFileName(value);
  const fileExtension = getFileExtension(value);

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
          showAsImage ? (
            <Image
              source={{ uri: value }}
              style={[styles.previewImage, isCircle && styles.circlePreviewImage]}
            />
          ) : (
            <View style={styles.documentPreview}>
              <Text style={styles.documentIcon}>📄</Text>
              <Text style={styles.documentName} numberOfLines={2}>{fileName}</Text>
              <Text style={styles.documentExtension}>{fileExtension}</Text>
            </View>
          )
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
  documentPreview: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    gap: 4,
  },
  documentIcon: {
    fontSize: 32,
  },
  documentName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.secondary,
    textAlign: 'center',
  },
  documentExtension: {
    fontSize: 11,
    color: COLORS.placeholder,
    fontWeight: '500',
  },
});