import { refreshSession } from "./auth-client";
import type { AuthSession } from "./auth-client";

let inFlightRefresh: Promise<AuthSession | null> | null = null;

export async function ensureTokenRefreshed() {
  if (!inFlightRefresh) {
    inFlightRefresh = refreshSession()
      .then((session) => session)
      .catch(() => null)
      .finally(() => {
        inFlightRefresh = null;
      });
  }

  return inFlightRefresh;
}
