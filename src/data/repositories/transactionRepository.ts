import { db } from '@/data/db'
import type { NewTransaction, Transaction, TransactionUpdate } from '@/types/transaction'

/**
 * Repository-Pattern: every data-access call for transactions goes through
 * this module. Today it talks to Dexie/IndexedDB; swapping to a REST/Supabase
 * backend later means reimplementing these functions, not the UI.
 */
export const transactionRepository = {
  async list(): Promise<Transaction[]> {
    return db.transactions.orderBy('date').reverse().toArray()
  },

  async listByMonth(year: number, month: number): Promise<Transaction[]> {
    const from = `${year}-${String(month).padStart(2, '0')}-01`
    const to = `${year}-${String(month).padStart(2, '0')}-31`
    return db.transactions.where('date').between(from, to, true, true).toArray()
  },

  async get(id: string): Promise<Transaction | undefined> {
    return db.transactions.get(id)
  },

  async create(input: NewTransaction): Promise<Transaction> {
    const now = new Date().toISOString()
    const transaction: Transaction = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    }
    await db.transactions.add(transaction)
    return transaction
  },

  async update(id: string, patch: TransactionUpdate): Promise<void> {
    await db.transactions.update(id, { ...patch, updatedAt: new Date().toISOString() })
  },

  async remove(id: string): Promise<void> {
    await db.transactions.delete(id)
  },
}
