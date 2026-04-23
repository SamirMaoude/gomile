import type {
  Gender,
  AuthSession,
  AuthUser,
  LoginInput,
  LogoutResponse,
  RegisterDriverInput,
  RegisterMerchantInput,
  Role,
  VehicleType,
} from "../../../../shared/auth-contracts";
import {
  APP_GENDERS,
  APP_VEHICLE_TYPES,
} from "../../../../shared/auth-contracts";
import type { ApiErrorPayload } from "../../../../shared/api-errors";
import { createApiError } from "../../../../shared/api-errors";

export type {
  AuthSession,
  AuthUser,
  Gender,
  LoginInput,
  LogoutResponse,
  RegisterDriverInput,
  RegisterMerchantInput,
  Role,
  VehicleType,
};
export { APP_GENDERS, APP_VEHICLE_TYPES };

export type VerifyEmailResponse = {
  message: string;
};

export type ForgotPasswordInput = {
  email: string;
};

export type ForgotPasswordResponse = {
  message: string;
};

export type VerifyOtpInput = {
  email: string;
  otp: string;
};

export type VerifyOtpResponse = {
  resetToken: string;
};

export type ResetPasswordInput = {
  email: string;
  resetToken: string;
  newPassword: string;
};

export type ResetPasswordResponse = {
  message: string;
};

const authRoutes = {
  registerMerchant: "/api/auth/register/merchant",
  registerDriver: "/api/auth/register/driver",
  login: "/api/auth/login",
  refresh: "/api/auth/refresh",
  logout: "/api/auth/logout",
  verifyEmail: "/api/auth/verify-email",
  forgotPassword: "/api/auth/forgot-password",
  verifyOtp: "/api/auth/verify-otp",
  resetPassword: "/api/auth/reset-password",
} as const;

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
  return requestAuth<AuthSession>(authRoutes.registerMerchant, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// Registers a driver and creates the browser session cookies via the BFF.
export function registerDriver(input: RegisterDriverInput) {
  return requestAuth<AuthSession>(authRoutes.registerDriver, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// Logs in an existing user and lets the BFF persist access/refresh cookies.
export function login(input: LoginInput) {
  return requestAuth<AuthSession>(authRoutes.login, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// Rotates tokens using the refresh cookie managed by the web auth proxy.
export function refreshSession() {
  return requestAuth<AuthSession>(authRoutes.refresh, {
    method: "POST",
  });
}

// Clears the backend session and removes auth cookies via the BFF.
export function logout() {
  return requestAuth<LogoutResponse>(authRoutes.logout, {
    method: "POST",
  });
}

export function verifyEmailToken(token: string) {
  const search = new URLSearchParams({ token }).toString();
  return requestAuth<VerifyEmailResponse>(`${authRoutes.verifyEmail}?${search}`, {
    method: "GET",
  });
}

export function forgotPassword(input: ForgotPasswordInput) {
  return requestAuth<ForgotPasswordResponse>(authRoutes.forgotPassword, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function verifyOtp(input: VerifyOtpInput) {
  return requestAuth<VerifyOtpResponse>(authRoutes.verifyOtp, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function resetPassword(input: ResetPasswordInput) {
  return requestAuth<ResetPasswordResponse>(authRoutes.resetPassword, {
    method: "POST",
    body: JSON.stringify(input),
  });
}
