import type { TransactionType } from './transaction'

export type RecurrenceFrequency = 'weekly' | 'monthly' | 'yearly'

export interface RecurringRule {
  id: string
  type: TransactionType
  amountCents: number
  categoryId: string
  sourceId?: string
  projectId?: string
  note?: string
  frequency: RecurrenceFrequency
  /** Repeat every N periods, e.g. 2 + monthly = every 2 months. */
  interval: number
  /** ISO date of the first occurrence. */
  startDate: string
  /** ISO date after which no more occurrences are generated. Open-ended if unset. */
  endDate?: string
  /** ISO date of the last occurrence this rule has already generated a transaction for. */
  lastGeneratedDate?: string
  active: boolean
  createdAt: string
}

export type NewRecurringRule = Omit<RecurringRule, 'id' | 'lastGeneratedDate' | 'active' | 'createdAt'>

export const FREQUENCY_LABELS: Record<RecurrenceFrequency, string> = {
  weekly: 'Wöchentlich',
  monthly: 'Monatlich',
  yearly: 'Jährlich',
}
