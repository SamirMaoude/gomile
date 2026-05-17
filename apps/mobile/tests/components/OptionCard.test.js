// Tests for OptionCard — the selectable card used for vehicle type, gender
// and other single-select choices in the registration flow. The active state
// must be visually distinct and the press handler must fire reliably.

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import OptionCard from '../../src/components/OptionCard';

describe('OptionCard — rendering', () => {
  test('renders the label text', () => {
    const { getByText } = render(
      <OptionCard label="Voiture" active={false} onPress={() => {}} />
    );
    expect(getByText('Voiture')).toBeTruthy();
  });

  test('renders without crashing in active state', () => {
    expect(() =>
      render(<OptionCard label="Scooter" active={true} onPress={() => {}} />)
    ).not.toThrow();
  });

  test('renders without crashing in inactive state', () => {
    expect(() =>
      render(<OptionCard label="Vélo" active={false} onPress={() => {}} />)
    ).not.toThrow();
  });
});

describe('OptionCard — interactions', () => {
  test('calls onPress when the card is tapped', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <OptionCard label="Camion" active={false} onPress={onPress} />
    );
    fireEvent.press(getByText('Camion'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('calls onPress when already active (toggle off scenario is handled by parent)', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <OptionCard label="Voiture" active={true} onPress={onPress} />
    );
    fireEvent.press(getByText('Voiture'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

describe('OptionCard — width prop', () => {
  test('renders without crashing with a custom width', () => {
    expect(() =>
      render(<OptionCard label="Option" active={false} onPress={() => {}} width="100%" />)
    ).not.toThrow();
  });
});
