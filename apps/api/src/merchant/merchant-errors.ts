export const MERCHANT_ERRORS = {
  PHONE_ALREADY_USED: {
    statusCode: 409,
    message: 'Phone number already in use',
  },
  MERCHANT_STILL_HAS_ORDERS: {
    statusCode: 409,
    message: 'Merchant still has ongoing orders',
  },
} as const;

export type MerchantApiErrorCode = keyof typeof MERCHANT_ERRORS;
