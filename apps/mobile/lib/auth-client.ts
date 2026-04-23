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
    throw new Error(await parseError(response));
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

// Exposes the current stored token pair for integration/debugging purposes.
export async function getStoredTokens() {
  return getAuthTokenStore().getTokens();
}
