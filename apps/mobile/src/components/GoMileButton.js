import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Keyboard } from 'react-native';
import { COLORS } from '../constants/theme';

export default function GoMileButton({ title, onPress, type = 'secondary', loading, outline, style, flex }) {
  const bgColor = COLORS.primary;


  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        outline ? { borderColor: bgColor, borderWidth: 2 } : { backgroundColor: bgColor },
        flex ? { flex: flex } : null, 
        style
      ]}
      activeOpacity={0.8}
      onPress={() => {
        Keyboard.dismiss();
        if (onPress && !loading) onPress();
      }}
    >
      {loading ? (
        <ActivityIndicator color={outline ? bgColor : COLORS.white} />
      ) : (
        <Text style={[styles.text, { color: outline ? bgColor : COLORS.white }]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: { 
    padding: 16, 
    borderRadius: 10, 
    alignItems: 'center', 
    justifyContent: 'center',
    // On enlèeve le marginTop fixe pour que ce soit la page qui gère ses marges
  },
  text: { fontWeight: 'bold', fontSize: 16 },
});