// Tests for GoMileInput — the unified text input used across all forms.
// The component wraps React Native's TextInput and optionally renders a label.
// Additional props are forwarded to the underlying TextInput, so the component
// must be transparent to any standard TextInput prop.

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import GoMileInput from '../../src/components/GoMileInput';

describe('GoMileInput — label', () => {
  test('renders the label text when the label prop is provided', () => {
    const { getByText } = render(<GoMileInput label="Email" />);
    expect(getByText('Email')).toBeTruthy();
  });

  test('does not render a label element when the label prop is absent', () => {
    const { queryByText } = render(<GoMileInput placeholder="Email" />);
    // The label slot should be empty — no stray text rendered.
    expect(queryByText('Email')).toBeNull();
  });
});

describe('GoMileInput — TextInput behaviour', () => {
  test('renders a TextInput element', () => {
    const { UNSAFE_getByType } = render(<GoMileInput label="Champ" />);
    const { TextInput } = require('react-native');
    expect(UNSAFE_getByType(TextInput)).toBeTruthy();
  });

  test('displays the provided value', () => {
    const { UNSAFE_getByType } = render(<GoMileInput label="Nom" value="Jean" />);
    const { TextInput } = require('react-native');
    const input = UNSAFE_getByType(TextInput);
    expect(input.props.value).toBe('Jean');
  });

  test('calls onChangeText when the input value changes', () => {
    const onChangeText = jest.fn();
    const { UNSAFE_getByType } = render(
      <GoMileInput label="Prénom" value="" onChangeText={onChangeText} />
    );
    const { TextInput } = require('react-native');
    fireEvent.changeText(UNSAFE_getByType(TextInput), 'Marie');
    expect(onChangeText).toHaveBeenCalledWith('Marie');
  });

  test('passes secureTextEntry prop to the underlying TextInput', () => {
    const { UNSAFE_getByType } = render(
      <GoMileInput label="Mot de passe" secureTextEntry />
    );
    const { TextInput } = require('react-native');
    expect(UNSAFE_getByType(TextInput).props.secureTextEntry).toBe(true);
  });

  test('passes keyboardType prop to the underlying TextInput', () => {
    const { UNSAFE_getByType } = render(
      <GoMileInput label="Email" keyboardType="email-address" />
    );
    const { TextInput } = require('react-native');
    expect(UNSAFE_getByType(TextInput).props.keyboardType).toBe('email-address');
  });

  test('passes placeholder to the underlying TextInput', () => {
    const { UNSAFE_getByType } = render(<GoMileInput placeholder="votre@email.com" />);
    const { TextInput } = require('react-native');
    expect(UNSAFE_getByType(TextInput).props.placeholder).toBe('votre@email.com');
  });
});
