import type { BillingInterval } from '@/types/subscription'
import { addDays, addYears } from 'date-fns'

export interface CheckoutSession {
  customerId: string
  subscriptionId: string
  currentPeriodEnd: string
}

/**
 * Client-side stand-in for `POST /api/checkout/session` (see `api-stubs/checkout.ts`
 * for the server-side mock this will eventually call). Swap this implementation for a
 * `fetch('/api/checkout/session', { method: 'POST', body: ... })` once a real backend
 * + Stripe secret key exist — the return shape already matches what Stripe's
 * `checkout.session` + `subscription` objects would give us.
 */
export async function createCheckoutSession(interval: BillingInterval): Promise<CheckoutSession> {
  await new Promise((resolve) => setTimeout(resolve, 700))

  const now = new Date()
  const periodEnd = interval === 'monthly' ? addDays(now, 30) : addYears(now, 1)

  return {
    customerId: `cus_mock_${crypto.randomUUID().slice(0, 8)}`,
    subscriptionId: `sub_mock_${crypto.randomUUID().slice(0, 8)}`,
    currentPeriodEnd: periodEnd.toISOString(),
  }
}
