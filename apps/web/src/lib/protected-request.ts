import type { ApiErrorPayload } from "../../../../shared/api-errors";
import { createApiError } from "../../../../shared/api-errors";
import { redirectToLoginWithExpiredSessionAlert } from "./session-expiration";
import { ensureTokenRefreshed } from "./token-refresh";

async function parseApiError(response: Response) {
  const fallbackError = createApiError("REQUEST_FAILED");
  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    const payload = (await response.json()) as Partial<ApiErrorPayload>;
    return payload.message ?? payload.code ?? fallbackError.message;
  }

  const text = await response.text();
  return text || fallbackError.message;
}

function buildRequestInit(init?: RequestInit): RequestInit {
  return {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
    credentials: "include",
    cache: "no-store",
  };
}

async function tryRefreshAccessToken() {
  // The browser cannot read an httpOnly access-token cookie directly.
  // So instead of "checking the cookie", we refresh only after the server
  // tells us the protected request is no longer authenticated.
  const session = await ensureTokenRefreshed();
  return Boolean(session);
}

export async function requestWithAutoRefresh<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const requestInit = buildRequestInit(init);

  // First attempt with the current cookies as they are.
  let response = await fetch(path, requestInit);

  // If the access token is missing or expired, the BFF returns 401.
  // We then ask the auth route to rotate tokens and replay the request once.
  if (response.status === 401) {
    const refreshWorked = await tryRefreshAccessToken();

    if (refreshWorked) {
      response = await fetch(path, requestInit);
    } else {
      void redirectToLoginWithExpiredSessionAlert();
    }
  }

  if (response.status === 401) {
    void redirectToLoginWithExpiredSessionAlert();
  }

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    return (await response.json()) as T;
  }

  const text = await response.text();
  return (text ? text : undefined) as T;
}
