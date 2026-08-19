import type { EuerSummary } from './euer'
import { centsToEuros } from './money'
import { triggerDownload } from './export'

export function exportEuerAsCsv(summary: EuerSummary) {
  const header = ['Typ', 'Kategorie', 'Betrag (EUR)', 'Abzugsfähig (%)', 'Abzugsfähiger Betrag (EUR)']
  const rows = [
    ...summary.incomeLines.map((l) => [
      'Einnahme',
      l.categoryName,
      centsToEuros(l.totalCents).toFixed(2),
      '100',
      centsToEuros(l.totalCents).toFixed(2),
    ]),
    ...summary.expenseLines.map((l) => [
      'Ausgabe',
      l.categoryName,
      centsToEuros(l.totalCents).toFixed(2),
      String(l.deductiblePercent),
      centsToEuros(l.deductibleCents).toFixed(2),
    ]),
    [],
    ['Summe Einnahmen', '', centsToEuros(summary.incomeTotalCents).toFixed(2), '', ''],
    ['Summe abzugsfähige Ausgaben', '', '', '', centsToEuros(summary.deductibleExpenseTotalCents).toFixed(2)],
    ['Gewinn/Verlust', '', '', '', centsToEuros(summary.profitCents).toFixed(2)],
  ]

  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(';'))
    .join('\n')

  const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' })
  triggerDownload(blob, `euer-vorbereitung-${summary.year}.csv`)
}
