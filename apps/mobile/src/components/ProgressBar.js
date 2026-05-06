import React from 'react';
import { View } from 'react-native';
import { COLORS } from '../constants/theme';

export default function ProgressBar({ progress }) {
  return (
    <View style={{ height: 6, backgroundColor: COLORS.border }}>
      <View style={{ height: '100%', backgroundColor: COLORS.secondary, width: `${progress}%` }} />
    </View>
  );
}