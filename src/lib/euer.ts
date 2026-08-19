import type { Transaction } from '@/types/transaction'
import type { Category } from '@/types/category'
import type { TaxCountry } from '@/types/settings'

export interface EuerCategoryLine {
  categoryId: string
  categoryName: string
  totalCents: number
  deductiblePercent: number
  deductibleCents: number
}

export interface EuerSummary {
  year: number
  country: TaxCountry
  incomeTotalCents: number
  incomeLines: EuerCategoryLine[]
  expenseTotalCents: number
  /** Sum of expenseLines' deductibleCents — what actually reduces taxable profit. */
  deductibleExpenseTotalCents: number
  expenseLines: EuerCategoryLine[]
  /** incomeTotalCents - deductibleExpenseTotalCents. */
  profitCents: number
}

export const EUER_REPORT_TITLE: Record<TaxCountry, string> = {
  DE: 'Einnahmenüberschussrechnung (EÜR) — Vorbereitung',
  AT: 'Einnahmen-Ausgaben-Rechnung — Vorbereitung',
  CH: 'Einnahmen-Ausgaben-Übersicht — Vorbereitung',
}

export function computeEuerSummary(
  transactions: Transaction[],
  categories: Category[],
  year: number,
  country: TaxCountry,
): EuerSummary {
  const yearPrefix = String(year)
  const yearTransactions = transactions.filter((t) => t.date.startsWith(yearPrefix))
  const categoryLookup = new Map(categories.map((c) => [c.id, c]))

  function linesFor(type: 'income' | 'expense'): EuerCategoryLine[] {
    const totals = new Map<string, number>()
    for (const t of yearTransactions) {
      if (t.type !== type) continue
      totals.set(t.categoryId, (totals.get(t.categoryId) ?? 0) + t.amountCents)
    }

    return Array.from(totals.entries())
      .map(([categoryId, totalCents]) => {
        const category = categoryLookup.get(categoryId)
        const deductiblePercent = type === 'expense' ? (category?.deductiblePercent ?? 100) : 100
        return {
          categoryId,
          categoryName: category?.name ?? 'Unkategorisiert',
          totalCents,
          deductiblePercent,
          deductibleCents: Math.round(totalCents * (deductiblePercent / 100)),
        }
      })
      .sort((a, b) => b.totalCents - a.totalCents)
  }

  const incomeLines = linesFor('income')
  const expenseLines = linesFor('expense')
  const incomeTotalCents = incomeLines.reduce((sum, l) => sum + l.totalCents, 0)
  const expenseTotalCents = expenseLines.reduce((sum, l) => sum + l.totalCents, 0)
  const deductibleExpenseTotalCents = expenseLines.reduce((sum, l) => sum + l.deductibleCents, 0)

  return {
    year,
    country,
    incomeTotalCents,
    incomeLines,
    expenseTotalCents,
    deductibleExpenseTotalCents,
    expenseLines,
    profitCents: incomeTotalCents - deductibleExpenseTotalCents,
  }
}
