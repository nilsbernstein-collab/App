import { format, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'

export function currentYearMonth(): { year: number; month: number } {
  const now = new Date()
  return { year: now.getFullYear(), month: now.getMonth() + 1 }
}

export function toIsoDate(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function formatDisplayDate(iso: string): string {
  return format(parseISO(iso), 'd. MMM yyyy', { locale: de })
}

export function formatMonthLabel(year: number, month: number): string {
  return format(new Date(year, month - 1, 1), 'MMM yyyy', { locale: de })
}

/** Returns the last N (year, month) pairs ending at the current month, oldest first. */
export function lastNMonths(n: number): { year: number; month: number }[] {
  const { year, month } = currentYearMonth()
  const result: { year: number; month: number }[] = []
  for (let i = n - 1; i >= 0; i--) {
    const date = new Date(year, month - 1 - i, 1)
    result.push({ year: date.getFullYear(), month: date.getMonth() + 1 })
  }
  return result
}
