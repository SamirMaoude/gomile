import Constants from "expo-constants";

import type { ApiErrorPayload } from "../../../shared/api-errors";
import { createApiError } from "../../../shared/api-errors";
import type { DriverKycStatus } from "../../../shared/kyc-contracts";
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
    return payload.message ?? payload.code ?? "Request failed";
  }

  const text = await response.text();
  return text || "Request failed";
}

async function requestKyc<T>(
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

export type { DriverKycStatus };

export async function getMyKycStatus() {
  const tokens = await getAuthTokenStore().getTokens();

  if (!tokens?.accessToken) {
    throw new Error(createApiError("AUTH_TOKEN_MISSING").message);
  }

  return requestKyc<DriverKycStatus>(
    "/driver/me/kyc",
    { method: "GET" },
    tokens.accessToken,
  );
}
