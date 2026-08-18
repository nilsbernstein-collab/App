import { useMemo } from 'react'
import { useTransactions } from './useTransactions'
import { currentYearMonth } from '@/lib/date'
import type { Transaction } from '@/types/transaction'

export interface DashboardStats {
  balanceCents: number
  monthIncomeCents: number
  monthExpenseCents: number
  recentTransactions: Transaction[]
  isLoading: boolean
}

export function useDashboardStats(): DashboardStats {
  const { data: transactions, isLoading } = useTransactions()

  return useMemo(() => {
    const all = transactions ?? []
    const { year, month } = currentYearMonth()
    const monthPrefix = `${year}-${String(month).padStart(2, '0')}`

    let balanceCents = 0
    let monthIncomeCents = 0
    let monthExpenseCents = 0

    for (const t of all) {
      const signedAmount = t.type === 'income' ? t.amountCents : -t.amountCents
      balanceCents += signedAmount

      if (t.date.startsWith(monthPrefix)) {
        if (t.type === 'income') monthIncomeCents += t.amountCents
        else monthExpenseCents += t.amountCents
      }
    }

    const recentTransactions = [...all]
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
      .slice(0, 6)

    return { balanceCents, monthIncomeCents, monthExpenseCents, recentTransactions, isLoading }
  }, [transactions, isLoading])
}
