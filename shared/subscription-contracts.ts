export type SubscriptionPlan = 'PRO' | 'BUSINESS';

export type SubscriptionTier = 'FREE' | 'PRO' | 'BUSINESS';

export type SubscriptionStatus = 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'LOCKED';

export interface CheckoutResponse {
  checkoutUrl: string;
}

export interface PortalResponse {
  portalUrl: string;
}
