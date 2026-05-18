// Tests for auth-contracts.ts — the shared type constants that define valid
// roles, genders, and vehicle types across the entire platform. These are used
// for input validation in the registration flow and for API payloads. Any
// change to these lists must be intentional and reflected here.

import {
  APP_ROLES,
  APP_GENDERS,
  APP_VEHICLE_TYPES,
} from '../../../lib/auth-contracts';

describe('APP_ROLES', () => {
  test('contains ADMIN', () => {
    expect(APP_ROLES).toContain('ADMIN');
  });

  test('contains DRIVER', () => {
    expect(APP_ROLES).toContain('DRIVER');
  });

  test('contains CUSTOMER', () => {
    expect(APP_ROLES).toContain('CUSTOMER');
  });

  test('contains MERCHANT', () => {
    expect(APP_ROLES).toContain('MERCHANT');
  });

  test('has exactly 4 roles', () => {
    expect(APP_ROLES).toHaveLength(4);
  });
});

describe('APP_GENDERS', () => {
  test('contains MALE', () => {
    expect(APP_GENDERS).toContain('MALE');
  });

  test('contains FEMALE', () => {
    expect(APP_GENDERS).toContain('FEMALE');
  });

  test('contains UNDEFINED', () => {
    expect(APP_GENDERS).toContain('UNDEFINED');
  });

  test('has exactly 3 genders', () => {
    expect(APP_GENDERS).toHaveLength(3);
  });
});

describe('APP_VEHICLE_TYPES', () => {
  test('contains CAR', () => {
    expect(APP_VEHICLE_TYPES).toContain('CAR');
  });

  test('contains BIKE', () => {
    expect(APP_VEHICLE_TYPES).toContain('BIKE');
  });

  test('contains SCOOTER', () => {
    expect(APP_VEHICLE_TYPES).toContain('SCOOTER');
  });

  test('contains TRUCK', () => {
    expect(APP_VEHICLE_TYPES).toContain('TRUCK');
  });

  test('has exactly 4 vehicle types', () => {
    expect(APP_VEHICLE_TYPES).toHaveLength(4);
  });
});
