import { AnimatePresence } from 'framer-motion'
import { useDashboardStats } from '@/hooks/useDashboardStats'
import { useCategoryLookup } from '@/hooks/useCategoryLookup'
import { useIncomeSources } from '@/hooks/useIncomeSources'
import { StatCard } from '@/components/dashboard/StatCard'
import { TransactionRow } from '@/components/transactions/TransactionRow'
import { Skeleton } from '@/components/common/Skeleton'
import { formatMoney } from '@/lib/money'
import { PiggyBankIcon, TrendingUpIcon, ChartIcon } from '@/components/common/Icons'
import { useUiStore } from '@/store/uiStore'
import { Link } from 'react-router-dom'

export function DashboardPage() {
  const { balanceCents, monthIncomeCents, monthExpenseCents, recentTransactions, isLoading } =
    useDashboardStats()
  const categoryLookup = useCategoryLookup()
  const { data: sources } = useIncomeSources()
  const openTransactionForm = useUiStore((s) => s.openTransactionForm)

  const sourceLookup = new Map((sources ?? []).map((s) => [s.id, s.name]))

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Kontostand"
          value={formatMoney(balanceCents)}
          icon={<PiggyBankIcon className="h-5 w-5" />}
          isLoading={isLoading}
        />
        <StatCard
          label="Einnahmen (Monat)"
          value={formatMoney(monthIncomeCents)}
          icon={<TrendingUpIcon className="h-5 w-5" />}
          isLoading={isLoading}
          tone="positive"
        />
        <StatCard
          label="Ausgaben (Monat)"
          value={formatMoney(monthExpenseCents)}
          icon={<ChartIcon className="h-5 w-5" />}
          isLoading={isLoading}
          tone="negative"
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Letzte Transaktionen</h2>
          <Link
            to="/transactions"
            className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            Alle anzeigen
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : recentTransactions.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Noch keine Transaktionen erfasst. Leg direkt los!
            </p>
            <button
              onClick={() => openTransactionForm('income')}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
            >
              Erste Transaktion erfassen
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            <AnimatePresence initial={false}>
              {recentTransactions.map((t) => (
                <TransactionRow
                  key={t.id}
                  transaction={t}
                  category={categoryLookup.get(t.categoryId)}
                  sourceName={t.sourceId ? sourceLookup.get(t.sourceId) : undefined}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
