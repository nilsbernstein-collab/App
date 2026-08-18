import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Transaction } from '@/types/transaction'
import type { Category } from '@/types/category'
import { formatDisplayDate } from './date'
import { formatMoney } from './money'

/** Kept in its own module (dynamically imported) so jsPDF's ~200 kB isn't in the main bundle for users who never export. */
export function exportTransactionsAsPdf(transactions: Transaction[], categories: Category[]) {
  const categoryLookup = new Map(categories.map((c) => [c.id, c.name]))
  const doc = new jsPDF()

  doc.setFontSize(16)
  doc.text('NicheTrack — Finanzreport', 14, 18)
  doc.setFontSize(10)
  doc.setTextColor(120)
  doc.text(`Erstellt am ${formatDisplayDate(new Date().toISOString().slice(0, 10))}`, 14, 24)

  const totalIncome = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amountCents, 0)
  const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amountCents, 0)

  doc.setTextColor(30)
  doc.setFontSize(11)
  doc.text(`Einnahmen gesamt: ${formatMoney(totalIncome)}`, 14, 34)
  doc.text(`Ausgaben gesamt: ${formatMoney(totalExpense)}`, 14, 40)
  doc.text(`Saldo: ${formatMoney(totalIncome - totalExpense)}`, 14, 46)

  autoTable(doc, {
    startY: 54,
    head: [['Datum', 'Typ', 'Kategorie', 'Betrag', 'Notiz']],
    body: transactions.map((t) => [
      formatDisplayDate(t.date),
      t.type === 'income' ? 'Einnahme' : 'Ausgabe',
      categoryLookup.get(t.categoryId) ?? '',
      formatMoney(t.amountCents),
      t.note ?? '',
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [20, 125, 245] },
  })

  doc.save(`nichetrack-report-${Date.now()}.pdf`)
}
