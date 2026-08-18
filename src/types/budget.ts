/** One budget per expense category, applied every calendar month. */
export interface Budget {
  id: string
  categoryId: string
  monthlyLimitCents: number
  createdAt: string
}

export type NewBudget = Omit<Budget, 'id' | 'createdAt'>
