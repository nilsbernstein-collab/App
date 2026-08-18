import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Skeleton } from '@/components/common/Skeleton'

interface StatCardProps {
  label: string
  value: string
  icon: ReactNode
  isLoading?: boolean
  tone?: 'default' | 'positive' | 'negative'
}

const toneClasses: Record<NonNullable<StatCardProps['tone']>, string> = {
  default: 'text-slate-900 dark:text-slate-100',
  positive: 'text-emerald-600 dark:text-emerald-400',
  negative: 'text-rose-600 dark:text-rose-400',
}

export function StatCard({ label, value, icon, isLoading, tone = 'default' }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</span>
        <span className="text-slate-400 dark:text-slate-500">{icon}</span>
      </div>
      {isLoading ? (
        <Skeleton className="h-8 w-32" />
      ) : (
        <span className={`text-2xl font-semibold tabular-nums ${toneClasses[tone]}`}>{value}</span>
      )}
    </motion.div>
  )
}
