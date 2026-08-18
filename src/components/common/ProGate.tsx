import type { ReactNode } from 'react'
import { useIsPro } from '@/hooks/useSubscription'
import { useUiStore } from '@/store/uiStore'
import { SparkleIcon } from './Icons'
import type { UpgradeTrigger } from '@/types/subscription'

/**
 * Shows a blurred, non-interactive preview of a Pro feature with an upgrade CTA
 * overlay — lets Free users see the value before they hit the paywall, instead
 * of a plain "locked" placeholder.
 */
export function ProGate({ trigger, children }: { trigger: UpgradeTrigger; children: ReactNode }) {
  const isPro = useIsPro()
  const openUpgradeModal = useUiStore((s) => s.openUpgradeModal)

  if (isPro) return <>{children}</>

  return (
    <div className="relative">
      <div className="pointer-events-none select-none blur-[3px] opacity-60">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center">
        <button
          onClick={() => openUpgradeModal(trigger)}
          className="flex items-center gap-1.5 rounded-full bg-slate-900/90 px-4 py-2 text-sm font-medium text-white shadow-lg backdrop-blur transition hover:bg-slate-900 dark:bg-white/90 dark:text-slate-900"
        >
          <SparkleIcon className="h-4 w-4" />
          Mit Pro freischalten
        </button>
      </div>
    </div>
  )
}
