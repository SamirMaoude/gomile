export const ORDER_ERRORS = {
  ORDER_NOT_FOUND: {
    statusCode: 404,
    message: 'Order not found',
  },
  NOT_OWNER: {
    statusCode: 403,
    message: 'You are not the owner of this order',
  },
  ORDER_ALREADY_PICKED_UP: {
    statusCode: 409,
    message:
      'Order already picked up or in delivery, cancellation is not possible',
  },
  ORDER_ALREADY_CANCELLED: {
    statusCode: 409,
    message: 'Order already cancelled',
  },
  ORDER_ALREADY_TAKEN: {
    statusCode: 409,
    message: 'This order has already been accepted by another driver',
  },
  ORDER_PICKUP_NO_LONGER_AVAILABLE: {
    statusCode: 409,
    message: 'This order has already been collected',
  },
  ORDER_ALREADY_DELIVERED: {
    statusCode: 409,
    message: 'This order has already been delivered',
  },
  ORDER_BAD_STATUS: {
    statusCode: 500, // This should not happen, if it does, Samir will buy me a tacos
    message: 'Illegal order state',
  },
  HANDSHAKE_NOT_FOUND: {
    statusCode: 500,
    message: 'Handshake not found ?!',
  },
  HANDSHAKE_ATTEMPTS_PASSED: {
    statusCode: 429,
    message: 'Too many incorrect attempts. Please contact your admin',
  },
  HANDSHAKE_EXPIRED: {
    statusCode: 410, // GONE !!!!!! HANDSHAKE IS GONE
    message: 'Validation code has expired',
  },
  INCORRECT_HANDSHAKE_CODE: {
    statusCode: 401,
    message: 'Incorrect validation code',
  },
} as const;

export type OrderApiErrorCode = keyof typeof ORDER_ERRORS;
