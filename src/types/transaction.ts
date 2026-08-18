export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id: string
  type: TransactionType
  /** Amount in cents (minor currency unit) to avoid floating point drift. Always positive; sign is derived from `type`. */
  amountCents: number
  date: string // ISO date (yyyy-MM-dd)
  categoryId: string
  /** Only relevant for income transactions. */
  sourceId?: string
  /** Optional project/client this transaction belongs to, for profitability analysis. */
  projectId?: string
  /** Set when this transaction was auto-generated from a recurring rule. */
  recurringRuleId?: string
  /** Set when this transaction was created by marking an invoice as paid. */
  invoiceId?: string
  note?: string
  createdAt: string // ISO datetime
  updatedAt: string // ISO datetime
}

export type NewTransaction = Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
export type TransactionUpdate = Partial<Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>>
