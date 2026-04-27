import React from 'react';
import { View, StyleSheet } from 'react-native';
import OptionCard from './OptionCard';

export default function MultiOptionGrid({ options, selectedValues = [], onToggle }) {
  return (
    <View style={styles.grid}>
      {options.map((option) => {
        const isSelected = selectedValues.includes(option.value);
        return (
          <OptionCard
            key={option.value}
            label={option.label}
            active={isSelected}
            onPress={() => {
              if (isSelected) {
                onToggle(selectedValues.filter(v => v !== option.value));
              } else {
                onToggle([...selectedValues, option.value]);
              }
            }}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 5 },
});