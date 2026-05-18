// Tests for geocode.js — the utility module that converts addresses to
// coordinates (forward geocoding) and coordinates back to addresses (reverse
// geocoding) using the French government API at api-adresse.data.gouv.fr.
//
// Both functions cache results in module-level Maps to avoid redundant requests
// during polling. The cache is tested by verifying fetch is not called twice for
// the same input, and it persists across calls within the same module instance.

import { geocodeAddress, reverseGeocodeCoords } from '../../../lib/geocode';

// Helper that builds a valid api-adresse.data.gouv.fr forward geocoding response.
function makeForwardResponse(lat, lon) {
  return {
    features: [
      {
        geometry: { coordinates: [lon, lat] },
        properties: { label: `${lat},${lon}` },
      },
    ],
  };
}

// Helper that builds a valid reverse geocoding response.
function makeReverseResponse(label) {
  return {
    features: [{ properties: { label } }],
  };
}

// Factory for a successful fetch mock.
function mockFetch(data) {
  return jest.fn().mockResolvedValue({
    ok: true,
    json: jest.fn().mockResolvedValue(data),
  });
}

// The geocode module uses module-level Maps as cache. Because Jest re-uses the
// module between tests in the same file, cache hits from earlier tests will
// affect later ones. Tests below are written to be cache-aware: they use unique
// address strings so each test exercises the uncached path independently.

describe('geocodeAddress', () => {
  test('returns null for an empty string without calling fetch', async () => {
    const result = await geocodeAddress('');
    expect(result).toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('returns null for undefined without calling fetch', async () => {
    const result = await geocodeAddress(undefined);
    expect(result).toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('returns { latitude, longitude } on a successful API response', async () => {
    global.fetch = mockFetch(makeForwardResponse(45.1885, 5.7245));
    const result = await geocodeAddress('unique-address-success-1');
    expect(result).toEqual({ latitude: 45.1885, longitude: 5.7245 });
  });

  test('returns null when the API returns an empty features array', async () => {
    global.fetch = mockFetch({ features: [] });
    const result = await geocodeAddress('unique-address-empty-features');
    expect(result).toBeNull();
  });

  test('returns null when the API response is not ok', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false });
    const result = await geocodeAddress('unique-address-not-ok');
    expect(result).toBeNull();
  });

  test('returns null when fetch throws a network error', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('network failure'));
    const result = await geocodeAddress('unique-address-network-error');
    expect(result).toBeNull();
  });

  test('uses the cache and does not call fetch a second time for the same address', async () => {
    global.fetch = mockFetch(makeForwardResponse(48.8566, 2.3522));
    const address = 'unique-address-cache-test';
    const first = await geocodeAddress(address);
    const second = await geocodeAddress(address);
    expect(first).toEqual(second);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test('encodes the address in the query string', async () => {
    global.fetch = mockFetch(makeForwardResponse(45, 5));
    await geocodeAddress('unique rue des café spécial');
    const calledUrl = global.fetch.mock.calls[0][0];
    expect(calledUrl).toContain(encodeURIComponent('unique rue des café spécial'));
  });
});

describe('reverseGeocodeCoords', () => {
  test('returns the label from a successful API response', async () => {
    global.fetch = mockFetch(makeReverseResponse('12 rue de la Paix, Grenoble'));
    const result = await reverseGeocodeCoords(45.1885, 5.7245);
    expect(result).toBe('12 rue de la Paix, Grenoble');
  });

  test('returns null when the API response is not ok', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false });
    const result = await reverseGeocodeCoords(0.0001, 0.0001);
    expect(result).toBeNull();
  });

  test('returns null when features array is empty', async () => {
    global.fetch = mockFetch({ features: [] });
    const result = await reverseGeocodeCoords(0.0002, 0.0002);
    expect(result).toBeNull();
  });

  test('returns null when fetch throws', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('timeout'));
    const result = await reverseGeocodeCoords(0.0003, 0.0003);
    expect(result).toBeNull();
  });

  test('uses the cache for identical coordinates', async () => {
    global.fetch = mockFetch(makeReverseResponse('Cached Address'));
    const first = await reverseGeocodeCoords(99.9999, 99.9998);
    const second = await reverseGeocodeCoords(99.9999, 99.9998);
    expect(first).toBe(second);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test('passes lat and lon as query parameters', async () => {
    global.fetch = mockFetch(makeReverseResponse('Test'));
    await reverseGeocodeCoords(45.5555, 6.6666);
    const calledUrl = global.fetch.mock.calls[0][0];
    expect(calledUrl).toContain('lat=45.5555');
    expect(calledUrl).toContain('lon=6.6666');
  });
});
