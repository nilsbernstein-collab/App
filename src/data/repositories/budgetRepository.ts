import { db } from '@/data/db'
import type { Budget } from '@/types/budget'

export const budgetRepository = {
  async list(): Promise<Budget[]> {
    return db.budgets.toArray()
  },

  async upsertForCategory(categoryId: string, monthlyLimitCents: number): Promise<Budget> {
    const existing = await db.budgets.where('categoryId').equals(categoryId).first()
    if (existing) {
      await db.budgets.update(existing.id, { monthlyLimitCents })
      return { ...existing, monthlyLimitCents }
    }
    const budget: Budget = {
      id: crypto.randomUUID(),
      categoryId,
      monthlyLimitCents,
      createdAt: new Date().toISOString(),
    }
    await db.budgets.add(budget)
    return budget
  },

  async remove(id: string): Promise<void> {
    await db.budgets.delete(id)
  },
}
