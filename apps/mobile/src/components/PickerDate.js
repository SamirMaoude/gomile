import React, { useEffect, useState } from 'react';
import { Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import { COLORS } from '../constants/theme';

const pad = (value) => String(value).padStart(2, '0');

const formatDisplayDate = (date) => `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;

const formatStorageDate = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const parseValue = (value) => {
  if (!value) return new Date();

  const isoMatch = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const displayMatch = String(value).match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (displayMatch) {
    const [, day, month, year] = displayMatch;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

export default function PickerDate({ label, value, onChangeText, placeholder = 'JJ/MM/AAAA' }) {
  const [visible, setVisible] = useState(false);
  const [draftDate, setDraftDate] = useState(parseValue(value));

  useEffect(() => {
    if (!visible) {
      setDraftDate(parseValue(value));
    }
  }, [value, visible]);

  const confirmDate = () => {
    onChangeText(formatStorageDate(draftDate));
    setVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.input} onPress={() => setVisible(true)} activeOpacity={0.8}>
        <Text style={[styles.value, !value && styles.placeholder]}>
          {value ? formatDisplayDate(parseValue(value)) : placeholder}
        </Text>
      </TouchableOpacity>

      <Modal
        transparent
        visible={visible}
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Choisis ta date de naissance</Text>

            <DateTimePicker
              value={draftDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
              onChange={(_, selectedDate) => {
                if (selectedDate) {
                  setDraftDate(selectedDate);
                }
              }}
              maximumDate={new Date()}
            />

            <View style={styles.actions}>
              <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={() => setVisible(false)}>
                <Text style={styles.cancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, styles.confirmButton]} onPress={confirmDate}>
                <Text style={styles.confirmText}>Valider</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 15 },
  label: { color: COLORS.secondary, fontWeight: '600', marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    minHeight: 48,
    justifyContent: 'center',
  },
  value: { color: COLORS.secondary },
  placeholder: { color: COLORS.placeholder },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 18,
  },
  modalTitle: {
    color: COLORS.secondary,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F2F2F2',
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
  },
  cancelText: {
    color: COLORS.secondary,
    fontWeight: '700',
  },
  confirmText: {
    color: COLORS.white,
    fontWeight: '700',
  },
});