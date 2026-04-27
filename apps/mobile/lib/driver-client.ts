import Constants from "expo-constants";

import type { ApiErrorPayload } from "./api-errors";
import { createApiError } from "./api-errors";
import { getAuthTokenStore } from "./auth-storage";

const DEFAULT_API_BASE_URL = "http://localhost:3000";

type ExpoExtraConfig = {
  apiBaseUrl?: string;
};

type DriverMission = {
  id: string;
  type: string;
  store?: string;
  reward?: number;
  distanceKm?: number;
  pickupAddress?: string;
  dropOffAddress?: string;
  status?: string;
};

type DriverDashboard = {
  isOnline: boolean;
  todayEarnings: number;
  todayTrips: number;
  currentLocation?: { lat: number; lng: number };
  coverageRadiusMeters?: number;
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
    return payload.message ?? payload.code ?? fallbackError.message;
  }

  const text = await response.text();
  return text || fallbackError.message;
}

async function requestDriverApi<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const tokens = await getAuthTokenStore().getTokens();

  if (!tokens?.accessToken) {
    throw new Error(createApiError("AUTH_TOKEN_MISSING").message);
  }

  const response = await fetch(buildTargetUrl(path), {
    ...init,
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${tokens.accessToken}`,
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as T;
}

export async function getDriverDashboard() {
  return requestDriverApi<DriverDashboard>("/driver/me/dashboard", { method: "GET" });
}

export async function toggleDriverAvailability() {
  return requestDriverApi<{ message: string }>("/driver/me/availability", {
    method: "PATCH",
  });
}

export async function updateDriverLocation(latitude: number, longitude: number) {
  return requestDriverApi<{ message: string }>("/driver/me/location", {
    method: "PATCH",
    body: JSON.stringify({ latitude, longitude }),
  });
}

export async function getAvailableMissions() {
  return requestDriverApi<DriverMission[]>("/driver/me/missions/available", {
    method: "GET",
  });
}

export async function acceptMission(missionId: string) {
  return requestDriverApi<{ message: string }>(
    `/driver/me/missions/${missionId}/accept`,
    { method: "POST" },
  );
}

export async function getActiveMissions() {
  return requestDriverApi<DriverMission[]>("/driver/me/missions/active", {
    method: "GET",
  });
}

export async function getMissionHistory() {
  return requestDriverApi<DriverMission[]>("/driver/me/missions/history", {
    method: "GET",
  });
}

export async function verifyMerchantHandshake(missionId: string, code: string) {
  return requestDriverApi<{ orderId: string; message: string }>(
    `/driver/me/missions/${missionId}/handshake/merchant/verify`,
    {
      method: "POST",
      body: JSON.stringify({ code }),
    },
  );
}

export async function verifyClientHandshake(missionId: string, code: string) {
  return requestDriverApi<{ orderId: string; message: string }>(
    `/driver/me/missions/${missionId}/handshake/client/verify`,
    {
      method: "POST",
      body: JSON.stringify({ code }),
    },
  );
}

export async function getWallet() {
  return requestDriverApi<{ balance: number; currency: string; pendingAmount: number }>(
    "/driver/me/wallet",
    { method: "GET" },
  );
}

export async function getWalletEntries() {
  return requestDriverApi<
    Array<{ id: string; type: string; amount: number; status: string; createdAt: string }>
  >("/driver/me/wallet/entries", { method: "GET" });
}

export async function requestWithdrawal(amount: number) {
  return requestDriverApi<{ message: string }>("/driver/me/wallet/withdrawals", {
    method: "POST",
    body: JSON.stringify({ amount }),
  });
}

export async function getDriverProfile() {
  return requestDriverApi<{
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    phone: string;
    email: string;
    rating?: number;
    totalTrips?: number;
    activeVehicle?: string;
    gomileCode?: string;
    status?: string;
  }>("/driver/me/profile", { method: "GET" });
}

export async function updateSessionVehicle(activeVehicle: string) {
  return requestDriverApi<{ activeVehicle: string }>("/driver/me/session-vehicle", {
    method: "PATCH",
    body: JSON.stringify({ activeVehicle }),
  });
}

export async function getMyKycStatus() {
  return requestDriverApi<{ status: string; latestSubmission: unknown }>("/driver/me/kyc", {
    method: "GET",
  });
}

export async function submitMyKyc() {
  return requestDriverApi<{ message: string }>("/driver/me/kyc", {
    method: "POST",
  });
}

export async function getMyDocuments() {
  return requestDriverApi<
    Array<{
      id: string;
      type: string;
      url: string;
      verified: boolean;
      rejectionReason?: string | null;
      createdAt: string;
    }>
  >("/driver/me/documents", { method: "GET" });
}

export async function createMyDocument(type: string, url: string) {
  return requestDriverApi<{ id: string; type: string; url: string; verified: boolean }>(
    "/driver/me/documents",
    {
      method: "POST",
      body: JSON.stringify({ type, url }),
    },
  );
}

export async function getMyReferral() {
  try {
    return await requestDriverApi<{ code: string; totalReferrals: number }>(
      "/driver/me/referral",
      { method: "GET" },
    );
  } catch {
    return null;
  }
}
