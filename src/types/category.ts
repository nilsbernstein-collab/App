import type { TransactionType } from './transaction'

export interface CategorizationRule {
  /** Case-insensitive substring matched against the transaction note. Pro feature. */
  keyword: string
}

export interface Category {
  id: string
  name: string
  type: TransactionType
  /** Tailwind-friendly hex color used for charts and badges. */
  color: string
  isDefault: boolean
  /** Sort position, used for drag-and-drop reordering. */
  order: number
  rule?: CategorizationRule
}

export type NewCategory = Omit<Category, 'id'>

/** The five free-tier default categories, seeded on first launch. */
export const DEFAULT_CATEGORY_SEED: NewCategory[] = [
  { name: 'Umsatz', type: 'income', color: '#147df5', isDefault: true, order: 0 },
  { name: 'Material', type: 'expense', color: '#f59e0b', isDefault: true, order: 1 },
  { name: 'Marketing', type: 'expense', color: '#ec4899', isDefault: true, order: 2 },
  { name: 'Steuern', type: 'expense', color: '#ef4444', isDefault: true, order: 3 },
  { name: 'Sonstiges', type: 'expense', color: '#64748b', isDefault: true, order: 4 },
]
