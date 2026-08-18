export interface IncomeSource {
  id: string
  name: string
  /** Free-text descriptor, e.g. "Shopify-Shop", "Freelance-Kunde". */
  kind?: string
  color: string
  archived: boolean
  createdAt: string
}

export type NewIncomeSource = Omit<IncomeSource, 'id' | 'createdAt' | 'archived'>
