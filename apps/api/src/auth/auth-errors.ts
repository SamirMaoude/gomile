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
  INVALID_API_KEY: {
    statusCode: 401,
    message: 'Invalid API key',
  },
  API_KEY_REVOKED: {
    statusCode: 403,
    message: 'API key has been revoked',
  },
  MERCHANT_NOT_FOUND: {
    statusCode: 404,
    message: 'Merchant not found',
  },
  NOT_OWNER: {
    statusCode: 403,
    message: 'You are not the owner of this resource',
  },
  API_KEY_NOT_FOUND: {
    statusCode: 404,
    message: 'API key not found',
  },
  USER_NOT_FOUND: {
    statusCode: 404,
    message: 'User not found',
  },
  API_KEY_EXPIRED: {
    statusCode: 401,
    message: 'API key has expired',
  },
  DRIVER_NOT_FOUND: {
    statusCode: 404,
    message: 'Driver not found',
  },
  API_KEY_ALREADY_EXISTS: {
    statusCode: 409,
    message: 'This store already has an active API key. Revoke it before creating a new one.',
  },
  INVALID_RESET_TOKEN: {
    statusCode: 400,
    message: 'Invalid or expired reset code',
  },
  NAME_IS_NULL: {
    statusCode: 500,
    message: 'Names not exist for this user, suggesting backend error. Contact Khoa !'
  },
  EMAIL_NOT_VERIFIED: {
    statusCode: 403,
    message: 'Please verify your email before login',
  }
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
