import { Link } from 'react-router-dom'
import { useBudgetProgress } from '@/hooks/useBudgetProgress'
import { formatMoney } from '@/lib/money'
import { Skeleton } from '@/components/common/Skeleton'

export function BudgetProgressList() {
  const { data: budgets, isLoading } = useBudgetProgress()

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <Skeleton className="mb-3 h-4 w-32" />
        <Skeleton className="h-16 w-full" />
      </div>
    )
  }

  if (budgets.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-1 text-sm font-semibold text-slate-800 dark:text-slate-100">Budgets</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Noch keine Budgets gesetzt.{' '}
          <Link to="/settings" className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
            Jetzt einrichten
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">Budgets diesen Monat</h2>
      <div className="space-y-3">
        {budgets.map((b) => {
          const isOverBudget = b.percent > 100
          const barColor = isOverBudget ? '#f43f5e' : b.percent > 85 ? '#f59e0b' : b.color

          return (
            <div key={b.budgetId}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-200">{b.categoryName}</span>
                <span
                  className={`tabular-nums ${isOverBudget ? 'font-semibold text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'}`}
                >
                  {formatMoney(b.spentCents)} / {formatMoney(b.limitCents)}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, b.percent)}%`, backgroundColor: barColor }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
