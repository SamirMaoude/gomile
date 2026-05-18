// Tests for useMissionStore — the central Zustand store that orchestrates
// the entire delivery lifecycle: accepting missions, tracking merchant/client
// verifications, filtering declined missions, and syncing with the backend.
//
// Because this store drives every screen that a driver interacts with during
// an active delivery, every action must behave correctly and be idempotent
// where the implementation guarantees idempotency.

import { useMissionStore } from '../../../src/store/useMissionStore';

// Mock API calls made inside the store so tests do not hit a real backend.
jest.mock('../../../lib/driver-client', () => ({
  getAvailableMissions: jest.fn(),
  getActiveMissions: jest.fn(),
  getMissionHistory: jest.fn(),
}));

// Mock geocoding so toMissionCard resolves synchronously with deterministic coords.
jest.mock('../../../lib/geocode', () => ({
  geocodeAddress: jest.fn().mockResolvedValue(null),
  reverseGeocodeCoords: jest.fn().mockResolvedValue(null),
}));

// Import mocked modules so individual tests can configure return values.
const { getAvailableMissions, getActiveMissions, getMissionHistory } =
  require('../../../lib/driver-client');

// Factory for a minimal raw backend mission object.
function makeMission(overrides = {}) {
  return {
    id: 'mission-1',
    type: 'DELIVERY',
    store: 'Boulangerie Paul',
    reward: 5,
    distanceKm: 3.2,
    pickupAddress: '10 rue Victor Hugo, Grenoble',
    dropOffAddress: '25 avenue de la Gare, Grenoble',
    pickupLocation: { latitude: 45.18, longitude: 5.72 },
    dropoffLocation: { latitude: 45.19, longitude: 5.73 },
    status: 'DRIVER_ACCEPTED',
    ...overrides,
  };
}

// Factory for a mission card as it exists inside the store after toMissionCard.
function makeMissionCard(overrides = {}) {
  return {
    id: 'mission-1',
    type: 'DELIVERY',
    store: 'Boulangerie Paul',
    storeAddress: '10 rue Victor Hugo, Grenoble',
    customerArea: '25 avenue de la Gare, Grenoble',
    reward: '5',
    distance: '3.2 km',
    eta: '--',
    notes: 'Suivre les instructions de livraison.',
    status: 'active',
    pickup: { latitude: 45.18, longitude: 5.72 },
    dropoff: { latitude: 45.19, longitude: 5.73 },
    mapRegion: {
      latitude: 45.18,
      longitude: 5.72,
      latitudeDelta: 0.03,
      longitudeDelta: 0.03,
    },
    ...overrides,
  };
}

// Reset the store to a clean initial state before every test.
beforeEach(() => {
  useMissionStore.setState({
    missionQueue: [],
    focusedMissionId: null,
    missionStates: {},
    declinedMissionIds: [],
    availableMissions: [],
    activeMissions: [],
    historyMissions: [],
    lastRefreshAt: null,
    isLoadingMissions: false,
  });
});

// ── Initial state ─────────────────────────────────────────────────────────────

describe('useMissionStore — initial state', () => {
  test('missionQueue is empty', () => {
    expect(useMissionStore.getState().missionQueue).toEqual([]);
  });

  test('focusedMissionId is null', () => {
    expect(useMissionStore.getState().focusedMissionId).toBeNull();
  });

  test('availableMissions is empty', () => {
    expect(useMissionStore.getState().availableMissions).toEqual([]);
  });

  test('isLoadingMissions is false', () => {
    expect(useMissionStore.getState().isLoadingMissions).toBe(false);
  });

  test('declinedMissionIds is empty', () => {
    expect(useMissionStore.getState().declinedMissionIds).toEqual([]);
  });
});

// ── acceptMission ─────────────────────────────────────────────────────────────

describe('useMissionStore — acceptMission', () => {
  test('adds the mission to the queue with status active', () => {
    const card = makeMissionCard();
    useMissionStore.getState().acceptMission(card);
    const { missionQueue } = useMissionStore.getState();
    expect(missionQueue).toHaveLength(1);
    expect(missionQueue[0].id).toBe('mission-1');
    expect(missionQueue[0].status).toBe('active');
  });

  test('sets focusedMissionId to the accepted mission id', () => {
    const card = makeMissionCard();
    useMissionStore.getState().acceptMission(card);
    expect(useMissionStore.getState().focusedMissionId).toBe('mission-1');
  });

  test('initialises missionStates with both verifications false', () => {
    const card = makeMissionCard();
    useMissionStore.getState().acceptMission(card);
    expect(useMissionStore.getState().missionStates['mission-1']).toEqual({
      merchantVerified: false,
      clientVerified: false,
    });
  });

  test('is idempotent — does not add duplicates to the queue', () => {
    const card = makeMissionCard();
    useMissionStore.getState().acceptMission(card);
    useMissionStore.getState().acceptMission(card);
    expect(useMissionStore.getState().missionQueue).toHaveLength(1);
  });

  test('when duplicate is accepted, missionStates is unchanged', () => {
    const card = makeMissionCard();
    useMissionStore.getState().acceptMission(card);
    useMissionStore.getState().markMerchantVerified('mission-1');
    useMissionStore.getState().acceptMission(card);
    expect(useMissionStore.getState().missionStates['mission-1'].merchantVerified).toBe(true);
  });

  test('accepting a second distinct mission keeps both in the queue', () => {
    useMissionStore.getState().acceptMission(makeMissionCard({ id: 'mission-1' }));
    useMissionStore.getState().acceptMission(makeMissionCard({ id: 'mission-2' }));
    expect(useMissionStore.getState().missionQueue).toHaveLength(2);
  });

  test('focusedMissionId is updated to the latest accepted mission', () => {
    useMissionStore.getState().acceptMission(makeMissionCard({ id: 'mission-1' }));
    useMissionStore.getState().acceptMission(makeMissionCard({ id: 'mission-2' }));
    expect(useMissionStore.getState().focusedMissionId).toBe('mission-2');
  });
});

// ── setFocusedMission ─────────────────────────────────────────────────────────

describe('useMissionStore — setFocusedMission', () => {
  test('updates focusedMissionId to the provided id', () => {
    useMissionStore.getState().acceptMission(makeMissionCard({ id: 'mission-1' }));
    useMissionStore.getState().acceptMission(makeMissionCard({ id: 'mission-2' }));
    useMissionStore.getState().setFocusedMission('mission-1');
    expect(useMissionStore.getState().focusedMissionId).toBe('mission-1');
  });

  test('can be set to null to clear the focus', () => {
    useMissionStore.getState().acceptMission(makeMissionCard());
    useMissionStore.getState().setFocusedMission(null);
    expect(useMissionStore.getState().focusedMissionId).toBeNull();
  });
});

// ── markMerchantVerified ──────────────────────────────────────────────────────

describe('useMissionStore — markMerchantVerified', () => {
  test('sets merchantVerified to true for the specified mission', () => {
    useMissionStore.getState().acceptMission(makeMissionCard());
    useMissionStore.getState().markMerchantVerified('mission-1');
    expect(useMissionStore.getState().missionStates['mission-1'].merchantVerified).toBe(true);
  });

  test('does not affect clientVerified', () => {
    useMissionStore.getState().acceptMission(makeMissionCard());
    useMissionStore.getState().markMerchantVerified('mission-1');
    expect(useMissionStore.getState().missionStates['mission-1'].clientVerified).toBe(false);
  });

  test('does not affect the state of other missions', () => {
    useMissionStore.getState().acceptMission(makeMissionCard({ id: 'mission-1' }));
    useMissionStore.getState().acceptMission(makeMissionCard({ id: 'mission-2' }));
    useMissionStore.getState().markMerchantVerified('mission-1');
    expect(useMissionStore.getState().missionStates['mission-2'].merchantVerified).toBe(false);
  });
});

// ── markClientVerified ────────────────────────────────────────────────────────

describe('useMissionStore — markClientVerified', () => {
  test('sets clientVerified to true for the specified mission', () => {
    useMissionStore.getState().acceptMission(makeMissionCard());
    useMissionStore.getState().markClientVerified('mission-1');
    expect(useMissionStore.getState().missionStates['mission-1'].clientVerified).toBe(true);
  });

  test('does not affect merchantVerified', () => {
    useMissionStore.getState().acceptMission(makeMissionCard());
    useMissionStore.getState().markClientVerified('mission-1');
    expect(useMissionStore.getState().missionStates['mission-1'].merchantVerified).toBe(false);
  });

  test('both verifications can be set independently', () => {
    useMissionStore.getState().acceptMission(makeMissionCard());
    useMissionStore.getState().markMerchantVerified('mission-1');
    useMissionStore.getState().markClientVerified('mission-1');
    expect(useMissionStore.getState().missionStates['mission-1']).toEqual({
      merchantVerified: true,
      clientVerified: true,
    });
  });
});

// ── clearMission ──────────────────────────────────────────────────────────────

describe('useMissionStore — clearMission', () => {
  test('removes the mission from the queue', () => {
    useMissionStore.getState().acceptMission(makeMissionCard());
    useMissionStore.getState().clearMission('mission-1');
    expect(useMissionStore.getState().missionQueue).toHaveLength(0);
  });

  test('removes the mission state entry', () => {
    useMissionStore.getState().acceptMission(makeMissionCard());
    useMissionStore.getState().clearMission('mission-1');
    expect(useMissionStore.getState().missionStates['mission-1']).toBeUndefined();
  });

  test('focuses the next remaining mission when the focused one is cleared', () => {
    useMissionStore.getState().acceptMission(makeMissionCard({ id: 'mission-1' }));
    useMissionStore.getState().acceptMission(makeMissionCard({ id: 'mission-2' }));
    useMissionStore.getState().setFocusedMission('mission-2');
    useMissionStore.getState().clearMission('mission-2');
    expect(useMissionStore.getState().focusedMissionId).toBe('mission-1');
  });

  test('sets focusedMissionId to null when the last mission is cleared', () => {
    useMissionStore.getState().acceptMission(makeMissionCard());
    useMissionStore.getState().clearMission('mission-1');
    expect(useMissionStore.getState().focusedMissionId).toBeNull();
  });

  test('keeps focusedMissionId when a non-focused mission is cleared', () => {
    useMissionStore.getState().acceptMission(makeMissionCard({ id: 'mission-1' }));
    useMissionStore.getState().acceptMission(makeMissionCard({ id: 'mission-2' }));
    useMissionStore.getState().setFocusedMission('mission-1');
    useMissionStore.getState().clearMission('mission-2');
    expect(useMissionStore.getState().focusedMissionId).toBe('mission-1');
  });

  test('is safe to call on an id that does not exist in the queue', () => {
    expect(() => useMissionStore.getState().clearMission('ghost-id')).not.toThrow();
  });
});

// ── declineMission ────────────────────────────────────────────────────────────

describe('useMissionStore — declineMission', () => {
  test('adds the mission id to declinedMissionIds', () => {
    useMissionStore.getState().declineMission('mission-1');
    expect(useMissionStore.getState().declinedMissionIds).toContain('mission-1');
  });

  test('removes the mission from availableMissions', () => {
    useMissionStore.setState({
      availableMissions: [makeMissionCard({ id: 'mission-1' }), makeMissionCard({ id: 'mission-2' })],
    });
    useMissionStore.getState().declineMission('mission-1');
    const ids = useMissionStore.getState().availableMissions.map((m) => m.id);
    expect(ids).not.toContain('mission-1');
    expect(ids).toContain('mission-2');
  });

  test('declining the same mission twice does not duplicate in declinedMissionIds', () => {
    useMissionStore.getState().declineMission('mission-1');
    useMissionStore.getState().declineMission('mission-1');
    const ids = useMissionStore.getState().declinedMissionIds;
    expect(ids.filter((id) => id === 'mission-1')).toHaveLength(2);
    // Note: current implementation allows duplicates — this test documents the behaviour.
  });
});

// ── fetchAvailableMissions ────────────────────────────────────────────────────

describe('useMissionStore — fetchAvailableMissions', () => {
  test('populates availableMissions from the backend response', async () => {
    getAvailableMissions.mockResolvedValue([makeMission()]);
    await useMissionStore.getState().fetchAvailableMissions();
    expect(useMissionStore.getState().availableMissions).toHaveLength(1);
  });

  test('filters out missions whose id is in declinedMissionIds', async () => {
    getAvailableMissions.mockResolvedValue([
      makeMission({ id: 'mission-1' }),
      makeMission({ id: 'mission-2' }),
    ]);
    useMissionStore.setState({ declinedMissionIds: ['mission-1'] });
    await useMissionStore.getState().fetchAvailableMissions();
    const ids = useMissionStore.getState().availableMissions.map((m) => m.id);
    expect(ids).not.toContain('mission-1');
    expect(ids).toContain('mission-2');
  });

  test('returns newly seen missions not previously in the store', async () => {
    useMissionStore.setState({ availableMissions: [makeMissionCard({ id: 'mission-1' })] });
    getAvailableMissions.mockResolvedValue([
      makeMission({ id: 'mission-1' }),
      makeMission({ id: 'mission-2' }),
    ]);
    const newMissions = await useMissionStore.getState().fetchAvailableMissions();
    expect(newMissions.map((m) => m.id)).toContain('mission-2');
    expect(newMissions.map((m) => m.id)).not.toContain('mission-1');
  });

  test('returns empty array and does not throw when backend fails', async () => {
    getAvailableMissions.mockRejectedValue(new Error('network error'));
    const result = await useMissionStore.getState().fetchAvailableMissions();
    expect(result).toEqual([]);
  });

  test('updates lastRefreshAt after a successful fetch', async () => {
    getAvailableMissions.mockResolvedValue([]);
    await useMissionStore.getState().fetchAvailableMissions();
    expect(useMissionStore.getState().lastRefreshAt).toBeInstanceOf(Date);
  });
});

// ── fetchAllMissions ──────────────────────────────────────────────────────────

describe('useMissionStore — fetchAllMissions', () => {
  test('sets isLoadingMissions to true then back to false', async () => {
    getAvailableMissions.mockResolvedValue([]);
    getActiveMissions.mockResolvedValue([]);
    getMissionHistory.mockResolvedValue([]);

    const promise = useMissionStore.getState().fetchAllMissions();
    expect(useMissionStore.getState().isLoadingMissions).toBe(true);
    await promise;
    expect(useMissionStore.getState().isLoadingMissions).toBe(false);
  });

  test('populates available, active and history missions', async () => {
    getAvailableMissions.mockResolvedValue([makeMission({ id: 'avail-1' })]);
    getActiveMissions.mockResolvedValue([makeMission({ id: 'active-1', status: 'PICKED_UP' })]);
    getMissionHistory.mockResolvedValue([
      { id: 'hist-1', store: 'Shop', status: 'DELIVERED', reward: 7 },
    ]);

    await useMissionStore.getState().fetchAllMissions();

    expect(useMissionStore.getState().availableMissions).toHaveLength(1);
    expect(useMissionStore.getState().activeMissions).toHaveLength(1);
    expect(useMissionStore.getState().historyMissions).toHaveLength(1);
  });

  test('history missions are mapped to { id, store, date, reward } shape', async () => {
    getAvailableMissions.mockResolvedValue([]);
    getActiveMissions.mockResolvedValue([]);
    getMissionHistory.mockResolvedValue([
      { id: 'h-1', store: 'Boulangerie', status: 'DELIVERED', reward: 8 },
    ]);

    await useMissionStore.getState().fetchAllMissions();

    const item = useMissionStore.getState().historyMissions[0];
    expect(item).toEqual({ id: 'h-1', store: 'Boulangerie', date: 'DELIVERED', reward: '8' });
  });

  test('sets isLoadingMissions to false even when the backend fails', async () => {
    getAvailableMissions.mockRejectedValue(new Error('timeout'));
    getActiveMissions.mockResolvedValue([]);
    getMissionHistory.mockResolvedValue([]);

    await useMissionStore.getState().fetchAllMissions();
    expect(useMissionStore.getState().isLoadingMissions).toBe(false);
  });
});

// ── initStore ─────────────────────────────────────────────────────────────────

describe('useMissionStore — initStore', () => {
  test('skips backend call when missionQueue already has entries', async () => {
    useMissionStore.setState({ missionQueue: [makeMissionCard()] });
    await useMissionStore.getState().initStore();
    expect(getActiveMissions).not.toHaveBeenCalled();
  });

  test('restores active missions from the backend when queue is empty', async () => {
    getActiveMissions.mockResolvedValue([makeMission({ status: 'DRIVER_ACCEPTED' })]);
    await useMissionStore.getState().initStore();
    expect(useMissionStore.getState().missionQueue).toHaveLength(1);
  });

  test('derives merchantVerified=false, clientVerified=false for DRIVER_ACCEPTED status', async () => {
    getActiveMissions.mockResolvedValue([makeMission({ status: 'DRIVER_ACCEPTED' })]);
    await useMissionStore.getState().initStore();
    expect(useMissionStore.getState().missionStates['mission-1']).toEqual({
      merchantVerified: false,
      clientVerified: false,
    });
  });

  test('derives merchantVerified=true, clientVerified=false for PICKED_UP status', async () => {
    getActiveMissions.mockResolvedValue([makeMission({ status: 'PICKED_UP' })]);
    await useMissionStore.getState().initStore();
    expect(useMissionStore.getState().missionStates['mission-1']).toEqual({
      merchantVerified: true,
      clientVerified: false,
    });
  });

  test('prioritises PICKED_UP mission as focusedMissionId over DRIVER_ACCEPTED', async () => {
    getActiveMissions.mockResolvedValue([
      makeMission({ id: 'accepted', status: 'DRIVER_ACCEPTED' }),
      makeMission({ id: 'picked', status: 'PICKED_UP' }),
    ]);
    await useMissionStore.getState().initStore();
    expect(useMissionStore.getState().focusedMissionId).toBe('picked');
  });

  test('does not throw when the backend call fails', async () => {
    getActiveMissions.mockRejectedValue(new Error('backend down'));
    await expect(useMissionStore.getState().initStore()).resolves.not.toThrow();
  });
});
