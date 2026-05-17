// Tests for auth-storage.ts — the token persistence layer that all API clients
// depend on. MemoryAuthTokenStore is the default implementation used in development
// and in tests. setAuthTokenStore allows the app to swap in SecureStore for production.
// Correctness here directly impacts session management across every authenticated call.

import { getAuthTokenStore, setAuthTokenStore } from '../../../lib/auth-storage';
import type { AuthTokenStore, AuthTokenSet } from '../../../lib/auth-storage';

// Tokens used across multiple test cases for consistency.
const SAMPLE_TOKENS: AuthTokenSet = {
  accessToken: 'access-token-abc',
  refreshToken: 'refresh-token-xyz',
};

// The default store is a module-level singleton. Reset it to null state before
// each test by calling clearTokens so tests do not share token state.
beforeEach(async () => {
  await getAuthTokenStore().clearTokens();
});

describe('MemoryAuthTokenStore — getTokens', () => {
  test('returns null when no tokens have been stored', async () => {
    const result = await getAuthTokenStore().getTokens();
    expect(result).toBeNull();
  });

  test('returns stored tokens after setTokens is called', async () => {
    await getAuthTokenStore().setTokens(SAMPLE_TOKENS);
    const result = await getAuthTokenStore().getTokens();
    expect(result).toEqual(SAMPLE_TOKENS);
  });
});

describe('MemoryAuthTokenStore — setTokens', () => {
  test('persists both accessToken and refreshToken', async () => {
    await getAuthTokenStore().setTokens(SAMPLE_TOKENS);
    const stored = await getAuthTokenStore().getTokens();
    expect(stored?.accessToken).toBe(SAMPLE_TOKENS.accessToken);
    expect(stored?.refreshToken).toBe(SAMPLE_TOKENS.refreshToken);
  });

  test('overwrites previously stored tokens', async () => {
    await getAuthTokenStore().setTokens(SAMPLE_TOKENS);
    const updated: AuthTokenSet = {
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
    };
    await getAuthTokenStore().setTokens(updated);
    const stored = await getAuthTokenStore().getTokens();
    expect(stored?.accessToken).toBe('new-access');
    expect(stored?.refreshToken).toBe('new-refresh');
  });
});

describe('MemoryAuthTokenStore — clearTokens', () => {
  test('sets stored tokens to null after clearTokens', async () => {
    await getAuthTokenStore().setTokens(SAMPLE_TOKENS);
    await getAuthTokenStore().clearTokens();
    const result = await getAuthTokenStore().getTokens();
    expect(result).toBeNull();
  });

  test('is safe to call when no tokens are stored', async () => {
    await expect(getAuthTokenStore().clearTokens()).resolves.not.toThrow();
  });
});

describe('setAuthTokenStore — custom store injection', () => {
  // Restore the original store after this describe block to avoid breaking
  // later tests that depend on the default MemoryAuthTokenStore.
  let originalStore: AuthTokenStore;
  beforeAll(() => { originalStore = getAuthTokenStore(); });
  afterAll(() => { setAuthTokenStore(originalStore); });

  test('replaces the active store so getAuthTokenStore returns the new one', async () => {
    let inMemory: AuthTokenSet | null = null;

    const customStore: AuthTokenStore = {
      getTokens: async () => inMemory,
      setTokens: async (t) => { inMemory = t; },
      clearTokens: async () => { inMemory = null; },
    };

    setAuthTokenStore(customStore);

    await getAuthTokenStore().setTokens(SAMPLE_TOKENS);
    const stored = await getAuthTokenStore().getTokens();
    expect(stored).toEqual(SAMPLE_TOKENS);
    // Confirm the custom implementation was actually called (not the original).
    expect(inMemory).toEqual(SAMPLE_TOKENS);
  });
});
