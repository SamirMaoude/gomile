// Tests for Header — the top navigation bar shown on every main screen.
// It optionally renders the online/offline availability toggle connected to
// the useAvailabilityStore. The toggle must reflect store state and must not
// allow toggling while a mission is active or while a previous toggle is in flight.

import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import Header from '../../src/components/Header';
import { useAvailabilityStore } from '../../src/store/useAvailabilityStore';
import { useMissionStore } from '../../src/store/useMissionStore';

// Mock the driver-client so toggle calls do not hit the network.
jest.mock('../../lib/driver-client', () => ({
  toggleDriverAvailability: jest.fn().mockResolvedValue({ message: 'ok' }),
}));

const { toggleDriverAvailability } = require('../../lib/driver-client');

// Reset all relevant state before each test.
beforeEach(() => {
  useAvailabilityStore.setState({ isOnline: false });
  useMissionStore.setState({ missionQueue: [], focusedMissionId: null, missionStates: {} });
  toggleDriverAvailability.mockResolvedValue({ message: 'ok' });
});

describe('Header — title rendering', () => {
  test('renders the provided title', () => {
    const { getByText } = render(<Header title="TABLEAU DE BORD" />);
    expect(getByText('TABLEAU DE BORD')).toBeTruthy();
  });

  test('renders any string title', () => {
    const { getByText } = render(<Header title="MISSIONS" />);
    expect(getByText('MISSIONS')).toBeTruthy();
  });
});

describe('Header — availability toggle visibility', () => {
  test('does not render the availability toggle by default', () => {
    const { queryByText } = render(<Header title="Test" />);
    expect(queryByText('EN LIGNE')).toBeNull();
    expect(queryByText('HORS LIGNE')).toBeNull();
  });

  test('renders the availability toggle when showAvailabilityToggle is true', () => {
    const { getByText } = render(<Header title="Test" showAvailabilityToggle />);
    expect(getByText('HORS LIGNE')).toBeTruthy();
  });

  test('shows "EN LIGNE" when the driver is online', () => {
    useAvailabilityStore.setState({ isOnline: true });
    const { getByText } = render(<Header title="Test" showAvailabilityToggle />);
    expect(getByText('EN LIGNE')).toBeTruthy();
  });

  test('shows "HORS LIGNE" when the driver is offline', () => {
    useAvailabilityStore.setState({ isOnline: false });
    const { getByText } = render(<Header title="Test" showAvailabilityToggle />);
    expect(getByText('HORS LIGNE')).toBeTruthy();
  });
});

describe('Header — toggle interaction', () => {
  test('calls toggleDriverAvailability and updates the store when the switch is pressed', async () => {
    const { UNSAFE_getByType } = render(<Header title="Test" showAvailabilityToggle />);
    const { Switch } = require('react-native');
    const toggle = UNSAFE_getByType(Switch);

    await act(async () => {
      fireEvent(toggle, 'valueChange', true);
    });

    await waitFor(() => {
      expect(toggleDriverAvailability).toHaveBeenCalledTimes(1);
      expect(useAvailabilityStore.getState().isOnline).toBe(true);
    });
  });

  test('shows an Alert and does not call the API when going offline with an active mission', async () => {
    useAvailabilityStore.setState({ isOnline: true });
    useMissionStore.setState({
      missionQueue: [{ id: 'm-1', status: 'active' }],
    });

    const { Alert } = require('react-native');
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

    const { UNSAFE_getByType } = render(<Header title="Test" showAvailabilityToggle />);
    const { Switch } = require('react-native');
    const toggle = UNSAFE_getByType(Switch);

    await act(async () => {
      fireEvent(toggle, 'valueChange', false);
    });

    expect(alertSpy).toHaveBeenCalledTimes(1);
    expect(toggleDriverAvailability).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });
});
