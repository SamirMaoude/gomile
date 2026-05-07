import { create } from 'zustand';
import {
  getAvailableMissions,
  getActiveMissions,
  getMissionHistory,
} from '../../lib/driver-client';
import { geocodeAddress } from '../../lib/geocode';
import { saveActiveMission, loadActiveMission } from '../../lib/mission-storage';

const DEFAULT_COORDS = { latitude: 45.1885, longitude: 5.7245 };

async function toMissionCard(mission) {
  let pickup = mission.pickupLocation ?? await geocodeAddress(mission.pickupAddress);
  let dropoff = mission.dropoffLocation ?? await geocodeAddress(mission.dropOffAddress);

  pickup = pickup ?? DEFAULT_COORDS;
  dropoff = dropoff ?? DEFAULT_COORDS;

  return {
    id: mission.id,
    type: mission.type || 'Mission',
    store: mission.store || 'Commerce partenaire',
    storeAddress: mission.pickupAddress || 'Adresse pick-up indisponible',
    customerArea: mission.dropOffAddress || 'Adresse livraison indisponible',
    reward: String(mission.reward ?? 0),
    distance: `${mission.distanceKm ?? 0} km`,
    eta: '--',
    notes: 'Suivre les instructions de livraison.',
    mapRegion: {
      latitude: pickup.latitude,
      longitude: pickup.longitude,
      latitudeDelta: 0.03,
      longitudeDelta: 0.03,
    },
    pickup,
    dropoff,
  };
}

export const useMissionStore = create((set, get) => ({
  // ── Mission active (en cours de livraison) ──────────────────────────────────
  activeMission: null,
  merchantVerified: false,
  clientVerified: false,

  acceptMission: (mission) => {
    const m = { ...mission, status: 'active' };
    saveActiveMission(m);
    set({ activeMission: m, merchantVerified: false, clientVerified: false });
  },
  markMerchantVerified: () => set({ merchantVerified: true }),
  markClientVerified: () => set({ clientVerified: true }),
  clearMission: () => {
    saveActiveMission(null);
    set({ activeMission: null, merchantVerified: false, clientVerified: false });
  },
  initStore: async () => {
    const saved = await loadActiveMission();
    if (saved) set({ activeMission: saved });
  },

  // ── Missions refusées ───────────────────────────────────────────────────────
  declinedMissionIds: [],

  declineMission: (missionId) =>
    set((state) => ({
      declinedMissionIds: [...state.declinedMissionIds, missionId],
      // Retrait immédiat de la liste — les deux écrans se mettent à jour instantanément
      availableMissions: state.availableMissions.filter((m) => m.id !== missionId),
    })),

  // ── Missions disponibles (état partagé Dashboard + MissionsScreen) ──────────
  availableMissions: [],
  activeMissions: [],
  historyMissions: [],
  lastRefreshAt: null,
  isLoadingMissions: false,

  // Fetch léger : seulement les missions disponibles (Dashboard)
  fetchAvailableMissions: async () => {
    const { declinedMissionIds, availableMissions } = get();
    try {
      const raw = await getAvailableMissions();
      const filtered = (raw || []).filter((m) => !declinedMissionIds.includes(m.id));
      const mapped = await Promise.all(filtered.map(toMissionCard));

      const previousIds = new Set(availableMissions.map((m) => m.id));
      const newMissions = mapped.filter((m) => !previousIds.has(m.id));

      set({ availableMissions: mapped, lastRefreshAt: new Date() });
      return newMissions; // retourné pour déclencher la notification
    } catch {
      console.warn('[useMissionStore] fetchAvailableMissions failed');
      return [];
    }
  },

  // Fetch complet : disponibles + actives + historique (MissionsScreen)
  fetchAllMissions: async () => {
    const { declinedMissionIds, availableMissions } = get();
    set({ isLoadingMissions: true });
    try {
      const [raw, active, history] = await Promise.all([
        getAvailableMissions(),
        getActiveMissions(),
        getMissionHistory(),
      ]);

      const filtered = (raw || []).filter((m) => !declinedMissionIds.includes(m.id));
      const mapped = await Promise.all(filtered.map(toMissionCard));
      const mappedActive = await Promise.all((active || []).map(toMissionCard));

      const previousIds = new Set(availableMissions.map((m) => m.id));
      const newMissions = mapped.filter((m) => !previousIds.has(m.id));

      set({
        availableMissions: mapped,
        activeMissions: mappedActive,
        historyMissions: (history || []).map((item) => ({
          id: item.id,
          store: item.store || 'Commerce partenaire',
          date: item.status || 'DELIVERED',
          reward: String(item.reward ?? 0),
        })),
        lastRefreshAt: new Date(),
        isLoadingMissions: false,
      });

      // Restaure activeMission depuis l'API si le store est vide (ex: redémarrage app)
      if (!get().activeMission && mappedActive.length > 0) {
        saveActiveMission(mappedActive[0]);
        set({ activeMission: mappedActive[0] });
      }

      return newMissions;
    } catch {
      console.warn('[useMissionStore] fetchAllMissions failed');
      set({ isLoadingMissions: false });
      return [];
    }
  },
}));
