import { db } from '@/data/db'
import type { IncomeSource, NewIncomeSource } from '@/types/incomeSource'

export const incomeSourceRepository = {
  async list(): Promise<IncomeSource[]> {
    return db.incomeSources.orderBy('createdAt').toArray()
  },

  async listActive(): Promise<IncomeSource[]> {
    const all = await db.incomeSources.orderBy('createdAt').toArray()
    return all.filter((s) => !s.archived)
  },

  async create(input: NewIncomeSource): Promise<IncomeSource> {
    const source: IncomeSource = {
      ...input,
      id: crypto.randomUUID(),
      archived: false,
      createdAt: new Date().toISOString(),
    }
    await db.incomeSources.add(source)
    return source
  },

  async update(id: string, patch: Partial<NewIncomeSource>): Promise<void> {
    await db.incomeSources.update(id, patch)
  },

  async archive(id: string): Promise<void> {
    await db.incomeSources.update(id, { archived: true })
  },

  async remove(id: string): Promise<void> {
    await db.incomeSources.delete(id)
  },
}
