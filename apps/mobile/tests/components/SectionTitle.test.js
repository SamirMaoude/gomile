// Tests for SectionTitle — the section header Text component used to visually
// separate content groups on Missions, Wallet, Profile and other screens.
// It must render its children faithfully and accept an optional style override.

import React from 'react';
import { render } from '@testing-library/react-native';
import SectionTitle from '../../src/components/SectionTitle';

describe('SectionTitle — rendering', () => {
  test('renders the provided children text', () => {
    const { getByText } = render(<SectionTitle>Missions à proximité</SectionTitle>);
    expect(getByText('Missions à proximité')).toBeTruthy();
  });

  test('renders any string content', () => {
    const { getByText } = render(<SectionTitle>HISTORIQUE DES MISSIONS</SectionTitle>);
    expect(getByText('HISTORIQUE DES MISSIONS')).toBeTruthy();
  });

  test('renders without crashing when children is an empty string', () => {
    expect(() => render(<SectionTitle>{''}</SectionTitle>)).not.toThrow();
  });
});

describe('SectionTitle — style override', () => {
  test('accepts a custom style prop without crashing', () => {
    expect(() =>
      render(<SectionTitle style={{ fontSize: 24 }}>Titre</SectionTitle>)
    ).not.toThrow();
  });
});
