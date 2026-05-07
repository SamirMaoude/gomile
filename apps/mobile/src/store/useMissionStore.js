import { create } from 'zustand';
import {
  getAvailableMissions,
  getActiveMissions,
  getMissionHistory,
} from '../../lib/driver-client';
import { geocodeAddress, reverseGeocodeCoords } from '../../lib/geocode';
import { saveMissionQueue, loadMissionQueue } from '../../lib/mission-storage';

const DEFAULT_COORDS = { latitude: 45.1885, longitude: 5.7245 };

async function toMissionCard(mission) {
  // rawPickup/rawDropoff = coords réelles ou null (jamais le fallback statique ici)
  const rawPickup  = mission.pickupLocation  ?? await geocodeAddress(mission.pickupAddress);
  const rawDropoff = mission.dropoffLocation ?? await geocodeAddress(mission.dropOffAddress);

  const pickup  = rawPickup  ?? DEFAULT_COORDS;
  const dropoff = rawDropoff ?? DEFAULT_COORDS;

  // Reverse geocoding uniquement si on a de vraies coordonnées, pas le fallback
  const storeAddress = mission.pickupAddress
    || (rawPickup  ? await reverseGeocodeCoords(rawPickup.latitude,  rawPickup.longitude)  : null)
    || 'Adresse pick-up indisponible';

  const customerArea = mission.dropOffAddress
    || (rawDropoff ? await reverseGeocodeCoords(rawDropoff.latitude, rawDropoff.longitude) : null)
    || 'Adresse livraison indisponible';

  return {
    id: mission.id,
    type: mission.type || 'Mission',
    store: mission.store || 'Commerce partenaire',
    storeAddress,
    customerArea,
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
  // ── File de missions en cours de livraison ─────────────────────────────────
  missionQueue: [],       // missions acceptées par le livreur
  focusedMissionId: null, // mission sélectionnée dans MissionFocusScreen
  missionStates: {},      // { [id]: { merchantVerified: bool, clientVerified: bool } }

  acceptMission: (mission) => {
    const m = { ...mission, status: 'active' };
    set((state) => {
      const alreadyIn = state.missionQueue.some((q) => q.id === m.id);
      return {
        missionQueue: alreadyIn ? state.missionQueue : [...state.missionQueue, m],
        focusedMissionId: m.id, // toujours focaliser la mission (même si déjà en queue)
        missionStates: alreadyIn
          ? state.missionStates
          : { ...state.missionStates, [m.id]: { merchantVerified: false, clientVerified: false } },
      };
    });
    const { missionQueue, missionStates, focusedMissionId } = get();
    saveMissionQueue(missionQueue, missionStates, focusedMissionId);
  },

  setFocusedMission: (id) => set({ focusedMissionId: id }),

  markMerchantVerified: (id) => {
    set((state) => ({
      missionStates: {
        ...state.missionStates,
        [id]: { ...state.missionStates[id], merchantVerified: true },
      },
    }));
    const { missionQueue, missionStates, focusedMissionId } = get();
    saveMissionQueue(missionQueue, missionStates, focusedMissionId);
  },

  markClientVerified: (id) => {
    set((state) => ({
      missionStates: {
        ...state.missionStates,
        [id]: { ...state.missionStates[id], clientVerified: true },
      },
    }));
    const { missionQueue, missionStates, focusedMissionId } = get();
    saveMissionQueue(missionQueue, missionStates, focusedMissionId);
  },

  clearMission: (id) => {
    set((state) => {
      const newQueue = state.missionQueue.filter((m) => m.id !== id);
      const { [id]: _removed, ...newStates } = state.missionStates;
      const newFocused =
        state.focusedMissionId === id ? (newQueue[0]?.id ?? null) : state.focusedMissionId;
      return { missionQueue: newQueue, missionStates: newStates, focusedMissionId: newFocused };
    });
    const { missionQueue, missionStates, focusedMissionId } = get();
    saveMissionQueue(missionQueue, missionStates, focusedMissionId);
  },

  initStore: async () => {
    // Ne pas écraser une queue déjà chargée en mémoire
    if (get().missionQueue.length > 0) return;
    const saved = await loadMissionQueue();
    if (saved?.missionQueue?.length > 0) {
      set({
        missionQueue: saved.missionQueue,
        missionStates: saved.missionStates ?? {},
        focusedMissionId: saved.focusedMissionId ?? saved.missionQueue[0]?.id ?? null,
      });
    }
  },

  // ── Missions refusées ──────────────────────────────────────────────────────
  declinedMissionIds: [],

  declineMission: (missionId) =>
    set((state) => ({
      declinedMissionIds: [...state.declinedMissionIds, missionId],
      availableMissions: state.availableMissions.filter((m) => m.id !== missionId),
    })),

  // ── Missions disponibles (polling) ─────────────────────────────────────────
  availableMissions: [],
  activeMissions: [],
  historyMissions: [],
  lastRefreshAt: null,
  isLoadingMissions: false,

  fetchAvailableMissions: async () => {
    const { declinedMissionIds, availableMissions } = get();
    try {
      const raw = await getAvailableMissions();
      const filtered = (raw || []).filter((m) => !declinedMissionIds.includes(m.id));
      const mapped = await Promise.all(filtered.map(toMissionCard));

      const previousIds = new Set(availableMissions.map((m) => m.id));
      const newMissions = mapped.filter((m) => !previousIds.has(m.id));

      set({ availableMissions: mapped, lastRefreshAt: new Date() });
      return newMissions;
    } catch {
      console.warn('[useMissionStore] fetchAvailableMissions failed');
      return [];
    }
  },

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

      return newMissions;
    } catch {
      console.warn('[useMissionStore] fetchAllMissions failed');
      set({ isLoadingMissions: false });
      return [];
    }
  },
}));
