export const SUBSCRIPTION_ERRORS = {
  SUBSCRIPTION_NOT_ACTIVE: {
    statusCode: 403,
    message: "No active subscription or trial has ended"
  },
  SUBSCRIPTION_QUOTA_EXCEEDED: {
    statusCode: 403,
    message: "Merchant current subscription quota has reached"
  },
  NO_STRIPE_SUBSCRIPTION: {
    statusCode: 400,
    message: "No active Stripe subscription found"
  },
  STORE_LOCKED: {
    statusCode: 403,
    message: 'This store is locked due to subscription limits',
  },
}