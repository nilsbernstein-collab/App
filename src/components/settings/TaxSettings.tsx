import { useEffect, useState } from 'react'
import { useCategories } from '@/hooks/useCategories'
import { categoryRepository } from '@/data/repositories'
import { categoriesKey } from '@/hooks/useCategories'
import { useQueryClient } from '@tanstack/react-query'
import { useSettings, useUpdateSettings } from '@/hooks/useSettings'
import { TAX_COUNTRY_LABELS, type TaxCountry } from '@/types/settings'

function DeductibilityInput({ categoryId, categoryName, value }: { categoryId: string; categoryName: string; value: number }) {
  const queryClient = useQueryClient()
  const [local, setLocal] = useState(String(value))

  useEffect(() => setLocal(String(value)), [value])

  const commit = async () => {
    const parsed = Math.max(0, Math.min(100, Math.round(Number(local))))
    if (Number.isNaN(parsed)) {
      setLocal(String(value))
      return
    }
    await categoryRepository.update(categoryId, { deductiblePercent: parsed })
    queryClient.invalidateQueries({ queryKey: categoriesKey })
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800">
      <span className="text-sm text-slate-700 dark:text-slate-200">{categoryName}</span>
      <div className="flex items-center gap-1.5">
        <input
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === 'Enter' && (e.currentTarget as HTMLInputElement).blur()}
          inputMode="numeric"
          className="w-14 rounded-lg border border-slate-300 bg-white px-2 py-1 text-right text-sm outline-none ring-brand-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
        <span className="text-sm text-slate-400">%</span>
      </div>
    </div>
  )
}

export function TaxSettings() {
  const { data: settings } = useSettings()
  const updateSettings = useUpdateSettings()
  const { data: categories = [] } = useCategories()

  const expenseCategories = categories.filter((c) => c.type === 'expense')

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Land</label>
        <select
          value={settings?.taxCountry ?? 'DE'}
          onChange={(e) => updateSettings.mutate({ taxCountry: e.target.value as TaxCountry })}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-brand-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        >
          {(Object.keys(TAX_COUNTRY_LABELS) as TaxCountry[]).map((code) => (
            <option key={code} value={code}>
              {TAX_COUNTRY_LABELS[code]}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-slate-400">Bestimmt die Bezeichnung der EÜR-Vorbereitung in den Berichten.</p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Abzugsfähigkeit pro Ausgaben-Kategorie
        </label>
        <p className="mb-2 text-xs text-slate-400">
          Standardmäßig 100% abzugsfähig. Z.B. Bewirtungskosten in Deutschland sind nur zu 70% abzugsfähig.
        </p>
        <div className="space-y-2">
          {expenseCategories.map((c) => (
            <DeductibilityInput
              key={c.id}
              categoryId={c.id}
              categoryName={c.name}
              value={c.deductiblePercent ?? 100}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
