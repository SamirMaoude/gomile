import { useEffect, useRef, useCallback } from 'react';
import { useIsFocused } from '@react-navigation/native';
import * as Location from 'expo-location';
import { useMissionStore } from '../store/useMissionStore';
import { useAvailabilityStore } from '../store/useAvailabilityStore';
import { notifyNewMissions } from '../lib/push-notifications';
import { updateDriverLocation } from '../../lib/driver-client';

const POLL_INTERVAL_MS = 10_000;

/**
 * Hook de polling partagé entre TableauDeBord et MissionsScreen.
 *
 * - Démarre le timer seulement si le livreur est en ligne ET l'écran est visible.
 * - S'arrête automatiquement si l'écran perd le focus ou si le livreur passe hors ligne.
 * - Déclenche une notification locale quand de nouvelles missions apparaissent.
 *
 * @param {{ fetchAll?: boolean }} options
 *   fetchAll=false → getAvailableMissions uniquement (Dashboard)
 *   fetchAll=true  → getAvailableMissions + getActiveMissions + history (MissionsScreen)
 */
export function useMissionsPoller({ fetchAll = false } = {}) {
  const isFocused = useIsFocused();
  const isOnline = useAvailabilityStore((s) => s.isOnline);
  const fetchAvailableMissions = useMissionStore((s) => s.fetchAvailableMissions);
  const fetchAllMissions = useMissionStore((s) => s.fetchAllMissions);
  const intervalRef = useRef(null);

  const fetch = fetchAll ? fetchAllMissions : fetchAvailableMissions;

  const poll = useCallback(async () => {
    // Rafraîchir la position avant de chercher les missions :
    // ST_DWithin retourne NULL si lastKnownLocation est NULL → aucune mission visible.
    try {
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      await updateDriverLocation(pos.coords.latitude, pos.coords.longitude);
    } catch (err) {
      console.warn('[useMissionsPoller] location update failed', err?.message ?? err);
      // Position non disponible, on tente quand même le fetch
    }

    try {
      const newMissions = await fetch();
      if (newMissions?.length > 0) {
        console.log(`[useMissionsPoller] ${newMissions.length} new missions detected`);
        notifyNewMissions(newMissions);
      }
    } catch (err) {
      console.warn('[useMissionsPoller] fetch failed', err?.message ?? err);
    }
  }, [fetch]);

  useEffect(() => {
    if (!isFocused || !isOnline) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    poll(); // premier appel immédiat
    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isFocused, isOnline, poll]);

  // Exposé pour le bouton "Rafraîchir" manuel
  return { refresh: poll };
}
