import { motion } from 'framer-motion'
import type { Transaction } from '@/types/transaction'
import type { Category } from '@/types/category'
import { formatDisplayDate } from '@/lib/date'
import { formatSignedMoney } from '@/lib/money'
import { TrashIcon } from '@/components/common/Icons'

interface TransactionRowProps {
  transaction: Transaction
  category?: Category
  sourceName?: string
  onClick?: () => void
  onDelete?: () => void
}

export function TransactionRow({ transaction, category, sourceName, onClick, onDelete }: TransactionRowProps) {
  const isOptimistic = transaction.id.startsWith('optimistic-')

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: isOptimistic ? 0.6 : 1 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 ${
        onClick ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60' : ''
      }`}
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
        style={{ backgroundColor: category?.color ?? '#64748b' }}
      >
        {category?.name?.slice(0, 1) ?? '?'}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">
            {category?.name ?? 'Unkategorisiert'}
          </span>
          {sourceName && (
            <span className="hidden shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400 sm:inline">
              {sourceName}
            </span>
          )}
        </div>
        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
          {formatDisplayDate(transaction.date)}
          {transaction.note ? ` · ${transaction.note}` : ''}
        </p>
      </div>

      <span
        className={`shrink-0 text-sm font-semibold tabular-nums ${
          transaction.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'
        }`}
      >
        {formatSignedMoney(transaction.amountCents, transaction.type)}
      </span>

      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          aria-label="Transaktion löschen"
          className="shrink-0 rounded-lg p-1.5 text-slate-300 opacity-0 transition hover:bg-rose-50 hover:text-rose-500 group-hover:opacity-100 dark:text-slate-600 dark:hover:bg-rose-950"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      )}
    </motion.div>
  )
}
