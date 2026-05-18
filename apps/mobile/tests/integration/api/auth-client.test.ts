// Integration tests for auth-client.ts — the authentication gateway.
// These tests mock global.fetch at the network boundary and use the real
// MemoryAuthTokenStore so token persistence is exercised end-to-end.
// Every exported function must handle both success and error paths.

import {
  login,
  registerDriver,
  registerMerchant,
  startDriverRegistration,
  completeDriverRegistration,
  refreshSession,
  logout,
  forgotPassword,
  getEmailStatus,
  verifyOtp,
  resetPassword,
  getStoredTokens,
} from '../../../lib/auth-client';
import { getAuthTokenStore } from '../../../lib/auth-storage';
import type { AuthTokensResponse } from '../../../lib/auth-client';

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeTokensResponse(overrides: Partial<AuthTokensResponse> = {}): AuthTokensResponse {
  return {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    user: { id: 'user-1', email: 'driver@gomile.fr', role: 'DRIVER' },
    ...overrides,
  };
}

// Builds a mock Response object that global.fetch will resolve with.
function mockResponse(data: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(data),
    text: jest.fn().mockResolvedValue(JSON.stringify(data)),
    headers: { get: jest.fn((name: string) => (name === 'content-type' ? 'application/json' : null)) },
  };
}

// Clear stored tokens before each test to prevent state leaking between cases.
beforeEach(async () => {
  await getAuthTokenStore().clearTokens();
  global.fetch = jest.fn();
});

// ── login ─────────────────────────────────────────────────────────────────────

describe('login', () => {
  test('returns the authenticated user on success', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse(makeTokensResponse()));
    const session = await login({ identifier: 'driver@gomile.fr', password: 'secret' });
    expect(session.user.email).toBe('driver@gomile.fr');
  });

  test('persists both tokens to the auth store', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      mockResponse(makeTokensResponse({ accessToken: 'at-1', refreshToken: 'rt-1' }))
    );
    await login({ identifier: 'driver@gomile.fr', password: 'secret' });
    const stored = await getAuthTokenStore().getTokens();
    expect(stored?.accessToken).toBe('at-1');
    expect(stored?.refreshToken).toBe('rt-1');
  });

  test('calls POST /auth/login with correct body', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse(makeTokensResponse()));
    await login({ identifier: 'driver@test.fr', password: 'pass123' });
    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain('/auth/login');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual({ identifier: 'driver@test.fr', password: 'pass123' });
  });

  test('throws with the backend error message on failure', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      mockResponse({ message: 'Identifiants invalides' }, 401)
    );
    await expect(login({ identifier: 'bad@test.fr', password: 'wrong' })).rejects.toThrow(
      'Identifiants invalides'
    );
  });

  test('does not persist tokens on failure', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse({ message: 'Erreur' }, 401));
    try { await login({ identifier: 'x', password: 'x' }); } catch (_) { /* expected */ }
    expect(await getAuthTokenStore().getTokens()).toBeNull();
  });
});

// ── registerDriver ────────────────────────────────────────────────────────────

describe('registerDriver', () => {
  const driverInput = {
    email: 'nouveau@gomile.fr',
    password: 'Secret123!',
    firstName: 'Jean',
    lastName: 'Dupont',
    phone: '0600000000',
    gender: 'MALE' as const,
    dateOfBirth: '1990-01-01',
    address: '12 rue de la Paix',
    deliveryCity: 'Grenoble',
    deliveryRadius: 10,
    transportType: 'CAR' as const,
  };

  test('returns the authenticated session on success', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      mockResponse(makeTokensResponse({ user: { id: 'u-2', email: 'nouveau@gomile.fr', role: 'DRIVER' } }))
    );
    const session = await registerDriver(driverInput);
    expect(session.user.role).toBe('DRIVER');
  });

  test('calls POST /auth/register/driver', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse(makeTokensResponse()));
    await registerDriver(driverInput);
    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain('/auth/register/driver');
  });

  test('persists tokens after successful registration', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      mockResponse(makeTokensResponse({ accessToken: 'reg-at', refreshToken: 'reg-rt' }))
    );
    await registerDriver(driverInput);
    const stored = await getAuthTokenStore().getTokens();
    expect(stored?.accessToken).toBe('reg-at');
  });

  test('throws on 409 email already used', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      mockResponse({ message: 'Email deja utilise' }, 409)
    );
    await expect(registerDriver(driverInput)).rejects.toThrow('Email deja utilise');
  });
});

// ── registerMerchant ──────────────────────────────────────────────────────────

describe('registerMerchant', () => {
  test('calls POST /auth/register/merchant', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse(makeTokensResponse()));
    await registerMerchant({ email: 'm@shop.fr', password: 'pass', name: 'Mon Commerce' });
    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain('/auth/register/merchant');
  });

  test('persists tokens on success', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      mockResponse(makeTokensResponse({ accessToken: 'm-at', refreshToken: 'm-rt' }))
    );
    await registerMerchant({ email: 'm@shop.fr', password: 'pass', name: 'Shop' });
    const stored = await getAuthTokenStore().getTokens();
    expect(stored?.accessToken).toBe('m-at');
  });
});

// ── startDriverRegistration ───────────────────────────────────────────────────

describe('startDriverRegistration', () => {
  test('calls POST /auth/register/driver/start', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse(makeTokensResponse()));
    await startDriverRegistration({ email: 'x@test.fr', password: 'p', firstName: 'Jean', lastName: 'D' });
    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain('/auth/register/driver/start');
  });
});

// ── completeDriverRegistration ────────────────────────────────────────────────

describe('completeDriverRegistration', () => {
  test('throws AUTH_TOKEN_MISSING when no access token is stored', async () => {
    await expect(
      completeDriverRegistration({ deliveryCity: 'Lyon', deliveryRadius: 5, transportType: 'BIKE' })
    ).rejects.toThrow("Jeton d'authentification manquant");
  });

  test('calls POST /auth/complete-registration with the access token', async () => {
    await getAuthTokenStore().setTokens({ accessToken: 'at', refreshToken: 'rt' });
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse({ message: 'ok' }));
    await completeDriverRegistration({ deliveryCity: 'Paris' });
    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain('/auth/complete-registration');
    expect(options.headers.authorization).toBe('Bearer at');
  });
});

// ── refreshSession ────────────────────────────────────────────────────────────

describe('refreshSession', () => {
  test('throws AUTH_TOKEN_MISSING when no refresh token is stored', async () => {
    await expect(refreshSession()).rejects.toThrow("Jeton d'authentification manquant");
  });

  test('rotates tokens on success', async () => {
    await getAuthTokenStore().setTokens({ accessToken: 'old-at', refreshToken: 'old-rt' });
    (global.fetch as jest.Mock).mockResolvedValue(
      mockResponse(makeTokensResponse({ accessToken: 'new-at', refreshToken: 'new-rt' }))
    );
    await refreshSession();
    const stored = await getAuthTokenStore().getTokens();
    expect(stored?.accessToken).toBe('new-at');
    expect(stored?.refreshToken).toBe('new-rt');
  });

  test('uses the refresh token as the bearer token', async () => {
    await getAuthTokenStore().setTokens({ accessToken: 'at', refreshToken: 'my-rt' });
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse(makeTokensResponse()));
    await refreshSession();
    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(options.headers.authorization).toBe('Bearer my-rt');
  });
});

// ── logout ────────────────────────────────────────────────────────────────────

describe('logout', () => {
  test('returns ALREADY_LOGGED_OUT message when no access token is stored', async () => {
    const result = await logout();
    expect(result.message).toBe('Deja deconnecte');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('clears tokens from the store on successful logout', async () => {
    await getAuthTokenStore().setTokens({ accessToken: 'at', refreshToken: 'rt' });
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse({ message: 'Deconnecte avec succes' }));
    await logout();
    expect(await getAuthTokenStore().getTokens()).toBeNull();
  });

  test('calls POST /auth/logout with the access token as bearer', async () => {
    await getAuthTokenStore().setTokens({ accessToken: 'session-at', refreshToken: 'rt' });
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse({ message: 'ok' }));
    await logout();
    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain('/auth/logout');
    expect(options.headers.authorization).toBe('Bearer session-at');
  });
});

// ── forgotPassword ────────────────────────────────────────────────────────────

describe('forgotPassword', () => {
  test('calls POST /auth/forgot-password with the provided email', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse({ message: 'ok' }));
    await forgotPassword({ email: 'driver@gomile.fr' });
    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain('/auth/forgot-password');
    expect(JSON.parse(options.body)).toEqual({ email: 'driver@gomile.fr' });
  });

  test('throws on error response', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      mockResponse({ message: 'Email introuvable' }, 404)
    );
    await expect(forgotPassword({ email: 'unknown@test.fr' })).rejects.toThrow('Email introuvable');
  });
});

// ── getEmailStatus ────────────────────────────────────────────────────────────

describe('getEmailStatus', () => {
  test('throws AUTH_TOKEN_MISSING when no token is stored', async () => {
    await expect(getEmailStatus()).rejects.toThrow("Jeton d'authentification manquant");
  });

  test('returns emailVerified boolean on success', async () => {
    await getAuthTokenStore().setTokens({ accessToken: 'at', refreshToken: 'rt' });
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse({ emailVerified: true }));
    const result = await getEmailStatus();
    expect(result.emailVerified).toBe(true);
  });
});

// ── verifyOtp ─────────────────────────────────────────────────────────────────

describe('verifyOtp', () => {
  test('calls POST /auth/verify-otp and returns a resetToken', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse({ resetToken: 'reset-tok' }));
    const result = await verifyOtp({ email: 'test@test.fr', otp: '123456' });
    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain('/auth/verify-otp');
    expect(result.resetToken).toBe('reset-tok');
  });

  test('throws when the OTP is invalid', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse({ message: 'OTP invalide' }, 400));
    await expect(verifyOtp({ email: 'test@test.fr', otp: '000000' })).rejects.toThrow('OTP invalide');
  });
});

// ── resetPassword ─────────────────────────────────────────────────────────────

describe('resetPassword', () => {
  test('calls POST /auth/reset-password with all required fields', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse({ message: 'ok' }));
    await resetPassword({ email: 'test@test.fr', resetToken: 'tok', newPassword: 'NewPass1!' });
    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain('/auth/reset-password');
    const body = JSON.parse(options.body);
    expect(body.email).toBe('test@test.fr');
    expect(body.resetToken).toBe('tok');
    expect(body.newPassword).toBe('NewPass1!');
  });
});

// ── getStoredTokens ───────────────────────────────────────────────────────────

describe('getStoredTokens', () => {
  test('returns null when no tokens are stored', async () => {
    const result = await getStoredTokens();
    expect(result).toBeNull();
  });

  test('returns the stored token pair', async () => {
    await getAuthTokenStore().setTokens({ accessToken: 'at', refreshToken: 'rt' });
    const result = await getStoredTokens();
    expect(result?.accessToken).toBe('at');
    expect(result?.refreshToken).toBe('rt');
  });
});
