export const MERCHANT_ERRORS = {
  MERCHANT_NOT_FOUND: {
    statusCode: 404,
    message: 'Merchant not found',
  },
  PHONE_ALREADY_USED: {
    statusCode: 409,
    message: 'Phone number already in use',
  },
} as const;

export type MerchantApiErrorCode = keyof typeof MERCHANT_ERRORS;
