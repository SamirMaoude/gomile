// Shared auth contracts reused by backend, web, and mobile clients.
export const APP_ROLES = [
  'ADMIN',
  'DRIVER',
  'CUSTOMER',
  'MERCHANT',
] as const;

export type Role = (typeof APP_ROLES)[number];

export const APP_GENDERS = [
  'MALE',
  'FEMALE',
  'UNDEFINED',
] as const;

export type Gender = (typeof APP_GENDERS)[number];

export const APP_VEHICLE_TYPES = [
  'CAR',
  'BIKE',
  'SCOOTER',
  'TRUCK',
] as const;

export type VehicleType = (typeof APP_VEHICLE_TYPES)[number];

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}

export interface AuthSession {
  user: AuthUser;
}

// Raw backend auth response before a platform-specific client stores tokens.
export interface AuthTokensResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface LogoutResponse {
  message: string;
}

export interface RegisterMerchantInput {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface RegisterDriverInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  gender: Gender;
  dateOfBirth: string;
  address?: string;
  city?: string;
  zipCode?: string;
  street?: string;
  deliveryCity: string;
  deliveryRadius: number;
  transportType: VehicleType;
  avatarUrl?: string;
  cniFile?: string;
  justificatifFile?: string;
  permisFile?: string;
  carteGriseFile?: string;
  siret?: string;
  kbisFile?: string;
  ribFile?: string;
}

export interface LoginInput {
  identifier: string;
  password: string;
}
