import { useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useTransactions } from '@/hooks/useTransactions'
import { useCategoryLookup } from '@/hooks/useCategoryLookup'
import { useIncomeSources } from '@/hooks/useIncomeSources'
import { useDeleteTransaction } from '@/hooks/useTransactions'
import { TransactionRow } from '@/components/transactions/TransactionRow'
import { Skeleton } from '@/components/common/Skeleton'
import { useUiStore } from '@/store/uiStore'
import type { TransactionType } from '@/types/transaction'
import { PlusIcon } from '@/components/common/Icons'

type TypeFilter = 'all' | TransactionType

export function TransactionsPage() {
  const { data: transactions, isLoading } = useTransactions()
  const categoryLookup = useCategoryLookup()
  const { data: sources } = useIncomeSources()
  const deleteTransaction = useDeleteTransaction()
  const openTransactionForm = useUiStore((s) => s.openTransactionForm)

  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [search, setSearch] = useState('')

  const sourceLookup = new Map((sources ?? []).map((s) => [s.id, s.name]))

  const filtered = useMemo(() => {
    return (transactions ?? []).filter((t) => {
      if (typeFilter !== 'all' && t.type !== typeFilter) return false
      if (categoryFilter !== 'all' && t.categoryId !== categoryFilter) return false
      if (search && !t.note?.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [transactions, typeFilter, categoryFilter, search])

  const categories = Array.from(categoryLookup.values()).sort((a, b) => a.order - b.order)

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {(['all', 'income', 'expense'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setTypeFilter(f)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                typeFilter === f
                  ? 'bg-brand-500 text-white'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800'
              }`}
            >
              {f === 'all' ? 'Alle' : f === 'income' ? 'Einnahmen' : 'Ausgaben'}
            </button>
          ))}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-full border-none bg-white px-3 py-1.5 text-sm text-slate-600 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800"
          >
            <option value="all">Alle Kategorien</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Notiz durchsuchen…"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm outline-none ring-brand-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 sm:w-48"
          />
          <button
            onClick={() => openTransactionForm('expense')}
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-600"
          >
            <PlusIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Neu</span>
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-3">
        {isLoading ? (
          <div className="space-y-2 p-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">
            Keine Transaktionen gefunden.
          </p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            <AnimatePresence initial={false}>
              {filtered.map((t) => (
                <TransactionRow
                  key={t.id}
                  transaction={t}
                  category={categoryLookup.get(t.categoryId)}
                  sourceName={t.sourceId ? sourceLookup.get(t.sourceId) : undefined}
                  onClick={() => openTransactionForm(t.type, t)}
                  onDelete={() => deleteTransaction.mutate(t.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
