import { useEffect, useState } from 'react'
import { useCategories } from '@/hooks/useCategories'
import { useBudgets, useRemoveBudget, useSetBudget } from '@/hooks/useBudgets'
import { centsToEuros, eurosToCents } from '@/lib/money'
import { TrashIcon } from '@/components/common/Icons'
import type { Budget } from '@/types/budget'

function BudgetInput({
  categoryName,
  color,
  budget,
  onSave,
}: {
  categoryName: string
  color: string
  budget?: Budget
  onSave: (cents: number) => void
}) {
  const removeBudget = useRemoveBudget()
  const [value, setValue] = useState(budget ? String(centsToEuros(budget.monthlyLimitCents)) : '')

  useEffect(() => {
    setValue(budget ? String(centsToEuros(budget.monthlyLimitCents)) : '')
  }, [budget])

  const commit = () => {
    const parsed = Number(value.replace(',', '.'))
    if (!value || Number.isNaN(parsed) || parsed <= 0) {
      if (budget) removeBudget.mutate(budget.id)
      return
    }
    if (!budget || eurosToCents(parsed) !== budget.monthlyLimitCents) {
      onSave(eurosToCents(parsed))
    }
  }

  return (
    <li className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800">
      <div className="flex min-w-0 items-center gap-2">
        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
        <span className="truncate text-sm text-slate-700 dark:text-slate-200">{categoryName}</span>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === 'Enter' && (e.currentTarget as HTMLInputElement).blur()}
          inputMode="decimal"
          placeholder="kein Limit"
          className="w-28 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-right text-sm outline-none ring-brand-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
        {budget && (
          <button
            onClick={() => {
              removeBudget.mutate(budget.id)
              setValue('')
            }}
            className="rounded-lg p-1.5 text-slate-300 hover:bg-rose-50 hover:text-rose-500 dark:text-slate-600 dark:hover:bg-rose-950"
            aria-label="Budget entfernen"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        )}
      </div>
    </li>
  )
}

export function BudgetManager() {
  const { data: categories = [] } = useCategories()
  const { data: budgets = [] } = useBudgets()
  const setBudget = useSetBudget()

  const expenseCategories = categories.filter((c) => c.type === 'expense')
  const budgetByCategory = new Map(budgets.map((b) => [b.categoryId, b]))

  return (
    <div>
      <p className="mb-3 text-xs text-slate-400 dark:text-slate-500">
        Setze ein monatliches Limit pro Ausgaben-Kategorie. Der Fortschritt erscheint dann auf dem Dashboard.
      </p>
      <ul className="space-y-2">
        {expenseCategories.map((category) => (
          <BudgetInput
            key={category.id}
            categoryName={category.name}
            color={category.color}
            budget={budgetByCategory.get(category.id)}
            onSave={(cents) => setBudget.mutate({ categoryId: category.id, monthlyLimitCents: cents })}
          />
        ))}
      </ul>
      {expenseCategories.length === 0 && (
        <p className="py-4 text-center text-sm text-slate-400">Keine Ausgaben-Kategorien vorhanden.</p>
      )}
    </div>
  )
}
