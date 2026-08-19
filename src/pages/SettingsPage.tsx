import { useState } from 'react'
import { useIncomeSources, useArchiveIncomeSource, useCreateIncomeSource } from '@/hooks/useIncomeSources'
import { useIsPro, useSubscription } from '@/hooks/useSubscription'
import { useSettings, useUpdateSettings } from '@/hooks/useSettings'
import { useUiStore } from '@/store/uiStore'
import { useThemeStore } from '@/store/themeStore'
import { FREE_LIMITS } from '@/lib/limits'
import { PlusIcon, TrashIcon, SparkleIcon, MoonIcon, SunIcon } from '@/components/common/Icons'
import { CategoryManager } from '@/components/settings/CategoryManager'
import { ApiAccessCard } from '@/components/settings/ApiAccessCard'
import { RecurringRulesManager } from '@/components/settings/RecurringRulesManager'
import { BudgetManager } from '@/components/settings/BudgetManager'
import { ProjectManager } from '@/components/settings/ProjectManager'
import { TaxSettings } from '@/components/settings/TaxSettings'
import type { Theme } from '@/types/settings'

function SectionCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</h2>
      {description && <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  )
}

export function SettingsPage() {
  const { data: sources = [] } = useIncomeSources()
  const archiveSource = useArchiveIncomeSource()
  const createSource = useCreateIncomeSource()
  const isPro = useIsPro()
  const { data: subscription } = useSubscription()
  const { data: settings } = useSettings()
  const updateSettings = useUpdateSettings()
  const openUpgradeModal = useUiStore((s) => s.openUpgradeModal)
  const theme = useThemeStore((s) => s.theme)
  const setTheme = useThemeStore((s) => s.setTheme)

  const [newSourceName, setNewSourceName] = useState('')

  const handleAddSource = () => {
    if (!newSourceName.trim()) return
    if (!isPro && sources.length >= FREE_LIMITS.maxIncomeSources) {
      openUpgradeModal('second_income_source')
      return
    }
    createSource.mutate({ name: newSourceName.trim(), color: '#147df5' })
    setNewSourceName('')
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <SectionCard title="Abo-Status" description={isPro ? 'Du nutzt NicheTrack Pro.' : 'Du nutzt den Free-Tier.'}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                isPro
                  ? 'bg-brand-500/10 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {isPro ? 'PRO' : 'FREE'}
            </span>
            {isPro && subscription?.billingInterval && (
              <span className="text-xs text-slate-400">
                {subscription.billingInterval === 'monthly' ? 'Monatliche Abrechnung' : 'Jährliche Abrechnung'}
              </span>
            )}
          </div>
          {!isPro && (
            <button
              onClick={() => openUpgradeModal('generic')}
              className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-600"
            >
              <SparkleIcon className="h-4 w-4" />
              Upgraden
            </button>
          )}
        </div>
      </SectionCard>

      <SectionCard title="Erscheinungsbild">
        <div className="grid grid-cols-3 gap-2">
          {(['light', 'dark', 'system'] as Theme[]).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`flex items-center justify-center gap-1.5 rounded-lg border py-2 text-sm font-medium transition ${
                theme === t
                  ? 'border-brand-400 bg-brand-50 text-brand-700 dark:border-brand-700 dark:bg-brand-950 dark:text-brand-300'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              {t === 'light' && <SunIcon className="h-4 w-4" />}
              {t === 'dark' && <MoonIcon className="h-4 w-4" />}
              {t === 'light' ? 'Hell' : t === 'dark' ? 'Dunkel' : 'System'}
            </button>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Einkommensquellen"
        description={isPro ? 'Verwalte beliebig viele Einkommensquellen.' : `Im Free-Tier ist ${FREE_LIMITS.maxIncomeSources} Einkommensquelle enthalten.`}
      >
        <ul className="mb-3 space-y-2">
          {sources.map((s) => (
            <li
              key={s.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800"
            >
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-sm text-slate-700 dark:text-slate-200">{s.name}</span>
                {s.kind && <span className="text-xs text-slate-400">· {s.kind}</span>}
              </div>
              {sources.length > 1 && (
                <button
                  onClick={() => archiveSource.mutate(s.id)}
                  className="rounded-lg p-1.5 text-slate-300 hover:bg-rose-50 hover:text-rose-500 dark:text-slate-600 dark:hover:bg-rose-950"
                  aria-label="Einkommensquelle entfernen"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
        <div className="flex gap-2">
          <input
            value={newSourceName}
            onChange={(e) => setNewSourceName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddSource()}
            placeholder="z.B. Etsy-Shop"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-brand-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
          <button
            onClick={handleAddSource}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <PlusIcon className="h-4 w-4" />
            Hinzufügen
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Kategorien" description="Standard-Kategorien für Einnahmen und Ausgaben.">
        <CategoryManager />
      </SectionCard>

      <SectionCard title="Wiederkehrende Buchungen">
        <RecurringRulesManager />
      </SectionCard>

      <SectionCard title="Budgets" description="Monatliche Ausgabenlimits pro Kategorie.">
        <BudgetManager />
      </SectionCard>

      <SectionCard title="Projekte & Kunden">
        <ProjectManager />
      </SectionCard>

      <SectionCard title="Steuer" description="Land und Abzugsfähigkeit für die EÜR-Vorbereitung.">
        <TaxSettings />
      </SectionCard>

      <SectionCard
        title="Steuerrücklage"
        description="Empfohlener Rücklage-Prozentsatz für den Steuerrücklagen-Rechner (Pro)."
      >
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={50}
            value={settings?.taxReserveRate ?? 28}
            disabled={!isPro}
            onChange={(e) => updateSettings.mutate({ taxReserveRate: Number(e.target.value) })}
            className="w-full accent-brand-500 disabled:opacity-40"
          />
          <span className="w-12 shrink-0 text-right text-sm font-semibold tabular-nums text-slate-700 dark:text-slate-200">
            {settings?.taxReserveRate ?? 28}%
          </span>
        </div>
        {!isPro && (
          <button
            onClick={() => openUpgradeModal('tax_reserve')}
            className="mt-3 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            Mit Pro freischalten →
          </button>
        )}
      </SectionCard>

      <ApiAccessCard />
    </div>
  )
}
