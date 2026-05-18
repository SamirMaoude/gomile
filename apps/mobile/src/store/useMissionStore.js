import { create } from 'zustand';
import {
  getAvailableMissions,
  getActiveMissions,
  getMissionHistory,
} from '../../lib/driver-client';
import { geocodeAddress, reverseGeocodeCoords } from '../../lib/geocode';

const DEFAULT_COORDS = { latitude: 45.1885, longitude: 5.7245 };

async function toMissionCard(mission) {
  const rawPickup  = mission.pickupLocation  ?? await geocodeAddress(mission.pickupAddress);
  const rawDropoff = mission.dropoffLocation ?? await geocodeAddress(mission.dropOffAddress);

  const pickup  = rawPickup  ?? DEFAULT_COORDS;
  const dropoff = rawDropoff ?? DEFAULT_COORDS;

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

// Dérive l'état de vérification depuis le statut backend :
// DRIVER_ACCEPTED → en route vers le commerçant
// PICKED_UP       → colis récupéré, en route vers le client
function missionStateFromStatus(status) {
  return {
    merchantVerified: status === 'PICKED_UP' || status === 'DELIVERED',
    clientVerified:   status === 'DELIVERED',
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
        focusedMissionId: m.id,
        missionStates: alreadyIn
          ? state.missionStates
          : { ...state.missionStates, [m.id]: { merchantVerified: false, clientVerified: false } },
      };
    });
  },

  setFocusedMission: (id) => set({ focusedMissionId: id }),

  markMerchantVerified: (id) => {
    set((state) => ({
      missionStates: {
        ...state.missionStates,
        [id]: { ...state.missionStates[id], merchantVerified: true },
      },
    }));
  },

  markClientVerified: (id) => {
    set((state) => ({
      missionStates: {
        ...state.missionStates,
        [id]: { ...state.missionStates[id], clientVerified: true },
      },
    }));
  },

  clearMission: (id) => {
    set((state) => {
      const newQueue = state.missionQueue.filter((m) => m.id !== id);
      const { [id]: _removed, ...newStates } = state.missionStates;
      const newFocused =
        state.focusedMissionId === id ? (newQueue[0]?.id ?? null) : state.focusedMissionId;
      return { missionQueue: newQueue, missionStates: newStates, focusedMissionId: newFocused };
    });
  },

  // Restaure les missions en cours depuis le backend au démarrage.
  // focusedMissionId est déduit par priorité métier : PICKED_UP > DRIVER_ACCEPTED.
  initStore: async () => {
    if (get().missionQueue.length > 0) return;
    try {
      const active = await getActiveMissions();
      if (!active || active.length === 0) return;

      const missionQueue = await Promise.all(active.map(toMissionCard));

      const missionStates = {};
      for (const mission of active) {
        missionStates[mission.id] = missionStateFromStatus(mission.status ?? '');
      }

      // La mission la plus urgente passe au premier plan :
      // colis déjà récupéré (PICKED_UP) > en route vers commerçant (DRIVER_ACCEPTED)
      const priority = (status) => (status === 'PICKED_UP' ? 0 : 1);
      const focused = [...active].sort((a, b) => priority(a.status) - priority(b.status))[0];

      set({
        missionQueue,
        missionStates,
        focusedMissionId: focused?.id ?? null,
      });
    } catch (err) {
      console.warn('[useMissionStore] initStore (backend restore) failed:', err?.message ?? err);
    }
  },

  // ── Missions refusées ──────────────────────────────────────────────────────
  declinedMissionIds: [],

  declineMission: (missionId) =>
    set((state) => ({
      declinedMissionIds: [...state.declinedMissionIds, missionId],
      availableMissions: state.availableMissions.filter((m) => m.id !== missionId),
    })),

  // ── Missions disponibles ───────────────────────────────────────────────────
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
    } catch (err) {
      console.warn('[useMissionStore] fetchAvailableMissions failed', err?.message ?? err);
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
    } catch (err) {
      console.warn('[useMissionStore] fetchAllMissions failed', err?.message ?? err);
      set({ isLoadingMissions: false });
      return [];
    }
  },
}));
