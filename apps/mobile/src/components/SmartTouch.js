import React from 'react';
import { TouchableOpacity, Keyboard } from 'react-native';

export default function SmartTouch({ onPress, children, style, setShowDatePicker }) {
  return (
    <TouchableOpacity 
      style={style} 
      activeOpacity={0.8}
      onPress={() => {
        Keyboard.dismiss();
        if (setShowDatePicker) setShowDatePicker(false);
        if (onPress) onPress();
      }}
    >
      {children}
    </TouchableOpacity>
  );
}