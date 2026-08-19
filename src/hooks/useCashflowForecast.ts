import { useMemo } from 'react'
import { useTransactions } from './useTransactions'
import { useRecurringRules } from './useRecurringRules'
import { useInvoices } from './useInvoices'
import { useCategoryLookup } from './useCategoryLookup'
import { computeCashflowForecast, type CashflowDay } from '@/lib/cashflowForecast'

export function useCashflowForecast(from: Date, to: Date): { data: CashflowDay[]; isLoading: boolean } {
  const { data: transactions, isLoading: transactionsLoading } = useTransactions()
  const { data: recurringRules, isLoading: rulesLoading } = useRecurringRules()
  const { data: invoices, isLoading: invoicesLoading } = useInvoices()
  const categoryLookup = useCategoryLookup()

  const data = useMemo(() => {
    const currentBalanceCents = (transactions ?? []).reduce(
      (sum, t) => sum + (t.type === 'income' ? t.amountCents : -t.amountCents),
      0,
    )
    const unpaidInvoices = (invoices ?? []).filter((i) => i.status === 'sent' || i.status === 'overdue')

    return computeCashflowForecast(currentBalanceCents, recurringRules ?? [], unpaidInvoices, categoryLookup, from, to)
  }, [transactions, recurringRules, invoices, categoryLookup, from, to])

  return { data, isLoading: transactionsLoading || rulesLoading || invoicesLoading }
}
