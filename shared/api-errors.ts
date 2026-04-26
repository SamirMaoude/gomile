export const API_ERRORS = {
  // Auth
  INVALID_EMAIL: {
    statusCode: 400,
    message: 'Email invalide',
  },
  EMAIL_ALREADY_USED: {
    statusCode: 409,
    message: 'Email deja utilise',
  },
  PHONE_ALREADY_USED: {
    statusCode: 409,
    message: 'Numero de telephone deja utilise',
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
  INVALID_API_KEY: {
    statusCode: 401,
    message: 'Clef API invalide',
  },
  API_KEY_REVOKED: {
    statusCode: 403,
    message: 'Clef API revokee',
  },
  API_KEY_NOT_FOUND: {
    statusCode: 404,
    message: 'Clef API non trouvee',
  },
  MERCHANT_NOT_FOUND: {
    statusCode: 404,
    message: 'Marchand non trouve',
  },
  NOT_OWNER: {
    statusCode: 403,
    message: "Vous n'etes pas le proprietaire de cette ressource",
  },
  API_KEY_EXPIRED: {
    statusCode: 401,
    message: 'Clef API expiree',
  },
  // Store
  STORE_NOT_FOUND: {
    statusCode: 404,
    message: 'Magasin non trouve',
  },
  STORE_NAME_ALREADY_USED: {
    statusCode: 409,
    message: 'Nom de magasin deja utilise',
  },
  DOMAIN_REQUIRED_WITH_PROVIDER: {
    statusCode: 400,
    message: "Un domaine est requis lorsqu'un fournisseur est specifie",
  },
  // Order
  ORDER_NOT_FOUND: {
    statusCode: 404,
    message: 'Commande non trouvee',
  },
  ORDER_ALREADY_TAKEN: {
    statusCode: 409,
    message: 'Commande deja prise en charge par un livreur',
  },
  ORDER_ALREADY_CANCELLED: {
    statusCode: 409,
    message: 'Commande deja annulee',
  },
  ORDER_ALREADY_DELIVERED: {
    statusCode: 409,
    message: 'Commande deja livree',
  },
  ORDER_ALREADY_PICKED_UP: {
    statusCode: 409,
    message: 'Commande deja recuperee',
  },
  ORDER_PICKUP_NO_LONGER_AVAILABLE: {
    statusCode: 409,
    message: 'La commande ne peut plus etre acceptee',
  },
  ORDER_BAD_STATUS: {
    statusCode: 409,
    message: 'Statut de commande incorrect pour cette operation',
  },
  // Handshake
  HANDSHAKE_NOT_FOUND: {
    statusCode: 404,
    message: 'Code de handshake non trouve',
  },
  HANDSHAKE_EXPIRED: {
    statusCode: 410,
    message: 'Code de handshake expire',
  },
  HANDSHAKE_ATTEMPTS_PASSED: {
    statusCode: 429,
    message: 'Nombre maximal de tentatives atteint',
  },
  INCORRECT_HANDSHAKE_CODE: {
    statusCode: 400,
    message: 'Code de handshake incorrect',
  },
  // Driver
  DRIVER_NOT_FOUND: {
    statusCode: 404,
    message: 'Livreur non trouve',
  },
  // Store (extended)
  STORE_HAS_ACTIVE_ORDERS: {
    statusCode: 409,
    message: 'Le magasin a des commandes en cours',
  },
  // Generic
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
