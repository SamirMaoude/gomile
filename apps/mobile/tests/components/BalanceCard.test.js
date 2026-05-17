// Tests for BalanceCard — the wallet summary widget shown on WalletScreen.
// It must render the passed amount with the euro symbol and trigger the parent
// callback when the withdrawal button is pressed.

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import BalanceCard from '../../src/components/BalanceCard';

describe('BalanceCard — rendering', () => {
  test('displays the "Solde disponible" label', () => {
    const { getByText } = render(<BalanceCard amount={42.5} onAction={() => {}} />);
    expect(getByText('Solde disponible')).toBeTruthy();
  });

  test('displays the amount followed by the euro symbol', () => {
    const { getByText } = render(<BalanceCard amount={42.5} onAction={() => {}} />);
    expect(getByText('42.5 €')).toBeTruthy();
  });

  test('displays zero amount correctly', () => {
    const { getByText } = render(<BalanceCard amount={0} onAction={() => {}} />);
    expect(getByText('0 €')).toBeTruthy();
  });

  test('displays the withdrawal button', () => {
    const { getByText } = render(<BalanceCard amount={10} onAction={() => {}} />);
    expect(getByText('DEMANDER UN VIREMENT')).toBeTruthy();
  });
});

describe('BalanceCard — interactions', () => {
  test('calls onAction when the withdrawal button is pressed', () => {
    const onAction = jest.fn();
    const { getByText } = render(<BalanceCard amount={50} onAction={onAction} />);
    fireEvent.press(getByText('DEMANDER UN VIREMENT'));
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
