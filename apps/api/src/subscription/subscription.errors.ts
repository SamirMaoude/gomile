export const SUBSCRIPTION_ERRORS = {
  SUBSCRIPTION_NOT_ACTIVE: {
    statusCode: 403,
    message: "No active subscription or trial has ended"
  },
  SUBSCRIPTION_QUOTA_EXCEEDED: {
    statusCode: 403,
    message: "Merchant current subscription quota has reached"
  }
}