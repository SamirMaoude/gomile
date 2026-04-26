import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// On récupère "title" en paramètre
export default function Header({ title }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[
      styles.headerContainer, 
      { 
        paddingTop: insets.top + 10, 
        backgroundColor: '#1A3C5A' // On garde ton fond bleu GoMile
      } 
    ]}>
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  headerTitle: {
    color: '#FFFFFF', // Texte blanc sur fond bleu
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});