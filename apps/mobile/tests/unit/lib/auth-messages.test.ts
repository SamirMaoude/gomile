// Tests for auth-messages.ts — the string constants surfaced in the logout flow.
// These strings are returned directly to the caller and may be displayed in the UI,
// so both the presence of keys and their exact values must be stable.

import { AUTH_MESSAGES } from '../../../lib/auth-messages';

describe('AUTH_MESSAGES', () => {
  test('LOGOUT_SUCCESS is defined and non-empty', () => {
    expect(typeof AUTH_MESSAGES.LOGOUT_SUCCESS).toBe('string');
    expect(AUTH_MESSAGES.LOGOUT_SUCCESS.length).toBeGreaterThan(0);
  });

  test('ALREADY_LOGGED_OUT is defined and non-empty', () => {
    expect(typeof AUTH_MESSAGES.ALREADY_LOGGED_OUT).toBe('string');
    expect(AUTH_MESSAGES.ALREADY_LOGGED_OUT.length).toBeGreaterThan(0);
  });

  test('LOGOUT_SUCCESS has the expected value', () => {
    expect(AUTH_MESSAGES.LOGOUT_SUCCESS).toBe('Deconnecte avec succes');
  });

  test('ALREADY_LOGGED_OUT has the expected value', () => {
    expect(AUTH_MESSAGES.ALREADY_LOGGED_OUT).toBe('Deja deconnecte');
  });

  test('has exactly the expected keys', () => {
    const keys = Object.keys(AUTH_MESSAGES);
    expect(keys).toContain('LOGOUT_SUCCESS');
    expect(keys).toContain('ALREADY_LOGGED_OUT');
    expect(keys).toHaveLength(2);
  });
});
