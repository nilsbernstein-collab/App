import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { EuerSummary } from './euer'
import { EUER_REPORT_TITLE } from './euer'
import { formatMoney } from './money'

/** Lazily imported (dynamic import) so jsPDF never loads for users who don't export. */
export function generateEuerPdf(summary: EuerSummary) {
  const doc = new jsPDF()

  doc.setFontSize(15)
  doc.text(EUER_REPORT_TITLE[summary.country], 14, 18)
  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text(`Zeitraum: 01.01.${summary.year} – 31.12.${summary.year}`, 14, 25)
  doc.setTextColor(30)

  autoTable(doc, {
    startY: 34,
    head: [['Betriebseinnahmen', 'Betrag']],
    body: summary.incomeLines.map((l) => [l.categoryName, formatMoney(l.totalCents)]),
    foot: [['Summe Einnahmen', formatMoney(summary.incomeTotalCents)]],
    styles: { fontSize: 9 },
    headStyles: { fillColor: [16, 185, 129] },
    footStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' },
  })

  const afterIncomeY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY

  autoTable(doc, {
    startY: afterIncomeY + 10,
    head: [['Betriebsausgaben', 'Betrag', 'Abzugsfähig', 'Abzugsfähiger Betrag']],
    body: summary.expenseLines.map((l) => [
      l.categoryName,
      formatMoney(l.totalCents),
      `${l.deductiblePercent}%`,
      formatMoney(l.deductibleCents),
    ]),
    foot: [['Summe abzugsfähige Ausgaben', '', '', formatMoney(summary.deductibleExpenseTotalCents)]],
    styles: { fontSize: 9 },
    headStyles: { fillColor: [244, 63, 94] },
    footStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' },
  })

  const afterExpenseY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(`Gewinn/Verlust ${summary.year}: ${formatMoney(summary.profitCents)}`, 14, afterExpenseY + 14)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(140)
  doc.text(
    'Diese Übersicht dient der Vorbereitung und ersetzt keine Steuerberatung oder die offizielle Anlage EÜR.',
    14,
    afterExpenseY + 22,
  )

  doc.save(`euer-vorbereitung-${summary.year}.pdf`)
}
