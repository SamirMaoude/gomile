import type { AuthSession } from "./auth-client";
import {
  getMerchantProfile,
  type MerchantProfileResponse,
} from "./api-client";
import { ensureTokenRefreshed } from "./token-refresh";

let cachedSession: AuthSession | null = null;
let inFlightSessionRequest: Promise<AuthSession> | null = null;
let cachedMerchantProfile: MerchantProfileResponse | null = null;
let inFlightMerchantProfileRequest: Promise<MerchantProfileResponse> | null = null;
const MERCHANT_PROFILE_UPDATED_EVENT = "merchant-profile-updated";

function isMerchantRole(role: string) {
  return role === "MERCHANT";
}

function emitMerchantProfileUpdated(profile: MerchantProfileResponse | null) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(MERCHANT_PROFILE_UPDATED_EVENT, {
      detail: profile,
    }),
  );
}

export function primeMerchantSession(session: AuthSession) {
  if (isMerchantRole(session.user.role)) {
    cachedSession = session;
    return;
  }

  cachedSession = null;
  cachedMerchantProfile = null;
}

export function clearMerchantSession() {
  cachedSession = null;
  inFlightSessionRequest = null;
  cachedMerchantProfile = null;
  inFlightMerchantProfileRequest = null;
  emitMerchantProfileUpdated(null);
}

export async function getCurrentMerchantSession(): Promise<AuthSession> {
  if (cachedSession && isMerchantRole(cachedSession.user.role)) {
    return cachedSession;
  }

  if (inFlightSessionRequest) {
    return inFlightSessionRequest;
  }

  inFlightSessionRequest = ensureTokenRefreshed()
    .then((session) => {
      if (!session) {
        throw new Error("Session expirée. Veuillez vous reconnecter.");
      }

      if (!isMerchantRole(session.user.role)) {
        throw new Error("La session courante n'est pas un compte marchand.");
      }

      cachedSession = session;
      return session;
    })
    .catch((error) => {
      clearMerchantSession();
      throw error;
    })
    .finally(() => {
      inFlightSessionRequest = null;
    });

  return inFlightSessionRequest;
}

export async function getCurrentMerchantProfile(): Promise<MerchantProfileResponse> {
  if (cachedMerchantProfile) {
    return cachedMerchantProfile;
  }

  if (inFlightMerchantProfileRequest) {
    return inFlightMerchantProfileRequest;
  }

  inFlightMerchantProfileRequest = getCurrentMerchantSession()
    .then((session) => getMerchantProfile(session.user.id))
    .then((profile) => {
      cachedMerchantProfile = profile;
      emitMerchantProfileUpdated(profile);
      return profile;
    })
    .catch((error) => {
      cachedMerchantProfile = null;
      throw error;
    })
    .finally(() => {
      inFlightMerchantProfileRequest = null;
    });

  return inFlightMerchantProfileRequest;
}

export function setCurrentMerchantProfile(profile: MerchantProfileResponse) {
  cachedMerchantProfile = profile;
  emitMerchantProfileUpdated(profile);
}

export function getMerchantProfileUpdatedEventName() {
  return MERCHANT_PROFILE_UPDATED_EVENT;
}
