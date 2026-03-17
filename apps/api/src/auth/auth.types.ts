import type { AuthTokensResponse, AuthUser, Role } from '../../../../shared/auth-contracts';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  jti?: string;
}

export type AuthenticatedUser = AuthUser;

export type AuthResponse = AuthTokensResponse;
