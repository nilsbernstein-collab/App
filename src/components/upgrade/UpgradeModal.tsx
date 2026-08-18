import { useState } from 'react'
import { Modal } from '@/components/common/Modal'
import { useUiStore } from '@/store/uiStore'
import { FEATURE_COMPARISON, PRICING, UPGRADE_COPY } from '@/lib/pricing'
import { CheckIcon, CloseIcon, SparkleIcon } from '@/components/common/Icons'
import type { BillingInterval } from '@/types/subscription'

export function UpgradeModal() {
  const isOpen = useUiStore((s) => s.isUpgradeModalOpen)
  const trigger = useUiStore((s) => s.upgradeTrigger)
  const close = useUiStore((s) => s.closeUpgradeModal)
  const openCheckout = useUiStore((s) => s.openCheckoutModal)

  const [interval, setInterval] = useState<BillingInterval>('yearly')
  const copy = UPGRADE_COPY[trigger] ?? UPGRADE_COPY.generic

  return (
    <Modal isOpen={isOpen} onClose={close} maxWidthClassName="max-w-lg">
      <div className="mb-1 flex items-center gap-2 text-brand-600 dark:text-brand-400">
        <SparkleIcon className="h-5 w-5" />
        <span className="text-xs font-semibold uppercase tracking-wide">NicheTrack Pro</span>
      </div>
      <h2 className="mb-1 text-lg font-semibold text-slate-900 dark:text-slate-100">{copy.title}</h2>
      <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">{copy.description}</p>

      <div className="mb-4 grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
        {(['monthly', 'yearly'] as const).map((i) => (
          <button
            key={i}
            onClick={() => setInterval(i)}
            className={`relative rounded-md py-2 text-sm font-medium transition ${
              interval === i
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-100'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {i === 'monthly' ? 'Monatlich' : 'Jährlich'}
            {i === 'yearly' && (
              <span className="absolute -top-2 right-1 rounded-full bg-emerald-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {PRICING.yearly.discountLabel}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mb-5 rounded-xl border border-brand-200 bg-brand-50/60 p-4 dark:border-brand-900 dark:bg-brand-950/40">
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            {interval === 'monthly' ? PRICING.monthly.label : PRICING.yearly.label}
          </span>
        </div>
        {interval === 'yearly' && (
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            entspricht {PRICING.yearly.equivalentMonthly}
          </p>
        )}
      </div>

      <div className="mb-5 space-y-2">
        {FEATURE_COMPARISON.map((row) => (
          <div key={row.label} className="flex items-center justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-300">{row.label}</span>
            <div className="flex items-center gap-4">
              <FeatureCell value={row.free} muted />
              <FeatureCell value={row.pro} />
            </div>
          </div>
        ))}
        <div className="flex justify-end gap-4 pt-1 text-xs font-semibold text-slate-400">
          <span className="w-10 text-center">Free</span>
          <span className="w-10 text-center text-brand-600 dark:text-brand-400">Pro</span>
        </div>
      </div>

      <button
        onClick={() => openCheckout(interval)}
        className="w-full rounded-lg bg-brand-500 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 active:scale-[0.99]"
      >
        Jetzt upgraden
      </button>
      <p className="mt-2 text-center text-xs text-slate-400 dark:text-slate-500">
        Jederzeit kündbar. Keine versteckten Kosten.
      </p>
    </Modal>
  )
}

function FeatureCell({ value, muted }: { value: string | boolean; muted?: boolean }) {
  if (typeof value === 'boolean') {
    return (
      <span className="flex w-10 justify-center">
        {value ? (
          <CheckIcon className={`h-4 w-4 ${muted ? 'text-slate-400' : 'text-brand-500'}`} />
        ) : (
          <CloseIcon className="h-4 w-4 text-slate-300 dark:text-slate-600" />
        )}
      </span>
    )
  }
  return (
    <span className={`w-10 text-center text-xs font-medium ${muted ? 'text-slate-400' : 'text-brand-600 dark:text-brand-400'}`}>
      {value}
    </span>
  )
}
