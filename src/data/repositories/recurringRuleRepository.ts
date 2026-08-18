import { db } from '@/data/db'
import type { NewRecurringRule, RecurringRule } from '@/types/recurringRule'

export const recurringRuleRepository = {
  async list(): Promise<RecurringRule[]> {
    return db.recurringRules.orderBy('id').toArray()
  },

  async listActive(): Promise<RecurringRule[]> {
    const all = await db.recurringRules.toArray()
    return all.filter((r) => r.active)
  },

  async create(input: NewRecurringRule): Promise<RecurringRule> {
    const rule: RecurringRule = {
      ...input,
      id: crypto.randomUUID(),
      active: true,
      createdAt: new Date().toISOString(),
    }
    await db.recurringRules.add(rule)
    return rule
  },

  async update(id: string, patch: Partial<RecurringRule>): Promise<void> {
    await db.recurringRules.update(id, patch)
  },

  async remove(id: string): Promise<void> {
    await db.recurringRules.delete(id)
  },

  async setLastGeneratedDate(id: string, date: string): Promise<void> {
    await db.recurringRules.update(id, { lastGeneratedDate: date })
  },
}
