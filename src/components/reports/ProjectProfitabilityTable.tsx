import { Link } from 'react-router-dom'
import { useProjectProfitability } from '@/hooks/useProjectProfitability'
import { formatMoney } from '@/lib/money'
import { Skeleton } from '@/components/common/Skeleton'

export function ProjectProfitabilityTable() {
  const { data: projects, isLoading } = useProjectProfitability()

  if (isLoading) {
    return <Skeleton className="h-40 w-full" />
  }

  if (projects.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
        Noch keine Projekte angelegt.{' '}
        <Link to="/settings" className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
          Projekt anlegen
        </Link>{' '}
        und Transaktionen zuordnen, um die Rentabilität zu sehen.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {projects
        .slice()
        .sort((a, b) => b.marginCents - a.marginCents)
        .map((p) => {
          const isProfit = p.marginCents >= 0
          return (
            <div key={p.projectId} className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="font-medium text-slate-800 dark:text-slate-100">{p.name}</span>
                  {p.clientName && <span className="text-xs text-slate-400">· {p.clientName}</span>}
                </div>
                <span
                  className={`text-sm font-semibold tabular-nums ${
                    isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {isProfit ? '+' : ''}
                  {formatMoney(p.marginCents)}
                  {p.incomeCents > 0 && <span className="ml-1 font-normal text-slate-400">({p.marginPercent}%)</span>}
                </span>
              </div>
              <div className="flex gap-4 text-xs text-slate-500 dark:text-slate-400">
                <span>Einnahmen: {formatMoney(p.incomeCents)}</span>
                <span>Ausgaben: {formatMoney(p.expenseCents)}</span>
              </div>
            </div>
          )
        })}
    </div>
  )
}
