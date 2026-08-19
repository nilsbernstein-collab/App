import { useMemo, useState } from 'react'
import { useTransactions } from '@/hooks/useTransactions'
import { useCategories } from '@/hooks/useCategories'
import { useSettings } from '@/hooks/useSettings'
import { useIsPro } from '@/hooks/useSubscription'
import { useUiStore } from '@/store/uiStore'
import { computeEuerSummary, EUER_REPORT_TITLE } from '@/lib/euer'
import { exportEuerAsCsv } from '@/lib/euerExport'
import { formatMoney } from '@/lib/money'
import { DownloadIcon, SparkleIcon } from '@/components/common/Icons'

export function EuerCard() {
  const { data: transactions = [] } = useTransactions()
  const { data: categories = [] } = useCategories()
  const { data: settings } = useSettings()
  const isPro = useIsPro()
  const openUpgradeModal = useUiStore((s) => s.openUpgradeModal)

  const availableYears = useMemo(() => {
    const years = new Set(transactions.map((t) => Number(t.date.slice(0, 4))))
    years.add(new Date().getFullYear())
    return Array.from(years).sort((a, b) => b - a)
  }, [transactions])

  const [year, setYear] = useState(new Date().getFullYear())
  const country = settings?.taxCountry ?? 'DE'

  const summary = useMemo(
    () => computeEuerSummary(transactions, categories, year, country),
    [transactions, categories, year, country],
  )

  const handleExportPdf = async () => {
    if (!isPro) return openUpgradeModal('euer_export')
    const { generateEuerPdf } = await import('@/lib/euerPdf')
    generateEuerPdf(summary)
  }

  const handleExportCsv = () => {
    if (!isPro) return openUpgradeModal('euer_export')
    exportEuerAsCsv(summary)
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{EUER_REPORT_TITLE[country]}</h2>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm outline-none ring-brand-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        >
          {availableYears.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-xs text-slate-400">Einnahmen</p>
          <p className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
            {formatMoney(summary.incomeTotalCents)}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Abzugsf. Ausgaben</p>
          <p className="font-semibold tabular-nums text-rose-600 dark:text-rose-400">
            {formatMoney(summary.deductibleExpenseTotalCents)}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Gewinn/Verlust</p>
          <p
            className={`font-semibold tabular-nums ${
              summary.profitCents >= 0 ? 'text-slate-800 dark:text-slate-100' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatMoney(summary.profitCents)}
          </p>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={handleExportPdf}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          {isPro ? <DownloadIcon className="h-4 w-4" /> : <SparkleIcon className="h-4 w-4 text-brand-400" />}
          PDF exportieren
        </button>
        <button
          onClick={handleExportCsv}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          {isPro ? <DownloadIcon className="h-4 w-4" /> : <SparkleIcon className="h-4 w-4 text-brand-400" />}
          CSV exportieren
        </button>
      </div>
      <p className="mt-3 text-center text-xs text-slate-400 dark:text-slate-500">
        Vorbereitung, ersetzt keine Steuerberatung.
      </p>
    </div>
  )
}
