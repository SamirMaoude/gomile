import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

export default function SectionTitle({ children, style }) {
  return <Text style={[styles.title, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.secondary,
    marginBottom: 20
  }
});