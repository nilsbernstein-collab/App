import Dexie, { type EntityTable } from 'dexie'
import type { Transaction } from '@/types/transaction'
import type { Category } from '@/types/category'
import type { IncomeSource } from '@/types/incomeSource'
import type { SubscriptionStatus } from '@/types/subscription'
import type { UserSettings } from '@/types/settings'
import type { RecurringRule } from '@/types/recurringRule'
import type { Project } from '@/types/project'
import type { Budget } from '@/types/budget'
import type { Invoice } from '@/types/invoice'
import { DEFAULT_CATEGORY_SEED } from '@/types/category'
import { DEFAULT_SETTINGS } from '@/types/settings'

/**
 * Offline-first data layer backed by IndexedDB. Every table here maps 1:1 to a
 * future Postgres table (see `data/repositories/*`), so swapping this file for
 * a Supabase client later doesn't require touching UI code — only the
 * repositories do.
 */
export class NicheTrackDB extends Dexie {
  transactions!: EntityTable<Transaction, 'id'>
  categories!: EntityTable<Category, 'id'>
  incomeSources!: EntityTable<IncomeSource, 'id'>
  subscription!: EntityTable<SubscriptionStatus, 'id'>
  settings!: EntityTable<UserSettings, 'id'>
  recurringRules!: EntityTable<RecurringRule, 'id'>
  projects!: EntityTable<Project, 'id'>
  budgets!: EntityTable<Budget, 'id'>
  invoices!: EntityTable<Invoice, 'id'>

  constructor() {
    super('nichetrack')

    this.version(1).stores({
      transactions: 'id, type, date, categoryId, sourceId, createdAt',
      categories: 'id, type, order',
      incomeSources: 'id, archived, createdAt',
      subscription: 'id',
      settings: 'id',
    })

    this.version(2).stores({
      transactions: 'id, type, date, categoryId, sourceId, projectId, recurringRuleId, invoiceId, createdAt',
      recurringRules: 'id, active, categoryId',
      projects: 'id, archived, createdAt',
      budgets: 'id, categoryId',
      invoices: 'id, status, projectId, dueDate, createdAt',
    })
  }
}

export const db = new NicheTrackDB()

let seedPromise: Promise<void> | null = null

/** Seeds default categories, a starter income source, and singleton rows on first launch. Idempotent & safe to call on every app boot. */
export function ensureSeeded(): Promise<void> {
  if (!seedPromise) {
    seedPromise = db.transaction(
      'rw',
      db.categories,
      db.incomeSources,
      db.subscription,
      db.settings,
      async () => {
        const categoryCount = await db.categories.count()
        if (categoryCount === 0) {
          await db.categories.bulkAdd(
            DEFAULT_CATEGORY_SEED.map((c) => ({ ...c, id: crypto.randomUUID() })),
          )
        }

        const sourceCount = await db.incomeSources.count()
        if (sourceCount === 0) {
          await db.incomeSources.add({
            id: crypto.randomUUID(),
            name: 'Meine erste Einkommensquelle',
            kind: 'Freelance',
            color: '#147df5',
            archived: false,
            createdAt: new Date().toISOString(),
          })
        }

        const subscription = await db.subscription.get('subscription')
        if (!subscription) {
          await db.subscription.add({ id: 'subscription', tier: 'free' })
        }

        const settings = await db.settings.get('settings')
        if (!settings) {
          await db.settings.add(DEFAULT_SETTINGS)
        }
      },
    )
  }
  return seedPromise
}
