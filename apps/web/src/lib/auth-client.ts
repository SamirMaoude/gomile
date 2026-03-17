import type {
  AuthSession,
  AuthUser,
  LoginInput,
  LogoutResponse,
  RegisterDriverInput,
  RegisterMerchantInput,
  Role,
} from "../../../../shared/auth-contracts";
import type { ApiErrorPayload } from "../../../../shared/api-errors";
import { createApiError } from "../../../../shared/api-errors";

export type {
  AuthSession,
  AuthUser,
  LoginInput,
  LogoutResponse,
  RegisterDriverInput,
  RegisterMerchantInput,
  Role,
};

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

// Frontend code should call the web BFF routes only; auth cookies are handled server-side.
async function requestAuth<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

// Registers a merchant and creates the browser session cookies via the BFF.
export function registerMerchant(input: RegisterMerchantInput) {
  return requestAuth<AuthSession>("/api/auth/register/merchant", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// Registers a driver and creates the browser session cookies via the BFF.
export function registerDriver(input: RegisterDriverInput) {
  return requestAuth<AuthSession>("/api/auth/register/driver", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// Logs in an existing user and lets the BFF persist access/refresh cookies.
export function login(input: LoginInput) {
  return requestAuth<AuthSession>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// Rotates tokens using the refresh cookie managed by the web auth proxy.
export function refreshSession() {
  return requestAuth<AuthSession>("/api/auth/refresh", {
    method: "POST",
  });
}

// Clears the backend session and removes auth cookies via the BFF.
export function logout() {
  return requestAuth<LogoutResponse>("/api/auth/logout", {
    method: "POST",
  });
}
