// Integration tests for useMissionsPoller — the custom hook that orchestrates
// mission fetching when a screen gains focus and the driver is online. It is
// shared between TableauDeBord (fetchAll=false) and MissionsScreen (fetchAll=true).
// The hook must not fetch when the screen is unfocused or the driver is offline,
// must trigger a push notification when new missions arrive, and must expose a
// manual refresh function.
//
// NOTE ON PATTERNS: renderHook must NOT be called inside act(). Instead,
// renderHook handles its own act() wrapping internally. Use waitFor() to wait
// for async side effects after rendering.

import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useIsFocused } from '@react-navigation/native';

import { useMissionsPoller } from '../../../src/hooks/useMissionsPoller';
import { useAvailabilityStore } from '../../../src/store/useAvailabilityStore';
import { useMissionStore } from '../../../src/store/useMissionStore';
import { notifyNewMissions } from '../../../src/lib/push-notifications';

// Mock the driver-client used inside the store so fetch calls do not hit the network.
jest.mock('../../../lib/driver-client', () => ({
  getAvailableMissions: jest.fn(),
  getActiveMissions: jest.fn(),
  getMissionHistory: jest.fn(),
}));

// Mock geocode so toMissionCard resolves instantly.
jest.mock('../../../lib/geocode', () => ({
  geocodeAddress: jest.fn().mockResolvedValue(null),
  reverseGeocodeCoords: jest.fn().mockResolvedValue(null),
}));

const { getAvailableMissions, getActiveMissions, getMissionHistory } =
  require('../../../lib/driver-client');

// Helper to build a minimal raw mission returned by the backend.
function makeMission(id = 'mission-1') {
  return {
    id,
    type: 'DELIVERY',
    store: 'Test Store',
    reward: 5,
    distanceKm: 2,
    pickupAddress: '1 rue Test',
    dropOffAddress: '2 rue Test',
    pickupLocation: { latitude: 45, longitude: 5 },
    dropoffLocation: { latitude: 45.1, longitude: 5.1 },
    status: 'DRIVER_ACCEPTED',
  };
}

// Reset stores and mocks before each test.
beforeEach(() => {
  useAvailabilityStore.setState({ isOnline: true });
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
  // Default: screen is focused, driver is online, backend returns no missions.
  useIsFocused.mockReturnValue(true);
  getAvailableMissions.mockResolvedValue([]);
  getActiveMissions.mockResolvedValue([]);
  getMissionHistory.mockResolvedValue([]);
});

// ── Mount behaviour ───────────────────────────────────────────────────────────

describe('useMissionsPoller — on mount (fetchAll=false)', () => {
  test('calls fetchAvailableMissions when focused and online', async () => {
    const { unmount } = renderHook(() => useMissionsPoller({ fetchAll: false }));
    await waitFor(() => {
      expect(getAvailableMissions).toHaveBeenCalledTimes(1);
    });
    unmount();
  });

  test('does not fetch when the screen is not focused', async () => {
    useIsFocused.mockReturnValue(false);
    const { unmount } = renderHook(() => useMissionsPoller({ fetchAll: false }));
    // Give the effect time to potentially fire.
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
    expect(getAvailableMissions).not.toHaveBeenCalled();
    unmount();
  });

  test('does not fetch when the driver is offline', async () => {
    useAvailabilityStore.setState({ isOnline: false });
    const { unmount } = renderHook(() => useMissionsPoller({ fetchAll: false }));
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
    expect(getAvailableMissions).not.toHaveBeenCalled();
    unmount();
  });

  test('does not fetch when focused but offline', async () => {
    useIsFocused.mockReturnValue(true);
    useAvailabilityStore.setState({ isOnline: false });
    const { unmount } = renderHook(() => useMissionsPoller({ fetchAll: false }));
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
    expect(getAvailableMissions).not.toHaveBeenCalled();
    unmount();
  });
});

describe('useMissionsPoller — on mount (fetchAll=true)', () => {
  test('calls getAvailableMissions, getActiveMissions and getMissionHistory', async () => {
    const { unmount } = renderHook(() => useMissionsPoller({ fetchAll: true }));
    await waitFor(() => {
      expect(getAvailableMissions).toHaveBeenCalledTimes(1);
      expect(getActiveMissions).toHaveBeenCalledTimes(1);
      expect(getMissionHistory).toHaveBeenCalledTimes(1);
    });
    unmount();
  });
});

// ── Push notification trigger ─────────────────────────────────────────────────

describe('useMissionsPoller — new mission notification', () => {
  test('calls notifyNewMissions when the fetch returns previously unseen missions', async () => {
    getAvailableMissions.mockResolvedValue([makeMission('new-1')]);

    const { unmount } = renderHook(() => useMissionsPoller({ fetchAll: false }));
    await waitFor(() => {
      expect(notifyNewMissions).toHaveBeenCalledTimes(1);
    });
    expect(notifyNewMissions).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ id: 'new-1' })])
    );
    unmount();
  });

  test('does not call notifyNewMissions when fetch returns no new missions', async () => {
    getAvailableMissions.mockResolvedValue([makeMission('existing-1')]);

    // First render to populate the store with existing-1.
    const { unmount: unmount1 } = renderHook(() => useMissionsPoller({ fetchAll: false }));
    await waitFor(() => expect(getAvailableMissions).toHaveBeenCalledTimes(1));
    unmount1();

    // Clear call counts (but keep mock implementation) before the second render
    // so we can assert independently on the second hook's fetch invocation.
    getAvailableMissions.mockClear();
    notifyNewMissions.mockClear();

    // Second render — existing-1 is already in the store, so no new missions.
    const { unmount: unmount2 } = renderHook(() => useMissionsPoller({ fetchAll: false }));
    await waitFor(() => expect(getAvailableMissions).toHaveBeenCalledTimes(1));
    expect(notifyNewMissions).not.toHaveBeenCalled();
    unmount2();
  });
});

// ── Manual refresh ────────────────────────────────────────────────────────────

describe('useMissionsPoller — manual refresh', () => {
  test('returns a refresh function that triggers a new fetch when called', async () => {
    const { result, unmount } = renderHook(() => useMissionsPoller({ fetchAll: false }));

    // Wait for the initial fetch triggered on mount.
    await waitFor(() => expect(getAvailableMissions).toHaveBeenCalledTimes(1));

    // Call the returned refresh function.
    await act(async () => {
      await result.current.refresh();
    });

    expect(getAvailableMissions).toHaveBeenCalledTimes(2);
    unmount();
  });
});
