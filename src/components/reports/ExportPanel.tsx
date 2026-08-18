import { useState } from 'react'
import toast from 'react-hot-toast'
import { useTransactions } from '@/hooks/useTransactions'
import { useCategories } from '@/hooks/useCategories'
import { useIsPro } from '@/hooks/useSubscription'
import { useUiStore } from '@/store/uiStore'
import { exportTransactionsAsCsv, exportTransactionsAsJson } from '@/lib/export'
import { DownloadIcon, SparkleIcon } from '@/components/common/Icons'

const formats = [
  { id: 'pdf', label: 'PDF-Report' },
  { id: 'csv', label: 'CSV' },
  { id: 'json', label: 'JSON' },
] as const

export function ExportPanel() {
  const { data: transactions = [] } = useTransactions()
  const { data: categories = [] } = useCategories()
  const isPro = useIsPro()
  const openUpgradeModal = useUiStore((s) => s.openUpgradeModal)
  const [exportingFormat, setExportingFormat] = useState<string | null>(null)

  const handleExport = async (format: (typeof formats)[number]['id']) => {
    if (!isPro) {
      openUpgradeModal('export')
      return
    }
    if (transactions.length === 0) {
      toast.error('Keine Transaktionen zum Exportieren vorhanden.')
      return
    }

    setExportingFormat(format)
    try {
      if (format === 'csv') exportTransactionsAsCsv(transactions, categories)
      else if (format === 'json') exportTransactionsAsJson(transactions)
      else {
        const { exportTransactionsAsPdf } = await import('@/lib/exportPdf')
        exportTransactionsAsPdf(transactions, categories)
      }
      toast.success('Export gestartet')
    } catch {
      toast.error('Export fehlgeschlagen.')
    } finally {
      setExportingFormat(null)
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Daten exportieren</h2>
        {!isPro && <SparkleIcon className="h-4 w-4 text-brand-400" />}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {formats.map((f) => (
          <button
            key={f.id}
            onClick={() => handleExport(f.id)}
            disabled={exportingFormat === f.id}
            className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 py-4 text-sm font-medium text-slate-600 transition hover:border-brand-300 hover:bg-brand-50/50 disabled:opacity-60 dark:border-slate-800 dark:text-slate-300 dark:hover:border-brand-800 dark:hover:bg-brand-950/30"
          >
            <DownloadIcon className="h-5 w-5 text-slate-400" />
            {f.label}
          </button>
        ))}
      </div>
      {!isPro && (
        <p className="mt-3 text-center text-xs text-slate-400 dark:text-slate-500">
          Export ist Teil von NicheTrack Pro.
        </p>
      )}
    </div>
  )
}
