const MISSING_AUTH_TOKEN_MESSAGES = [
  "AUTH_TOKEN_MISSING",
  "Jeton d'authentification manquant",
];
const EXPIRED_REFRESH_TOKEN_MESSAGES = [
  "INVALID_REFRESH_TOKEN",
  "Invalid refresh token",
  "Jeton de rafraîchissement invalide",
  "jwt expired",
  "Unauthorized",
];
const LOGIN_PATH = "/merchant/login";

let isHandlingExpiredSession = false;

export function isMissingAuthTokenError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return MISSING_AUTH_TOKEN_MESSAGES.some((message) =>
    error.message.includes(message),
  );
}

export function isRefreshTokenExpiredError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return [...MISSING_AUTH_TOKEN_MESSAGES, ...EXPIRED_REFRESH_TOKEN_MESSAGES].some(
    (message) => error.message.includes(message),
  );
}

export async function redirectToLoginWithExpiredSessionAlert() {
  if (typeof window === "undefined" || isHandlingExpiredSession) {
    return;
  }

  if (window.location.pathname === LOGIN_PATH) {
    return;
  }

  isHandlingExpiredSession = true;

  try {
    const Swal = (await import("sweetalert2")).default;

    await Swal.fire({
      icon: "warning",
      title: "Session expirée",
      text: "Votre refresh token a expiré. Veuillez vous reconnecter.",
      confirmButtonText: "Se connecter",
      confirmButtonColor: "#7ebb2b",
      allowOutsideClick: false,
    });
  } finally {
    window.location.assign(LOGIN_PATH);
  }
}

export const redirectToHomeWithExpiredSessionAlert =
  redirectToLoginWithExpiredSessionAlert;
