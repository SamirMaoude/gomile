// Shared auth contracts reused by backend, web, and mobile clients.
export const APP_ROLES = [
  'ADMIN',
  'DRIVER',
  'CUSTOMER',
  'MERCHANT',
] as const;

export type Role = (typeof APP_ROLES)[number];

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
}

export interface RegisterDriverInput {
  email: string;
  password: string;
  name: string;
  phone: string;
}

export interface LoginInput {
  email: string;
  password: string;
}
