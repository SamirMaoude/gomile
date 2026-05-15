export const API_ERRORS = {
  // Auth
  INVALID_EMAIL: { statusCode: 400, message: 'Invalid email address' },
  EMAIL_ALREADY_USED: { statusCode: 409, message: 'Email already in use' },
  PHONE_ALREADY_USED: { statusCode: 409, message: 'Phone number already in use' },
  INVALID_CREDENTIALS: { statusCode: 401, message: 'Invalid credentials' },
  INVALID_ACCESS_TOKEN: { statusCode: 401, message: 'Invalid access token' },
  INVALID_REFRESH_TOKEN: { statusCode: 401, message: 'Invalid refresh token' },
  INVALID_API_KEY: { statusCode: 401, message: 'Invalid API key' },
  API_KEY_REVOKED: { statusCode: 403, message: 'API key has been revoked' },
  NOT_OWNER: { statusCode: 403, message: 'You are not the owner of this resource' },
  API_KEY_NOT_FOUND: { statusCode: 404, message: 'API key not found' },
  USER_NOT_FOUND: { statusCode: 404, message: 'User not found' },
  API_KEY_EXPIRED: { statusCode: 401, message: 'API key has expired' },
  DRIVER_NOT_FOUND: { statusCode: 404, message: 'Driver not found' },
  MERCHANT_NOT_FOUND: { statusCode: 404, message: 'Merchant not found' },
  API_KEY_ALREADY_EXISTS: { statusCode: 409, message: 'This store already has an active API key. Revoke it before creating a new one.' },
  INVALID_RESET_TOKEN: { statusCode: 400, message: 'Invalid or expired reset code' },
  NAME_IS_NULL: { statusCode: 500, message: 'Names not exist for this user, suggesting backend error. Contact Khoa !' },
  EMAIL_NOT_VERIFIED: { statusCode: 403, message: 'Please verify your email before continuing' },

  // Admin
  WITHDRAWAL_NOT_FOUND: { statusCode: 404, message: 'Withdrawal entry not found' },
  WITHDRAWAL_NOT_PENDING: { statusCode: 409, message: 'Withdrawal has already been processed' },

  // Delivery
  ADDRESS_NOT_FOUND: { statusCode: 404, message: 'The provided address could not be found' },
  ROUTE_NOT_FOUND: { statusCode: 404, message: 'No route found between the specified origin and destination' },
  ORS_SERVICE_UNAVAILABLE: { statusCode: 503, message: 'OpenRouteService is currently unavailable. Please try again later.' },
  GEOCODING_FAILED: { statusCode: 502, message: 'Failed to geocode the provided address' },
  ROUTING_FAILED: { statusCode: 502, message: 'Failed to retrieve route from OpenRouteService' },
  ORS_API_KEY_MISSING: { statusCode: 503, message: 'OpenRouteService API key is not configured' },

  // Driver
  DRIVER_BUSY: { statusCode: 409, message: 'Driver has an ongoing order, some actions are restricted' },
  INSUFFICIENT_BALANCE: { statusCode: 409, message: 'Insufficient balance to complete this withdrawal' },
  INVALID_WITHDRAWAL_AMOUNT: { statusCode: 409, message: 'Withdrawal amount must be greater than 0' },

  // KYC
  KYC_VERIFYING_IN_PROCESS: { statusCode: 409, message: 'Admin is verifying uploaded documents, please come back later' },
  KYC_NO_PENDING_SUBMISSIONS: { statusCode: 409, message: 'No pending KYC submissions' },
  KYC_SUBMISSION_NOT_FOUND: { statusCode: 404, message: 'No KYC submission found' },
  KYC_NO_DOCUMENTS: { statusCode: 409, message: 'Please upload at least one document before submitting for KYC review' },
  KYC_ALREADY_APPROVED: { statusCode: 409, message: 'KYC already approved, no pending documents to review' },

  // Merchant
  MERCHANT_STILL_HAS_ORDERS: { statusCode: 409, message: 'Merchant still has ongoing orders' },

  // Order
  ORDER_NOT_FOUND: { statusCode: 404, message: 'Order not found' },
  ORDER_ALREADY_PICKED_UP: { statusCode: 409, message: 'Order already picked up or in delivery, cancellation is not possible' },
  ORDER_ALREADY_CANCELLED: { statusCode: 409, message: 'Order already cancelled' },
  ORDER_ALREADY_TAKEN: { statusCode: 409, message: 'This order has already been accepted by another driver' },
  ORDER_PICKUP_NO_LONGER_AVAILABLE: { statusCode: 409, message: 'This order has already been collected' },
  ORDER_ALREADY_DELIVERED: { statusCode: 409, message: 'This order has already been delivered' },
  ORDER_BAD_STATUS: { statusCode: 500, message: 'Illegal order state' },
  HANDSHAKE_NOT_FOUND: { statusCode: 500, message: 'Handshake not found ?!' },
  HANDSHAKE_ATTEMPTS_PASSED: { statusCode: 429, message: 'Too many incorrect attempts. Please contact your admin' },
  HANDSHAKE_EXPIRED: { statusCode: 410, message: 'Validation code has expired' },
  INCORRECT_HANDSHAKE_CODE: { statusCode: 401, message: 'Incorrect validation code' },

  // Store
  STORE_NAME_ALREADY_USED: { statusCode: 409, message: 'Store name already in use' },
  STORE_NOT_FOUND: { statusCode: 404, message: 'Store not found' },
  DOMAIN_REQUIRED_WITH_PROVIDER: { statusCode: 400, message: 'A domain is required when a provider is specified' },
  STORE_HAS_ACTIVE_ORDERS: { statusCode: 409, message: 'Store has active orders, deletion is not possible' },

  // Subscription
  SUBSCRIPTION_NOT_ACTIVE: { statusCode: 403, message: 'No active subscription or trial has ended' },
  SUBSCRIPTION_QUOTA_EXCEEDED: { statusCode: 403, message: 'Merchant current subscription quota has reached' },
  NO_STRIPE_SUBSCRIPTION: { statusCode: 400, message: 'No active Stripe subscription found' },
  STORE_LOCKED: { statusCode: 403, message: 'This store is locked due to subscription limits' },
} as const;

export type ApiErrorCode = keyof typeof API_ERRORS;
