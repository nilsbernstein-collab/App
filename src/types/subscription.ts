export type SubscriptionTier = 'free' | 'pro'
export type BillingInterval = 'monthly' | 'yearly'

export interface SubscriptionStatus {
  id: 'subscription' // singleton row
  tier: SubscriptionTier
  billingInterval?: BillingInterval
  /** ISO datetime the current period ends. Only set for an active Pro subscription. */
  currentPeriodEnd?: string
  /** Stripe identifiers — populated once the real Stripe integration replaces the mock checkout. */
  stripeCustomerId?: string
  stripeSubscriptionId?: string
}

/** Which Free-Tier limit a user just bumped into, used to tailor the Upgrade-Modal copy. */
export type UpgradeTrigger =
  | 'second_income_source'
  | 'export'
  | 'auto_categorization'
  | 'tax_reserve'
  | 'forecast'
  | 'api_access'
  | 'generic'
