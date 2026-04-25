const MISSING_AUTH_TOKEN_MESSAGES = [
  "AUTH_TOKEN_MISSING",
  "Jeton d'authentification manquant",
];

let isHandlingExpiredSession = false;

export function isMissingAuthTokenError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return MISSING_AUTH_TOKEN_MESSAGES.some((message) =>
    error.message.includes(message),
  );
}

export async function redirectToHomeWithExpiredSessionAlert() {
  if (typeof window === "undefined" || isHandlingExpiredSession) {
    return;
  }

  if (window.location.pathname === "/") {
    return;
  }

  isHandlingExpiredSession = true;

  try {
    const Swal = (await import("sweetalert2")).default;

    await Swal.fire({
      icon: "warning",
      title: "Session expiree",
      text: "Votre session a expire. Veuillez vous reconnecter.",
      confirmButtonText: "Retour a l'accueil",
      confirmButtonColor: "#7ebb2b",
      allowOutsideClick: false,
    });
  } finally {
    window.location.assign("/");
  }
}
