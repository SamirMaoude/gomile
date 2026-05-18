import Constants from "expo-constants";

import type {
  AuthSession,
  AuthTokensResponse,
  AuthUser,
  LoginInput,
  LogoutResponse,
  RegisterDriverInput,
  RegisterMerchantInput,
  Role,
  ForgotPasswordInput,
} from "./auth-contracts";
import { AUTH_MESSAGES } from "./auth-messages";
import type { ApiErrorPayload } from "./api-errors";
import { createApiError } from "./api-errors";
import { getAuthTokenStore } from "./auth-storage";

const DEFAULT_API_BASE_URL = "http://localhost:3000";

type ExpoExtraConfig = {
  apiBaseUrl?: string;
};

function resolveApiBaseUrl() {
  const expoExtra = (Constants.expoConfig?.extra ?? {}) as ExpoExtraConfig;

  return (
    process.env.EXPO_PUBLIC_API_BASE_URL ??
    expoExtra.apiBaseUrl ??
    DEFAULT_API_BASE_URL
  );
}

function buildTargetUrl(path: string) {
  return new URL(path, resolveApiBaseUrl()).toString();
}

async function parseError(response: Response) {
  const fallbackError = createApiError("REQUEST_FAILED");
  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    const payload = (await response.json()) as Partial<ApiErrorPayload>;
    const message = payload.message;
    if (Array.isArray(message)) {
      return message.join("\n");
    }
    if (typeof message === "string") {
      return message;
    }
    return payload.code ?? `Erreur ${response.status}`;
  }

  const text = await response.text();
  return text || fallbackError.message;
}

// Mobile talks directly to the Nest API and optionally attaches a bearer token.
async function requestApi<T>(
  path: string,
  init?: RequestInit,
  accessToken?: string,
): Promise<T> {
  const response = await fetch(buildTargetUrl(path), {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const err = await parseError(response);
    throw new Error(`${path} - ${err}`);
  }

  return (await response.json()) as T;
}

// Store issued tokens after login, registration, or refresh.
async function persistTokens(tokens: AuthTokensResponse) {
  await getAuthTokenStore().setTokens({
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  });
}

// Mobile exposes only the authenticated user to the app layer.
function toSession(response: AuthTokensResponse): AuthSession {
  return {
    user: response.user,
  };
}

export type {
  AuthSession,
  AuthTokensResponse,
  AuthUser,
  LoginInput,
  LogoutResponse,
  RegisterDriverInput,
  RegisterMerchantInput,
  Role,
  ForgotPasswordInput,
};

// Registers a merchant account, stores issued tokens, and returns the authenticated user.
export async function registerMerchant(input: RegisterMerchantInput) {
  const response = await requestApi<AuthTokensResponse>(
    "/auth/register/merchant",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );

  await persistTokens(response);
  return toSession(response);
}

// Registers a driver account, stores issued tokens, and returns the authenticated user.
export async function registerDriver(input: RegisterDriverInput) {
  const response = await requestApi<AuthTokensResponse>("/auth/register/driver", {
    method: "POST",
    body: JSON.stringify(input),
  });

  await persistTokens(response);
  return toSession(response);
}

// Starts driver registration - first step with basic info only
export async function startDriverRegistration(input: Partial<RegisterDriverInput>) {
  const response = await requestApi<AuthTokensResponse>("/auth/register/driver/start", {
    method: "POST",
    body: JSON.stringify(input),
  });

  await persistTokens(response);
  return toSession(response);
}

// Completes driver registration with full information (for authenticated users)
export async function completeDriverRegistration(input: Partial<RegisterDriverInput>) {
  const tokens = await getAuthTokenStore().getTokens();

  if (!tokens?.accessToken) {
    throw new Error(createApiError("AUTH_TOKEN_MISSING").message);
  }

  return requestApi<{ message: string }>(
    "/auth/complete-registration",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
    tokens.accessToken,
  );
}

// Logs in an existing user, stores issued tokens, and returns the authenticated user.
export async function login(input: LoginInput) {
  const response = await requestApi<AuthTokensResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });

  await persistTokens(response);
  return toSession(response);
}

// Uses the stored refresh token to rotate tokens and keep the mobile session alive.
export async function refreshSession() {
  const tokens = await getAuthTokenStore().getTokens();

  if (!tokens?.refreshToken) {
    throw new Error(createApiError("AUTH_TOKEN_MISSING").message);
  }

  const response = await requestApi<AuthTokensResponse>(
    "/auth/refresh",
    {
      method: "POST",
    },
    tokens.refreshToken,
  );

  await persistTokens(response);
  return toSession(response);
}

// Logs out with the stored access token and clears the local token store.
export async function logout(): Promise<LogoutResponse> {
  const tokens = await getAuthTokenStore().getTokens();

  if (!tokens?.accessToken) {
    await getAuthTokenStore().clearTokens();
    return { message: AUTH_MESSAGES.ALREADY_LOGGED_OUT };
  }

  const response = await requestApi<LogoutResponse>(
    "/auth/logout",
    {
      method: "POST",
    },
    tokens.accessToken,
  );

  await getAuthTokenStore().clearTokens();
  return response;
}

// Requests a password reset code to be sent to the provided email.
export async function forgotPassword(input: ForgotPasswordInput) {
  return requestApi<{ message: string }>(
    "/auth/forgot-password",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

// Checks the email verification status of the current user.
export async function getEmailStatus() {
  const tokens = await getAuthTokenStore().getTokens();

  if (!tokens?.accessToken) {
    throw new Error(createApiError("AUTH_TOKEN_MISSING").message);
  }

  return requestApi<{ emailVerified: boolean }>(
    "/auth/email-status",
    {
      method: "GET",
    },
    tokens.accessToken,
  );
}

// Verifies the OTP sent by forgot-password and returns a short-lived reset token.
export async function verifyOtp(input: { email: string; otp: string }) {
  return requestApi<{ resetToken: string }>("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// Resets the password using the reset token returned by verify-otp.
export async function resetPassword(input: {
  email: string;
  resetToken: string;
  newPassword: string;
}) {
  return requestApi<{ message: string }>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// Exposes the current stored token pair for integration/debugging purposes.
export async function getStoredTokens() {
  return getAuthTokenStore().getTokens();
}
