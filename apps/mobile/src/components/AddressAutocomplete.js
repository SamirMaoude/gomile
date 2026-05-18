
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Keyboard } from 'react-native';
import GoMileInput from './GoMileInput';
import { COLORS } from '../constants/theme';

/**
 * Composant d'autocomplétion d'adresse factorisé
 * @param {string} label - Libellé du champ
 * @param {string} value - Valeur actuelle (provenant du store)
 * @param {function} updateValue - Fonction pour mettre à jour la valeur brute pendant la saisie
 * @param {function} onAddressSelect - Callback renvoyant l'objet adresse complet une fois sélectionné
 */
export default function AddressAutocomplete({ label, value, onAddressSelect, updateValue }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fonction de recherche via l'API Gouv
  const fetchAddresses = async (text) => {
    updateValue(text); // Met à jour le store en temps réel

    if (text.length < 5) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      // Recherche limitée aux numéros de rue pour plus de précision logistique
      const response = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(text)}&limit=5&type=housenumber`
      );
      const data = await response.json();
      setSuggestions(data.features || []);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  // Gestion de la sélection d'une suggestion
  const handleSelect = (feature) => {
    const { label, city, postcode, name } = feature.properties;
    
    // On renvoie un objet structuré au composant parent
    onAddressSelect({
      fullAddress: label,
      city: city,
      zip: postcode,
      street: name
    });

    setSuggestions([]); // on Ferme la liste
    Keyboard.dismiss(); // on Ferme le clavier aussi
  };

  return (
    <View style={styles.container}>
      <GoMileInput 
        label={label}
        placeholder="Rechercher une adresse..."
        value={value}
        onChangeText={fetchAddresses}
      />

      {/* Indicateur de chargement intégré au champ */}
      {loading && (
        <ActivityIndicator 
          style={styles.loader} 
          color={COLORS.primary} 
        />
      )}

      {/* Liste déroulante des suggestions */}
      {suggestions.length > 0 && (
        <View style={styles.dropdown}>
          {suggestions.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.suggestionRow} 
              onPress={() => handleSelect(item)}
            >
              <Text style={styles.suggestionText}>{item.properties.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    zIndex: 100, 
    position: 'relative' 
  },
  loader: { 
    position: 'absolute', 
    right: 15, 
    top: 45 
  },
  dropdown: {
    position: 'absolute', 
    top: 85, 
    left: 0, 
    right: 0,
    backgroundColor: COLORS.white, 
    borderRadius: 10, 
    elevation: 10, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, 
    shadowRadius: 5, 
    borderWidth: 1, 
    borderColor: COLORS.border,
  },
  suggestionRow: { 
    padding: 15, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F0F0F0' 
  },
  suggestionText: { 
    color: COLORS.secondary, 
    fontSize: 13 
  },
});