// Integration tests for driver-client.ts — the authenticated API layer for all
// driver operations. Every function uses requestDriverApi which handles token
// injection and automatic refresh on 401. Tests here exercise the happy path,
// the missing-token guard, the 401→refresh→retry cycle, and the EMAIL_NOT_VERIFIED
// redirect behaviour that driver-client uniquely implements.

import {
  getDriverDashboard,
  toggleDriverAvailability,
  updateDriverLocation,
  getAvailableMissions,
  acceptMission,
  getActiveMissions,
  getMissionHistory,
  verifyMerchantHandshake,
  verifyClientHandshake,
  getMissionPickupCode,
  getWallet,
  getWalletEntries,
  requestWithdrawal,
  putDriverPushToken,
  getDriverProfile,
  updateDriverProfile,
  updateSessionVehicle,
  getMyKycStatus,
  submitMyKyc,
  getMyDocuments,
  createMyDocument,
  presignDocument,
  deleteDocument,
  getMyReferral,
} from '../../../lib/driver-client';
import { getAuthTokenStore } from '../../../lib/auth-storage';

// ── Helpers ───────────────────────────────────────────────────────────────────

function mockResponse(data: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(data),
    text: jest.fn().mockResolvedValue(JSON.stringify(data)),
    headers: {
      get: jest.fn((name: string) => (name === 'content-type' ? 'application/json' : null)),
    },
  };
}

// Seed a valid access token so every test starts authenticated.
beforeEach(async () => {
  await getAuthTokenStore().setTokens({ accessToken: 'valid-at', refreshToken: 'valid-rt' });
  global.fetch = jest.fn();
});

afterEach(async () => {
  await getAuthTokenStore().clearTokens();
});

// ── AUTH_TOKEN_MISSING guard ──────────────────────────────────────────────────

describe('requestDriverApi — missing token guard', () => {
  test('throws AUTH_TOKEN_MISSING when no access token is in the store', async () => {
    await getAuthTokenStore().clearTokens();
    await expect(getDriverDashboard()).rejects.toThrow("Jeton d'authentification manquant");
  });
});

// ── 401 automatic token refresh ───────────────────────────────────────────────

describe('requestDriverApi — 401 auto-refresh', () => {
  test('retries the request with a new access token after a 401 response', async () => {
    // First call returns 401 to trigger a refresh, second call returns the refresh
    // token response, third call is the retried original request.
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(mockResponse({}, 401))
      .mockResolvedValueOnce(
        mockResponse({ accessToken: 'new-at', refreshToken: 'new-rt', user: { id: 'u', email: 'e', role: 'DRIVER' } })
      )
      .mockResolvedValueOnce(mockResponse({ isOnline: true, todayEarnings: 0, todayTrips: 0 }));

    const result = await getDriverDashboard();
    expect(result.isOnline).toBe(true);
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  test('throws AUTH_TOKEN_MISSING when the refresh call itself fails', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(mockResponse({}, 401))
      .mockRejectedValueOnce(new Error('refresh network error'));

    await expect(getDriverDashboard()).rejects.toThrow("Jeton d'authentification manquant");
  });
});

// ── getDriverDashboard ────────────────────────────────────────────────────────

describe('getDriverDashboard', () => {
  test('calls GET /driver/me/dashboard', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      mockResponse({ isOnline: false, todayEarnings: 12.5, todayTrips: 3 })
    );
    const result = await getDriverDashboard();
    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain('/driver/me/dashboard');
    expect(result.todayEarnings).toBe(12.5);
    expect(result.todayTrips).toBe(3);
  });
});

// ── toggleDriverAvailability ──────────────────────────────────────────────────

describe('toggleDriverAvailability', () => {
  test('calls PATCH /driver/me/availability', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse({ message: 'ok' }));
    await toggleDriverAvailability();
    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain('/driver/me/availability');
    expect(options.method).toBe('PATCH');
  });
});

// ── updateDriverLocation ──────────────────────────────────────────────────────

describe('updateDriverLocation', () => {
  test('sends latitude and longitude in the request body', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse({ message: 'ok' }));
    await updateDriverLocation(45.1885, 5.7245);
    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain('/driver/me/location');
    expect(JSON.parse(options.body)).toEqual({ latitude: 45.1885, longitude: 5.7245 });
  });
});

// ── getAvailableMissions ──────────────────────────────────────────────────────

describe('getAvailableMissions', () => {
  test('returns the mission array from the backend', async () => {
    const missions = [{ id: 'm-1', type: 'DELIVERY', reward: 5 }];
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse(missions));
    const result = await getAvailableMissions();
    expect(result).toEqual(missions);
  });
});

// ── acceptMission ─────────────────────────────────────────────────────────────

describe('acceptMission', () => {
  test('calls POST /driver/me/missions/:id/accept', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse({ message: 'ok' }));
    await acceptMission('mission-42');
    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain('/driver/me/missions/mission-42/accept');
    expect(options.method).toBe('POST');
  });
});

// ── getActiveMissions ─────────────────────────────────────────────────────────

describe('getActiveMissions', () => {
  test('calls GET /driver/me/missions/active and returns the list', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse([]));
    const result = await getActiveMissions();
    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain('/driver/me/missions/active');
    expect(Array.isArray(result)).toBe(true);
  });
});

// ── getMissionHistory ─────────────────────────────────────────────────────────

describe('getMissionHistory', () => {
  test('calls GET /driver/me/missions/history', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse([]));
    await getMissionHistory();
    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain('/driver/me/missions/history');
  });
});

// ── verifyMerchantHandshake ───────────────────────────────────────────────────

describe('verifyMerchantHandshake', () => {
  test('posts the pickup code to the merchant handshake endpoint', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      mockResponse({ orderId: 'order-1', message: 'ok' })
    );
    const result = await verifyMerchantHandshake('mission-1', 'ABCD');
    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain('/driver/me/missions/mission-1/handshake/merchant/verify');
    expect(JSON.parse(options.body)).toEqual({ code: 'ABCD' });
    expect(result.orderId).toBe('order-1');
  });
});

// ── verifyClientHandshake ─────────────────────────────────────────────────────

describe('verifyClientHandshake', () => {
  test('posts the delivery code to the client handshake endpoint', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      mockResponse({ orderId: 'order-1', message: 'livraison confirmee' })
    );
    const result = await verifyClientHandshake('mission-1', 'WXYZ');
    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain('/driver/me/missions/mission-1/handshake/client/verify');
    expect(JSON.parse(options.body)).toEqual({ code: 'WXYZ' });
    expect(result.message).toBe('livraison confirmee');
  });
});

// ── getMissionPickupCode ──────────────────────────────────────────────────────

describe('getMissionPickupCode', () => {
  test('calls the pickup-code endpoint for the given mission', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse({ pickupCode: '1234' }));
    const result = await getMissionPickupCode('mission-5');
    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain('/driver/me/missions/mission-5/handshake/pickup-code');
    expect(result.pickupCode).toBe('1234');
  });
});

// ── getWallet ─────────────────────────────────────────────────────────────────

describe('getWallet', () => {
  test('returns wallet balance and currency', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      mockResponse({ balance: 42.5, currency: 'EUR', pendingAmount: 5 })
    );
    const result = await getWallet();
    expect(result.balance).toBe(42.5);
    expect(result.currency).toBe('EUR');
  });
});

// ── getWalletEntries ──────────────────────────────────────────────────────────

describe('getWalletEntries', () => {
  test('returns an array of wallet entries', async () => {
    const entries = [{ id: 'e-1', type: 'CREDIT', amount: 10, status: 'PAID', createdAt: '' }];
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse(entries));
    const result = await getWalletEntries();
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('CREDIT');
  });
});

// ── requestWithdrawal ─────────────────────────────────────────────────────────

describe('requestWithdrawal', () => {
  test('sends the amount in the request body', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse({ message: 'ok' }));
    await requestWithdrawal(25);
    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(JSON.parse(options.body)).toEqual({ amount: 25 });
  });
});

// ── putDriverPushToken ────────────────────────────────────────────────────────

describe('putDriverPushToken', () => {
  test('sends the push token via PUT /driver/me/push-token', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse({ message: 'ok' }));
    await putDriverPushToken('ExpoToken[abc123]');
    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain('/driver/me/push-token');
    expect(options.method).toBe('PUT');
    expect(JSON.parse(options.body)).toEqual({ token: 'ExpoToken[abc123]' });
  });
});

// ── getDriverProfile ──────────────────────────────────────────────────────────

describe('getDriverProfile', () => {
  test('returns the driver profile fields', async () => {
    const profile = { id: 'u-1', firstName: 'Jean', lastName: 'Dupont', phone: '0600', email: 'j@g.fr' };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse(profile));
    const result = await getDriverProfile();
    expect(result.firstName).toBe('Jean');
    expect(result.email).toBe('j@g.fr');
  });
});

// ── updateDriverProfile ───────────────────────────────────────────────────────

describe('updateDriverProfile', () => {
  test('sends PATCH /driver/me/profile with the provided fields', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse({ message: 'ok' }));
    await updateDriverProfile({ avatarUrl: 'https://cdn.gomile.fr/avatar.jpg' });
    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain('/driver/me/profile');
    expect(options.method).toBe('PATCH');
    expect(JSON.parse(options.body).avatarUrl).toBe('https://cdn.gomile.fr/avatar.jpg');
  });
});

// ── updateSessionVehicle ──────────────────────────────────────────────────────

describe('updateSessionVehicle', () => {
  test('sends the vehicleType in the body', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse({ activeVehicle: 'SCOOTER' }));
    const result = await updateSessionVehicle('SCOOTER');
    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(JSON.parse(options.body)).toEqual({ vehicleType: 'SCOOTER' });
    expect(result.activeVehicle).toBe('SCOOTER');
  });
});

// ── KYC ──────────────────────────────────────────────────────────────────────

describe('getMyKycStatus', () => {
  test('returns KYC status from the backend', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      mockResponse({ status: 'PENDING', latestSubmission: null })
    );
    const result = await getMyKycStatus();
    expect(result.status).toBe('PENDING');
  });
});

describe('submitMyKyc', () => {
  test('calls POST /driver/me/kyc', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse({ message: 'soumis' }));
    await submitMyKyc();
    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain('/driver/me/kyc');
    expect(options.method).toBe('POST');
  });
});

// ── Documents ─────────────────────────────────────────────────────────────────

describe('getMyDocuments', () => {
  test('returns the documents array', async () => {
    const docs = [{ id: 'd-1', type: 'CNI', url: 'https://cdn.com/doc.jpg', verified: false, createdAt: '' }];
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse(docs));
    const result = await getMyDocuments();
    expect(result[0].type).toBe('CNI');
  });
});

describe('createMyDocument', () => {
  test('posts type and url to /driver/me/documents', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      mockResponse({ id: 'd-2', type: 'PERMIS', url: 'https://cdn.com/p.pdf', verified: false })
    );
    const result = await createMyDocument('PERMIS', 'https://cdn.com/p.pdf');
    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain('/driver/me/documents');
    expect(JSON.parse(options.body)).toEqual({ type: 'PERMIS', url: 'https://cdn.com/p.pdf' });
    expect(result.type).toBe('PERMIS');
  });
});

describe('presignDocument', () => {
  test('returns uploadUrl and fileUrl', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      mockResponse({ uploadUrl: 'https://s3.aws/upload?sig=abc', fileUrl: 'https://cdn.com/file.pdf' })
    );
    const result = await presignDocument('cni.pdf', 'application/pdf');
    expect(result.uploadUrl).toContain('s3.aws');
    expect(result.fileUrl).toContain('cdn.com');
  });
});

describe('deleteDocument', () => {
  test('calls DELETE /driver/me/documents/:id', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse({ message: 'supprime' }));
    await deleteDocument('doc-99');
    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain('/driver/me/documents/doc-99');
    expect(options.method).toBe('DELETE');
  });
});

// ── getMyReferral ─────────────────────────────────────────────────────────────

describe('getMyReferral', () => {
  test('returns the referral code and total referrals on success', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      mockResponse({ code: 'REF-ABC123', totalReferrals: 3 })
    );
    const result = await getMyReferral();
    expect(result?.code).toBe('REF-ABC123');
    expect(result?.totalReferrals).toBe(3);
  });

  test('returns null instead of throwing when the backend returns an error', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse({ message: 'Not found' }, 404));
    const result = await getMyReferral();
    expect(result).toBeNull();
  });
});

// ── EMAIL_NOT_VERIFIED redirect ───────────────────────────────────────────────

describe('requestDriverApi — EMAIL_NOT_VERIFIED redirect', () => {
  test('throws EMAIL_NOT_VERIFIED error when backend returns 403 with that code', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      mockResponse({ message: 'EMAIL_NOT_VERIFIED' }, 403)
    );
    await expect(getDriverDashboard()).rejects.toThrow('EMAIL_NOT_VERIFIED');
  });
});
