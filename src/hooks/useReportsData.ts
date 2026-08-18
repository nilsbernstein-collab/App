import { useMemo } from 'react'
import { useTransactions } from './useTransactions'
import { useIncomeSources } from './useIncomeSources'
import { lastNMonths, formatMonthLabel } from '@/lib/date'
import type { MonthlyPoint } from '@/lib/forecast'
import type { SourceTotal } from '@/components/charts/SourceComparisonChart'

export function useMonthlyPoints(months = 6): { data: MonthlyPoint[]; isLoading: boolean } {
  const { data: transactions, isLoading } = useTransactions()

  const data = useMemo(() => {
    const range = lastNMonths(months)
    return range.map(({ year, month }) => {
      const prefix = `${year}-${String(month).padStart(2, '0')}`
      let incomeCents = 0
      let expenseCents = 0
      for (const t of transactions ?? []) {
        if (!t.date.startsWith(prefix)) continue
        if (t.type === 'income') incomeCents += t.amountCents
        else expenseCents += t.amountCents
      }
      return { year, month, label: formatMonthLabel(year, month), incomeCents, expenseCents }
    })
  }, [transactions, months])

  return { data, isLoading }
}

export function useSourceTotals(): { data: SourceTotal[]; isLoading: boolean } {
  const { data: transactions, isLoading: transactionsLoading } = useTransactions()
  const { data: sources, isLoading: sourcesLoading } = useIncomeSources()

  const data = useMemo(() => {
    return (sources ?? []).map((source) => {
      const totalCents = (transactions ?? [])
        .filter((t) => t.type === 'income' && t.sourceId === source.id)
        .reduce((sum, t) => sum + t.amountCents, 0)
      return { name: source.name, color: source.color, totalCents }
    })
  }, [transactions, sources])

  return { data, isLoading: transactionsLoading || sourcesLoading }
}

export function useTotalIncomeThisYear(): number {
  const { data: transactions } = useTransactions()
  return useMemo(() => {
    const year = String(new Date().getFullYear())
    return (transactions ?? [])
      .filter((t) => t.type === 'income' && t.date.startsWith(year))
      .reduce((sum, t) => sum + t.amountCents, 0)
  }, [transactions])
}
