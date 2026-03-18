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
} from "../../../shared/auth-contracts";
import type { ApiErrorPayload } from "../../../shared/api-errors";
import { createApiError } from "../../../shared/api-errors";
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
  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    const payload = (await response.json()) as Partial<ApiErrorPayload>;
    return payload.message ?? payload.code ?? fallbackError.message;
  }

  const text = await response.text();
  return text || "Request failed";
}

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

async function persistTokens(tokens: AuthTokensResponse) {
  await getAuthTokenStore().setTokens({
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  });
}

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

export async function registerDriver(input: RegisterDriverInput) {
  const response = await requestApi<AuthTokensResponse>("/auth/register/driver", {
    method: "POST",
    body: JSON.stringify(input),
  });

  await persistTokens(response);
  return toSession(response);
}

export async function login(input: LoginInput) {
  const response = await requestApi<AuthTokensResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });

  await persistTokens(response);
  return toSession(response);
}

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

export async function getStoredTokens() {
  return getAuthTokenStore().getTokens();
}
