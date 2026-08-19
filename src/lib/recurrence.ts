import { addMonths, addWeeks, addYears, format, isAfter, isBefore, parseISO, startOfDay } from 'date-fns'
import type { RecurrenceFrequency, RecurringRule } from '@/types/recurringRule'

function advance(date: Date, frequency: RecurrenceFrequency, interval: number): Date {
  switch (frequency) {
    case 'weekly':
      return addWeeks(date, interval)
    case 'monthly':
      return addMonths(date, interval)
    case 'yearly':
      return addYears(date, interval)
  }
}

/**
 * Every occurrence date (ISO, ascending) for a rule that falls on or before
 * `asOf` and hasn't been generated yet. Starts the day after
 * `lastGeneratedDate` if set, otherwise at `startDate`.
 */
export function dueOccurrences(rule: RecurringRule, asOf: Date = new Date()): string[] {
  const occurrences: string[] = []

  let cursor = rule.lastGeneratedDate ? advance(parseISO(rule.lastGeneratedDate), rule.frequency, rule.interval) : parseISO(rule.startDate)

  const endDate = rule.endDate ? parseISO(rule.endDate) : null

  // Safety cap: never generate more than 500 occurrences in one pass (e.g. a
  // years-old weekly rule opened for the first time) to keep this bounded.
  for (let i = 0; i < 500; i++) {
    if (isAfter(cursor, asOf)) break
    if (endDate && isAfter(cursor, endDate)) break

    occurrences.push(format(cursor, 'yyyy-MM-dd'))
    cursor = advance(cursor, rule.frequency, rule.interval)
  }

  return occurrences
}

/**
 * Every occurrence date (ISO, ascending) for a rule strictly between `from`
 * and `to` (inclusive) — used for forward-looking previews like the cashflow
 * calendar. Resumes from the rule's own cursor (`lastGeneratedDate`/
 * `startDate`), so it lines up exactly with what `dueOccurrences` will
 * materialize once those dates arrive.
 */
export function occurrencesBetween(rule: RecurringRule, from: Date, to: Date): string[] {
  const occurrences: string[] = []

  let cursor = rule.lastGeneratedDate ? advance(parseISO(rule.lastGeneratedDate), rule.frequency, rule.interval) : parseISO(rule.startDate)

  const endDate = rule.endDate ? parseISO(rule.endDate) : null
  // Normalize to day granularity so a `from`/`to` carrying today's time-of-day
  // (e.g. `new Date()`) doesn't exclude an occurrence that lands on today.
  const fromDay = startOfDay(from)
  const toDay = startOfDay(to)

  for (let i = 0; i < 1000; i++) {
    if (isAfter(cursor, toDay)) break
    if (endDate && isAfter(cursor, endDate)) break

    if (!isBefore(cursor, fromDay)) {
      occurrences.push(format(cursor, 'yyyy-MM-dd'))
    }
    cursor = advance(cursor, rule.frequency, rule.interval)
  }

  return occurrences
}
