import { addDays, format } from 'date-fns'
import { occurrencesBetween } from './recurrence'
import { invoiceTotalCents } from '@/types/invoice'
import type { RecurringRule } from '@/types/recurringRule'
import type { Invoice } from '@/types/invoice'
import type { Category } from '@/types/category'

export interface CashflowItem {
  label: string
  amountCents: number
  type: 'income' | 'expense'
}

export interface CashflowDay {
  date: string
  items: CashflowItem[]
  netCents: number
  balanceCents: number
}

/**
 * Projects the account balance forward day-by-day from `startingBalanceCents`
 * (the real balance as of today) using future occurrences of active
 * recurring rules and the due dates of unpaid invoices. Purely a preview —
 * nothing here is persisted.
 */
export function computeCashflowForecast(
  startingBalanceCents: number,
  recurringRules: RecurringRule[],
  unpaidInvoices: Invoice[],
  categoryLookup: Map<string, Category>,
  from: Date,
  to: Date,
): CashflowDay[] {
  const itemsByDate = new Map<string, CashflowItem[]>()

  const addItem = (date: string, item: CashflowItem) => {
    const list = itemsByDate.get(date) ?? []
    list.push(item)
    itemsByDate.set(date, list)
  }

  for (const rule of recurringRules.filter((r) => r.active)) {
    for (const date of occurrencesBetween(rule, from, to)) {
      addItem(date, {
        label: rule.note || categoryLookup.get(rule.categoryId)?.name || 'Wiederkehrende Buchung',
        amountCents: rule.amountCents,
        type: rule.type,
      })
    }
  }

  for (const invoice of unpaidInvoices) {
    if (invoice.dueDate >= format(from, 'yyyy-MM-dd') && invoice.dueDate <= format(to, 'yyyy-MM-dd')) {
      addItem(invoice.dueDate, {
        label: `Rechnung ${invoice.invoiceNumber} — ${invoice.clientName}`,
        amountCents: invoiceTotalCents(invoice),
        type: 'income',
      })
    }
  }

  const days: CashflowDay[] = []
  let runningBalance = startingBalanceCents
  let cursor = from

  while (cursor <= to) {
    const dateKey = format(cursor, 'yyyy-MM-dd')
    const items = itemsByDate.get(dateKey) ?? []
    const netCents = items.reduce((sum, i) => sum + (i.type === 'income' ? i.amountCents : -i.amountCents), 0)
    runningBalance += netCents
    days.push({ date: dateKey, items, netCents, balanceCents: runningBalance })
    cursor = addDays(cursor, 1)
  }

  return days
}
