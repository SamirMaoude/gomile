// Tests for ScreenWrapper — the full-screen ImageBackground container used on
// authentication screens (Login, ForgotPassword, ResetPassword). It must render
// its children regardless of the background image loading state and accept an
// optional style override for the content layer.

import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import ScreenWrapper from '../../src/components/ScreenWrapper';

describe('ScreenWrapper — rendering', () => {
  test('renders its children', () => {
    const { getByText } = render(
      <ScreenWrapper>
        <Text>Contenu enfant</Text>
      </ScreenWrapper>
    );
    expect(getByText('Contenu enfant')).toBeTruthy();
  });

  test('renders multiple children', () => {
    const { getByText } = render(
      <ScreenWrapper>
        <Text>Premier</Text>
        <Text>Second</Text>
      </ScreenWrapper>
    );
    expect(getByText('Premier')).toBeTruthy();
    expect(getByText('Second')).toBeTruthy();
  });

  test('renders without crashing when no children are provided', () => {
    expect(() => render(<ScreenWrapper />)).not.toThrow();
  });

  test('renders without crashing with a custom style prop', () => {
    expect(() =>
      render(
        <ScreenWrapper style={{ padding: 20 }}>
          <Text>Styled</Text>
        </ScreenWrapper>
      )
    ).not.toThrow();
  });
});
