import { formatMoney } from '@/lib/money'
import { calculateTaxReserve } from '@/lib/tax'
import { PiggyBankIcon } from '@/components/common/Icons'

export function TaxReserveCard({ yearlyIncomeCents, ratePercent }: { yearlyIncomeCents: number; ratePercent: number }) {
  const reserveCents = calculateTaxReserve(yearlyIncomeCents, ratePercent)

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex items-center gap-2">
        <PiggyBankIcon className="h-5 w-5 text-brand-500" />
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Steuerrücklagen-Empfehlung</h3>
      </div>
      <p className="text-3xl font-bold tabular-nums text-slate-900 dark:text-slate-100">{formatMoney(reserveCents)}</p>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {ratePercent}% von {formatMoney(yearlyIncomeCents)} Einnahmen in {new Date().getFullYear()}
      </p>
      <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
        Richtwert, ersetzt keine Steuerberatung. Passe den Prozentsatz in den Einstellungen an.
      </p>
    </div>
  )
}
