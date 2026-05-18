// Tests for GoMileButton — the primary interactive element used on every screen.
// The button must block interaction while loading, display an activity indicator
// instead of the label, and apply different visual styles for outline vs. filled.

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import GoMileButton from '../../src/components/GoMileButton';

describe('GoMileButton — rendering', () => {
  test('renders the title text', () => {
    const { getByText } = render(<GoMileButton title="SE CONNECTER" onPress={() => {}} />);
    expect(getByText('SE CONNECTER')).toBeTruthy();
  });

  test('does not render ActivityIndicator when loading is false', () => {
    const { queryByTestId, UNSAFE_queryByType } = render(
      <GoMileButton title="Bouton" onPress={() => {}} loading={false} />
    );
    const { ActivityIndicator } = require('react-native');
    expect(UNSAFE_queryByType(ActivityIndicator)).toBeNull();
  });

  test('renders ActivityIndicator and hides title when loading is true', () => {
    const { queryByText, UNSAFE_getByType } = render(
      <GoMileButton title="Chargement" onPress={() => {}} loading={true} />
    );
    const { ActivityIndicator } = require('react-native');
    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
    expect(queryByText('Chargement')).toBeNull();
  });
});

describe('GoMileButton — interactions', () => {
  test('calls onPress when the button is tapped and not loading', () => {
    const onPress = jest.fn();
    const { getByText } = render(<GoMileButton title="ACTION" onPress={onPress} loading={false} />);
    fireEvent.press(getByText('ACTION'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('does not call onPress when loading is true', () => {
    const onPress = jest.fn();
    const { UNSAFE_getByType } = render(
      <GoMileButton title="ACTION" onPress={onPress} loading={true} />
    );
    const { ActivityIndicator } = require('react-native');
    const indicator = UNSAFE_getByType(ActivityIndicator);
    fireEvent.press(indicator);
    expect(onPress).not.toHaveBeenCalled();
  });
});

describe('GoMileButton — outline variant', () => {
  test('renders without crashing in outline mode', () => {
    const { getByText } = render(
      <GoMileButton title="OUTLINE" onPress={() => {}} outline />
    );
    expect(getByText('OUTLINE')).toBeTruthy();
  });
});

describe('GoMileButton — edge cases', () => {
  test('renders without crashing when onPress is not provided', () => {
    expect(() => render(<GoMileButton title="Bouton" />)).not.toThrow();
  });

  test('renders without crashing with a flex prop', () => {
    const { getByText } = render(<GoMileButton title="Flex" onPress={() => {}} flex={1} />);
    expect(getByText('Flex')).toBeTruthy();
  });
});
