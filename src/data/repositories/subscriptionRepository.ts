import { db } from '@/data/db'
import type { SubscriptionStatus } from '@/types/subscription'

export const subscriptionRepository = {
  async get(): Promise<SubscriptionStatus> {
    const status = await db.subscription.get('subscription')
    return status ?? { id: 'subscription', tier: 'free' }
  },

  async set(patch: Partial<Omit<SubscriptionStatus, 'id'>>): Promise<void> {
    const current = await this.get()
    await db.subscription.put({ ...current, ...patch })
  },
}
