export const AUTH_API_ERRORS = {
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
} as const;

export type AuthApiErrorCode = keyof typeof AUTH_API_ERRORS;

export interface AuthApiErrorPayload {
  code: AuthApiErrorCode;
  message: string;
  statusCode: number;
}

export function createApiError(code: AuthApiErrorCode): AuthApiErrorPayload {
  const definition = AUTH_API_ERRORS[code];

  return {
    code,
    message: definition.message,
    statusCode: definition.statusCode,
  };
}
