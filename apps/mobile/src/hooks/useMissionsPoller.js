import { useEffect, useCallback } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { useMissionStore } from '../store/useMissionStore';
import { useAvailabilityStore } from '../store/useAvailabilityStore';
import { notifyNewMissions } from '../lib/push-notifications';

/**
 * Hook partagé entre TableauDeBord et MissionsScreen.
 *
 * - Fait un fetch unique quand l'écran gagne le focus ET que le livreur est en ligne.
 * - Le polling périodique est supprimé : les nouvelles missions arrivent via WebSocket
 *   (géré dans MainTabs). Ce hook sert uniquement au chargement initial par écran
 *   et au bouton "Rafraîchir" manuel.
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

  const fetch = fetchAll ? fetchAllMissions : fetchAvailableMissions;

  const poll = useCallback(async () => {
    try {
      const newMissions = await fetch();
      if (newMissions?.length > 0) {
        notifyNewMissions(newMissions);
      }
    } catch (err) {
      console.warn('[useMissionsPoller] fetch failed', err?.message ?? err);
    }
  }, [fetch]);

  // Fetch unique à l'entrée sur l'écran (ou au passage en ligne)
  useEffect(() => {
    if (!isFocused || !isOnline) return;
    poll();
  }, [isFocused, isOnline, poll]);

  return { refresh: poll };
}
