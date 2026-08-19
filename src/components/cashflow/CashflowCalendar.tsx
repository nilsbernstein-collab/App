import { useState } from 'react'
import { endOfMonth, format, getDay, isSameMonth, isToday, startOfMonth } from 'date-fns'
import { de } from 'date-fns/locale'
import type { CashflowDay } from '@/lib/cashflowForecast'
import { formatMoney } from '@/lib/money'
import { Modal } from '@/components/common/Modal'

const WEEKDAY_LABELS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

function mondayIndex(date: Date): number {
  const day = getDay(date) // 0 = Sunday
  return day === 0 ? 6 : day - 1
}

export function CashflowCalendar({ days, month }: { days: CashflowDay[]; month: Date }) {
  const [selectedDay, setSelectedDay] = useState<CashflowDay | null>(null)

  const monthDays = days.filter((d) => isSameMonth(new Date(d.date), month))
  const firstDay = startOfMonth(month)
  const leadingBlanks = mondayIndex(firstDay)
  const lastDay = endOfMonth(month)
  const trailingBlanks = 6 - mondayIndex(lastDay)

  return (
    <>
      <div className="grid grid-cols-7 gap-1.5 text-center">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="text-xs font-medium text-slate-400">
            {label}
          </div>
        ))}

        {Array.from({ length: leadingBlanks }).map((_, i) => (
          <div key={`lead-${i}`} />
        ))}

        {monthDays.map((day) => {
          const dateObj = new Date(day.date)
          const isNegative = day.balanceCents < 0
          const hasItems = day.items.length > 0

          return (
            <button
              key={day.date}
              onClick={() => hasItems && setSelectedDay(day)}
              className={`flex aspect-square flex-col items-center justify-center rounded-lg border p-1 text-xs transition ${
                isNegative
                  ? 'border-rose-300 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/50'
                  : 'border-slate-200 dark:border-slate-800'
              } ${isToday(dateObj) ? 'ring-2 ring-brand-400' : ''} ${
                hasItems ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800' : ''
              }`}
            >
              <span className="text-slate-600 dark:text-slate-300">{format(dateObj, 'd')}</span>
              {day.netCents !== 0 && (
                <span
                  className={`mt-0.5 font-semibold tabular-nums ${
                    day.netCents > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {day.netCents > 0 ? '+' : ''}
                  {(day.netCents / 100).toFixed(0)}€
                </span>
              )}
            </button>
          )
        })}

        {Array.from({ length: trailingBlanks }).map((_, i) => (
          <div key={`trail-${i}`} />
        ))}
      </div>

      <Modal
        isOpen={selectedDay !== null}
        onClose={() => setSelectedDay(null)}
        title={selectedDay ? format(new Date(selectedDay.date), 'd. MMMM yyyy', { locale: de }) : undefined}
        maxWidthClassName="max-w-sm"
      >
        {selectedDay && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              {selectedDay.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-300">{item.label}</span>
                  <span
                    className={`font-medium tabular-nums ${
                      item.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {item.type === 'income' ? '+' : '-'}
                    {formatMoney(item.amountCents)}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-sm font-semibold dark:border-slate-800">
              <span className="text-slate-700 dark:text-slate-200">Kontostand danach</span>
              <span className={selectedDay.balanceCents < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'}>
                {formatMoney(selectedDay.balanceCents)}
              </span>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
