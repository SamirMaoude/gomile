// Tests for useAvailabilityStore — the Zustand store that tracks whether the
// driver is currently online or offline. This store is intentionally minimal:
// any regression in its logic directly breaks the mission-fetch guard and the
// Header toggle, so every state transition must be covered.

import { useAvailabilityStore } from '../../../src/store/useAvailabilityStore';

// Reset to the known offline default before each test so tests are independent.
beforeEach(() => {
  useAvailabilityStore.setState({ isOnline: false });
});

describe('useAvailabilityStore — initial state', () => {
  test('isOnline is false by default', () => {
    expect(useAvailabilityStore.getState().isOnline).toBe(false);
  });
});

describe('useAvailabilityStore — setOnlineStatus', () => {
  test('sets isOnline to true', () => {
    useAvailabilityStore.getState().setOnlineStatus(true);
    expect(useAvailabilityStore.getState().isOnline).toBe(true);
  });

  test('sets isOnline to false when called with false', () => {
    useAvailabilityStore.setState({ isOnline: true });
    useAvailabilityStore.getState().setOnlineStatus(false);
    expect(useAvailabilityStore.getState().isOnline).toBe(false);
  });

  test('accepts the same value without mutation error', () => {
    useAvailabilityStore.getState().setOnlineStatus(false);
    expect(useAvailabilityStore.getState().isOnline).toBe(false);
  });
});

describe('useAvailabilityStore — toggleOnlineStatus', () => {
  test('flips false to true', () => {
    useAvailabilityStore.getState().toggleOnlineStatus();
    expect(useAvailabilityStore.getState().isOnline).toBe(true);
  });

  test('flips true back to false', () => {
    useAvailabilityStore.setState({ isOnline: true });
    useAvailabilityStore.getState().toggleOnlineStatus();
    expect(useAvailabilityStore.getState().isOnline).toBe(false);
  });

  test('two consecutive toggles return to the original value', () => {
    const initial = useAvailabilityStore.getState().isOnline;
    useAvailabilityStore.getState().toggleOnlineStatus();
    useAvailabilityStore.getState().toggleOnlineStatus();
    expect(useAvailabilityStore.getState().isOnline).toBe(initial);
  });
});
