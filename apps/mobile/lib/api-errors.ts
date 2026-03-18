export const API_ERRORS = {
  EMAIL_ALREADY_USED: {
    statusCode: 409,
    message: 'Email deja utilise',
  },
  INVALID_CREDENTIALS: {
    statusCode: 401,
    message: 'Identifiants invalides',
  },
  INVALID_ACCESS_TOKEN: {
    statusCode: 401,
    message: "Jeton d'acces invalide",
  },
  INVALID_REFRESH_TOKEN: {
    statusCode: 401,
    message: 'Jeton de rafraichissement invalide',
  },
  AUTH_TOKEN_MISSING: {
    statusCode: 401,
    message: "Jeton d'authentification manquant",
  },
  BACKEND_UNREACHABLE: {
    statusCode: 502,
    message: 'API backend inaccessible',
  },
  REQUEST_FAILED: {
    statusCode: 500,
    message: 'La requete a echoue',
  },
} as const;

export type ApiErrorCode = keyof typeof API_ERRORS;

export interface ApiErrorPayload {
  code: ApiErrorCode;
  message: string;
  statusCode: number;
}

export function createApiError(code: ApiErrorCode): ApiErrorPayload {
  const definition = API_ERRORS[code];

  return {
    code,
    message: definition.message,
    statusCode: definition.statusCode,
  };
}
