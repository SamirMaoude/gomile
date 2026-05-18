import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, Alert, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';
import { useAvailabilityStore } from '../store/useAvailabilityStore';
import { useMissionStore } from '../store/useMissionStore';
import { toggleDriverAvailability } from '../../lib/driver-client';

export default function Header({ title, showAvailabilityToggle = false }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isOnline = useAvailabilityStore((state) => state.isOnline);
  const setOnlineStatus = useAvailabilityStore((state) => state.setOnlineStatus);
  const isCompactScreen = width < 360;
  const [isToggling, setIsToggling] = useState(false);

  const handleToggleAvailability = async () => {
    if (isToggling) return;

    if (isOnline && useMissionStore.getState().missionQueue.length > 0) {
      Alert.alert('Mission en cours', 'Tu ne peux pas passer hors ligne pendant une mission active.');
      return;
    }

    setIsToggling(true);
    try {
      await toggleDriverAvailability();
      setOnlineStatus(!isOnline);
    } catch {
      // Ne bloque pas l'UI si la sync backend échoue ponctuellement.
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <View style={[styles.header, { paddingTop: insets.top + 10, backgroundColor: COLORS.primary }]}>
      <Text
        style={[
          styles.title,
          isCompactScreen && styles.titleCompact,
        ]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {title}
      </Text>

      {showAvailabilityToggle && (
        <View style={styles.availabilityControl}>
          <Text style={[styles.availabilityText, isOnline ? styles.onlineText : styles.offlineText]}>
            {isOnline ? 'EN LIGNE' : 'HORS LIGNE'}
          </Text>
          <Switch
            value={isOnline}
            onValueChange={handleToggleAvailability}
            disabled={isToggling}
            trackColor={{ false: '#8FA3BF', true: '#49C96D' }}
            thumbColor={COLORS.white}
            ios_backgroundColor="#8FA3BF"
            accessibilityLabel="Basculer le statut en ligne ou hors ligne"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 15,
    elevation: 4,
    position: 'relative',
  },
  title: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
    textAlign: 'center',
    width: '100%',
  },
  titleCompact: {
    fontSize: 16,
  },
  availabilityControl: {
    position: 'absolute',
    right: 10,
    bottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  availabilityText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
    lineHeight: 11,
  },
  onlineText: {
    color: '#B9F6CA',
  },
  offlineText: {
    color: '#E0E6EF',
  },
});