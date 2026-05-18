// Tests for TransactionItem — the wallet history list row.
// Each row must surface the transaction label, formatted date, and the amount
// prefixed with "+" and suffixed with "€". Any regression in formatting
// directly breaks the driver's ability to audit their earnings history.

import React from 'react';
import { render } from '@testing-library/react-native';
import TransactionItem from '../../src/components/TransactionItem';

describe('TransactionItem — rendering', () => {
  test('displays the transaction label', () => {
    const { getByText } = render(
      <TransactionItem label="Mission livrée" date="17 mai 2026" amount={8.5} />
    );
    expect(getByText('Mission livrée')).toBeTruthy();
  });

  test('displays the date string', () => {
    const { getByText } = render(
      <TransactionItem label="Mission" date="17 mai 2026" amount={5} />
    );
    expect(getByText('17 mai 2026')).toBeTruthy();
  });

  test('displays the amount prefixed with + and suffixed with €', () => {
    const { getByText } = render(
      <TransactionItem label="Mission" date="17/05/2026" amount={12} />
    );
    expect(getByText('+12 €')).toBeTruthy();
  });

  test('displays a decimal amount correctly', () => {
    const { getByText } = render(
      <TransactionItem label="Retrait" date="01/01/2026" amount={7.5} />
    );
    expect(getByText('+7.5 €')).toBeTruthy();
  });

  test('renders without crashing when amount is 0', () => {
    expect(() =>
      render(<TransactionItem label="Bonus" date="01/01/2026" amount={0} />)
    ).not.toThrow();
  });
});
