import React from 'react';
import { View, StyleSheet } from 'react-native';
import GoMileButton from './GoMileButton';

export default function FormButtons({ 
  onBack, 
  onNext, 
  nextTitle = "CONTINUER", 
  backTitle = "RETOUR",
  nextLoading = false,
  nextDisabled = false 
}) {
  return (
    <View style={styles.buttonRow}>
      <GoMileButton 
        title={backTitle} 
        type="secondary" 
        outline 
        flex={1} 
        onPress={onBack} 
      />
      <GoMileButton 
        title={nextTitle} 
        type="secondary" 
        flex={2} 
        onPress={onNext} 
        loading={nextLoading}
        disabled={nextDisabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  buttonRow: { 
    flexDirection: 'row', 
    gap: 15, 
    marginTop: 30,
    alignItems: 'center'
  },
});