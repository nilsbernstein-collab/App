import { useState } from 'react'
import toast from 'react-hot-toast'
import { Modal } from '@/components/common/Modal'
import { useUiStore } from '@/store/uiStore'
import { useSetSubscription } from '@/hooks/useSubscription'
import { PRICING } from '@/lib/pricing'
import { createCheckoutSession } from '@/lib/checkout'
import { SparkleIcon } from '@/components/common/Icons'

export function CheckoutModal() {
  const isOpen = useUiStore((s) => s.isCheckoutModalOpen)
  const close = useUiStore((s) => s.closeCheckoutModal)
  const interval = useUiStore((s) => s.checkoutInterval)
  const setSubscription = useSetSubscription()

  const [isProcessing, setIsProcessing] = useState(false)
  const price = interval === 'monthly' ? PRICING.monthly : PRICING.yearly

  const handlePay = async () => {
    setIsProcessing(true)
    try {
      const session = await createCheckoutSession(interval)
      await setSubscription.mutateAsync({
        tier: 'pro',
        billingInterval: interval,
        currentPeriodEnd: session.currentPeriodEnd,
        stripeCustomerId: session.customerId,
        stripeSubscriptionId: session.subscriptionId,
      })
      toast.success('Willkommen bei NicheTrack Pro! 🎉')
      close()
    } catch {
      toast.error('Zahlung fehlgeschlagen. Bitte versuch es erneut.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={close} title="Checkout" maxWidthClassName="max-w-sm">
      <div className="mb-4 flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3 dark:bg-slate-800">
        <div className="flex items-center gap-2">
          <SparkleIcon className="h-4 w-4 text-brand-500" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">NicheTrack Pro</span>
        </div>
        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{price.label}</span>
      </div>

      {/*
        DEMO-CHECKOUT — kein echtes Zahlungsformular.
        Für eine echte Integration: Stripe Elements / Payment Element hier einbinden
        (@stripe/react-stripe-js), siehe lib/checkout.ts für den Session-Aufruf.
      */}
      <div className="mb-4 space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Kartennummer</label>
          <input
            disabled
            placeholder="4242 4242 4242 4242"
            className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-800"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input
            disabled
            placeholder="MM / JJ"
            className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-800"
          />
          <input
            disabled
            placeholder="CVC"
            className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-800"
          />
        </div>
      </div>

      <button
        onClick={handlePay}
        disabled={isProcessing}
        className="w-full rounded-lg bg-brand-500 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 disabled:opacity-60"
      >
        {isProcessing ? 'Wird verarbeitet…' : `${price.label} bezahlen (Demo)`}
      </button>
      <p className="mt-2 text-center text-xs text-slate-400 dark:text-slate-500">
        Demo-Modus — es wird keine echte Zahlung ausgelöst.
      </p>
    </Modal>
  )
}
