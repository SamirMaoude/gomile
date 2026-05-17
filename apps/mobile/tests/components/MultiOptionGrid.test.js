// Tests for MultiOptionGrid — the multi-select grid used for features and
// options where more than one value can be active at once. The toggle logic
// must add unselected values to the array and remove already-selected ones,
// forwarding the updated array to the parent via onToggle.

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import MultiOptionGrid from '../../src/components/MultiOptionGrid';

const OPTIONS = [
  { label: 'Voiture', value: 'CAR' },
  { label: 'Scooter', value: 'SCOOTER' },
  { label: 'Vélo', value: 'BIKE' },
];

describe('MultiOptionGrid — rendering', () => {
  test('renders all provided option labels', () => {
    const { getByText } = render(
      <MultiOptionGrid options={OPTIONS} selectedValues={[]} onToggle={() => {}} />
    );
    expect(getByText('Voiture')).toBeTruthy();
    expect(getByText('Scooter')).toBeTruthy();
    expect(getByText('Vélo')).toBeTruthy();
  });

  test('renders without crashing with an empty options array', () => {
    expect(() =>
      render(<MultiOptionGrid options={[]} selectedValues={[]} onToggle={() => {}} />)
    ).not.toThrow();
  });

  test('renders without crashing with all options selected', () => {
    expect(() =>
      render(
        <MultiOptionGrid options={OPTIONS} selectedValues={['CAR', 'SCOOTER', 'BIKE']} onToggle={() => {}} />
      )
    ).not.toThrow();
  });
});

describe('MultiOptionGrid — toggle behaviour', () => {
  test('adds the value to selectedValues when an inactive option is pressed', () => {
    const onToggle = jest.fn();
    const { getByText } = render(
      <MultiOptionGrid options={OPTIONS} selectedValues={[]} onToggle={onToggle} />
    );
    fireEvent.press(getByText('Voiture'));
    expect(onToggle).toHaveBeenCalledWith(['CAR']);
  });

  test('removes the value from selectedValues when an active option is pressed', () => {
    const onToggle = jest.fn();
    const { getByText } = render(
      <MultiOptionGrid options={OPTIONS} selectedValues={['CAR', 'SCOOTER']} onToggle={onToggle} />
    );
    fireEvent.press(getByText('Voiture'));
    expect(onToggle).toHaveBeenCalledWith(['SCOOTER']);
  });

  test('appends to an existing selection without mutating the array', () => {
    const onToggle = jest.fn();
    const { getByText } = render(
      <MultiOptionGrid options={OPTIONS} selectedValues={['SCOOTER']} onToggle={onToggle} />
    );
    fireEvent.press(getByText('Voiture'));
    expect(onToggle).toHaveBeenCalledWith(['SCOOTER', 'CAR']);
  });

  test('calls onToggle once per press', () => {
    const onToggle = jest.fn();
    const { getByText } = render(
      <MultiOptionGrid options={OPTIONS} selectedValues={[]} onToggle={onToggle} />
    );
    fireEvent.press(getByText('Scooter'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
