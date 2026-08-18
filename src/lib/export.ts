import type { Transaction } from '@/types/transaction'
import type { Category } from '@/types/category'
import { centsToEuros } from './money'

export function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function exportTransactionsAsJson(transactions: Transaction[]) {
  const blob = new Blob([JSON.stringify(transactions, null, 2)], { type: 'application/json' })
  triggerDownload(blob, `nichetrack-export-${Date.now()}.json`)
}

export function exportTransactionsAsCsv(transactions: Transaction[], categories: Category[]) {
  const categoryLookup = new Map(categories.map((c) => [c.id, c.name]))
  const header = ['Datum', 'Typ', 'Kategorie', 'Betrag (EUR)', 'Notiz']
  const rows = transactions.map((t) => [
    t.date,
    t.type === 'income' ? 'Einnahme' : 'Ausgabe',
    categoryLookup.get(t.categoryId) ?? '',
    centsToEuros(t.amountCents).toFixed(2),
    (t.note ?? '').replace(/"/g, '""'),
  ])

  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(';'))
    .join('\n')

  const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' })
  triggerDownload(blob, `nichetrack-export-${Date.now()}.csv`)
}
