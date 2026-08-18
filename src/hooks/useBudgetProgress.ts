import { useMemo } from 'react'
import { useBudgets } from './useBudgets'
import { useTransactions } from './useTransactions'
import { useCategoryLookup } from './useCategoryLookup'
import { currentYearMonth } from '@/lib/date'

export interface BudgetProgress {
  budgetId: string
  categoryId: string
  categoryName: string
  color: string
  limitCents: number
  spentCents: number
  percent: number
}

export function useBudgetProgress(): { data: BudgetProgress[]; isLoading: boolean } {
  const { data: budgets, isLoading: budgetsLoading } = useBudgets()
  const { data: transactions, isLoading: transactionsLoading } = useTransactions()
  const categoryLookup = useCategoryLookup()

  const data = useMemo(() => {
    if (!budgets) return []
    const { year, month } = currentYearMonth()
    const prefix = `${year}-${String(month).padStart(2, '0')}`

    return budgets.map((budget) => {
      const spentCents = (transactions ?? [])
        .filter((t) => t.type === 'expense' && t.categoryId === budget.categoryId && t.date.startsWith(prefix))
        .reduce((sum, t) => sum + t.amountCents, 0)

      const category = categoryLookup.get(budget.categoryId)

      return {
        budgetId: budget.id,
        categoryId: budget.categoryId,
        categoryName: category?.name ?? 'Unbekannt',
        color: category?.color ?? '#64748b',
        limitCents: budget.monthlyLimitCents,
        spentCents,
        percent: budget.monthlyLimitCents > 0 ? Math.round((spentCents / budget.monthlyLimitCents) * 100) : 0,
      }
    })
  }, [budgets, transactions, categoryLookup])

  return { data, isLoading: budgetsLoading || transactionsLoading }
}
