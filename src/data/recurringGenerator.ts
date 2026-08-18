import { db } from '@/data/db'
import { dueOccurrences } from '@/lib/recurrence'
import type { Transaction } from '@/types/transaction'

/**
 * Materializes every due occurrence of every active recurring rule into real
 * transactions. Safe to call on every app boot: each rule tracks
 * `lastGeneratedDate` as a cursor, so occurrences are never generated twice.
 * Returns the transactions that were newly created, for a "X wiederkehrende
 * Buchungen hinzugefügt" toast.
 */
export async function generateDueRecurringTransactions(asOf: Date = new Date()): Promise<Transaction[]> {
  const created: Transaction[] = []

  await db.transaction('rw', db.recurringRules, db.transactions, async () => {
    const rules = await db.recurringRules.filter((r) => r.active).toArray()

    for (const rule of rules) {
      const occurrences = dueOccurrences(rule, asOf)
      if (occurrences.length === 0) continue

      const now = new Date().toISOString()
      for (const date of occurrences) {
        const transaction: Transaction = {
          id: crypto.randomUUID(),
          type: rule.type,
          amountCents: rule.amountCents,
          date,
          categoryId: rule.categoryId,
          sourceId: rule.sourceId,
          projectId: rule.projectId,
          recurringRuleId: rule.id,
          note: rule.note,
          createdAt: now,
          updatedAt: now,
        }
        await db.transactions.add(transaction)
        created.push(transaction)
      }

      await db.recurringRules.update(rule.id, {
        lastGeneratedDate: occurrences[occurrences.length - 1],
      })
    }
  })

  return created
}
