import { useMemo, useState } from 'react'
import { addMonths, endOfMonth, format, isSameMonth, startOfMonth } from 'date-fns'
import { de } from 'date-fns/locale'
import { useCashflowForecast } from '@/hooks/useCashflowForecast'
import { CashflowCalendar } from '@/components/cashflow/CashflowCalendar'
import { ProGate } from '@/components/common/ProGate'
import { Skeleton } from '@/components/common/Skeleton'
import { formatMoney } from '@/lib/money'
import { formatDisplayDate } from '@/lib/date'
import { ChevronLeftIcon, ChevronRightIcon, AlertTriangleIcon } from '@/components/common/Icons'

const MAX_MONTHS_AHEAD = 6

export function CashflowPage() {
  const today = useMemo(() => new Date(), [])
  const [monthOffset, setMonthOffset] = useState(0)

  const selectedMonth = addMonths(startOfMonth(today), monthOffset)
  const forecastEnd = endOfMonth(selectedMonth)

  const { data: days, isLoading } = useCashflowForecast(today, forecastEnd)

  const worstDay = useMemo(() => {
    if (days.length === 0) return null
    return days.reduce((worst, day) => (day.balanceCents < worst.balanceCents ? day : worst), days[0])
  }, [days])

  const monthDays = days.filter((d) => isSameMonth(new Date(d.date), selectedMonth))
  const monthEndBalance = monthDays.at(-1)?.balanceCents ?? null

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setMonthOffset((o) => Math.max(0, o - 1))}
          disabled={monthOffset === 0}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-30 dark:text-slate-400 dark:hover:bg-slate-800"
          aria-label="Vorheriger Monat"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          {format(selectedMonth, 'MMMM yyyy', { locale: de })}
        </h2>
        <button
          onClick={() => setMonthOffset((o) => Math.min(MAX_MONTHS_AHEAD, o + 1))}
          disabled={monthOffset === MAX_MONTHS_AHEAD}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-30 dark:text-slate-400 dark:hover:bg-slate-800"
          aria-label="Nächster Monat"
        >
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      </div>

      <ProGate trigger="cashflow_calendar">
        {isLoading ? (
          <Skeleton className="h-96 w-full" />
        ) : (
          <>
            {worstDay && worstDay.balanceCents < 0 && (
              <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300">
                <AlertTriangleIcon className="h-4 w-4 shrink-0 translate-y-0.5" />
                <span>
                  Voraussichtlich reicht das Geld am <strong>{formatDisplayDate(worstDay.date)}</strong> nicht:
                  Kontostand von <strong>{formatMoney(worstDay.balanceCents)}</strong> erwartet.
                </span>
              </div>
            )}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <CashflowCalendar days={days} month={selectedMonth} />
            </div>

            {monthEndBalance !== null && (
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Erwarteter Kontostand Ende {format(selectedMonth, 'MMMM', { locale: de })}
                </span>
                <span
                  className={`text-lg font-semibold tabular-nums ${
                    monthEndBalance < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'
                  }`}
                >
                  {formatMoney(monthEndBalance)}
                </span>
              </div>
            )}
          </>
        )}
      </ProGate>

      <p className="text-center text-xs text-slate-400 dark:text-slate-500">
        Basiert auf aktiven wiederkehrenden Buchungen und offenen Rechnungsfälligkeiten — keine Garantie, nur
        eine Vorausschau.
      </p>
    </div>
  )
}
