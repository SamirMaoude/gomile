// Tests for SmartTouch — the tactile wrapper used throughout the app that
// dismisses the keyboard and optionally hides a date picker before
// forwarding the press event. Incorrect keyboard handling would leave the
// keyboard open and obscure content after navigation between form fields.

import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import SmartTouch from '../../src/components/SmartTouch';

describe('SmartTouch — rendering', () => {
  test('renders its children', () => {
    const { getByText } = render(
      <SmartTouch onPress={() => {}}>
        <Text>Contenu</Text>
      </SmartTouch>
    );
    expect(getByText('Contenu')).toBeTruthy();
  });

  test('renders without crashing when no children are provided', () => {
    expect(() => render(<SmartTouch onPress={() => {}} />)).not.toThrow();
  });
});

describe('SmartTouch — interactions', () => {
  test('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <SmartTouch onPress={onPress}>
        <Text>Appuyer</Text>
      </SmartTouch>
    );
    fireEvent.press(getByText('Appuyer'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('does not throw when tapped without an onPress handler', () => {
    const { getByText } = render(
      <SmartTouch>
        <Text>Tap</Text>
      </SmartTouch>
    );
    expect(() => fireEvent.press(getByText('Tap'))).not.toThrow();
  });

  test('calls setShowDatePicker with false when provided', () => {
    const setShowDatePicker = jest.fn();
    const { getByText } = render(
      <SmartTouch onPress={() => {}} setShowDatePicker={setShowDatePicker}>
        <Text>Fermer</Text>
      </SmartTouch>
    );
    fireEvent.press(getByText('Fermer'));
    expect(setShowDatePicker).toHaveBeenCalledWith(false);
  });
});
