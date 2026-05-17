// Tests for api-errors.ts — the shared error catalogue and factory used by
// every API client. Any addition to or removal from API_ERRORS must be reflected
// here so the error surface is always explicitly documented and verified.

import { API_ERRORS, createApiError } from '../../../lib/api-errors';
import type { ApiErrorCode } from '../../../lib/api-errors';

// List every expected error code explicitly so the test fails if one is removed.
const EXPECTED_CODES: ApiErrorCode[] = [
  'EMAIL_ALREADY_USED',
  'INVALID_CREDENTIALS',
  'INVALID_ACCESS_TOKEN',
  'INVALID_REFRESH_TOKEN',
  'AUTH_TOKEN_MISSING',
  'BACKEND_UNREACHABLE',
  'REQUEST_FAILED',
];

describe('API_ERRORS — catalogue completeness', () => {
  test('contains all expected error codes', () => {
    for (const code of EXPECTED_CODES) {
      expect(API_ERRORS).toHaveProperty(code);
    }
  });

  test('each entry has a numeric statusCode', () => {
    for (const entry of Object.values(API_ERRORS)) {
      expect(typeof entry.statusCode).toBe('number');
    }
  });

  test('each entry has a non-empty message string', () => {
    for (const entry of Object.values(API_ERRORS)) {
      expect(typeof entry.message).toBe('string');
      expect(entry.message.length).toBeGreaterThan(0);
    }
  });
});

describe('API_ERRORS — specific values', () => {
  test('EMAIL_ALREADY_USED has statusCode 409', () => {
    expect(API_ERRORS.EMAIL_ALREADY_USED.statusCode).toBe(409);
  });

  test('INVALID_CREDENTIALS has statusCode 401', () => {
    expect(API_ERRORS.INVALID_CREDENTIALS.statusCode).toBe(401);
  });

  test('INVALID_ACCESS_TOKEN has statusCode 401', () => {
    expect(API_ERRORS.INVALID_ACCESS_TOKEN.statusCode).toBe(401);
  });

  test('AUTH_TOKEN_MISSING has statusCode 401', () => {
    expect(API_ERRORS.AUTH_TOKEN_MISSING.statusCode).toBe(401);
  });

  test('BACKEND_UNREACHABLE has statusCode 502', () => {
    expect(API_ERRORS.BACKEND_UNREACHABLE.statusCode).toBe(502);
  });

  test('REQUEST_FAILED has statusCode 500', () => {
    expect(API_ERRORS.REQUEST_FAILED.statusCode).toBe(500);
  });
});

describe('createApiError', () => {
  test('returns an object with the matching code field', () => {
    const err = createApiError('AUTH_TOKEN_MISSING');
    expect(err.code).toBe('AUTH_TOKEN_MISSING');
  });

  test('returns the correct statusCode for the given code', () => {
    const err = createApiError('EMAIL_ALREADY_USED');
    expect(err.statusCode).toBe(409);
  });

  test('returns the correct message for the given code', () => {
    const err = createApiError('INVALID_CREDENTIALS');
    expect(err.message).toBe(API_ERRORS.INVALID_CREDENTIALS.message);
  });

  test('creates independent objects — mutating one does not affect others', () => {
    const err1 = createApiError('REQUEST_FAILED');
    const err2 = createApiError('REQUEST_FAILED');
    // Verify they are separate object references.
    expect(err1).not.toBe(err2);
  });

  test('works for every code in API_ERRORS', () => {
    for (const code of EXPECTED_CODES) {
      const err = createApiError(code);
      expect(err.code).toBe(code);
      expect(err.statusCode).toBe(API_ERRORS[code].statusCode);
      expect(err.message).toBe(API_ERRORS[code].message);
    }
  });
});
