import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Invoice } from '@/types/invoice'
import { invoiceTotalCents } from '@/types/invoice'
import { formatDisplayDate } from './date'
import { formatMoney } from './money'

/** Lazily imported (dynamic import) so jsPDF never loads for users who don't export a PDF. */
export function generateInvoicePdf(invoice: Invoice) {
  const doc = new jsPDF()

  doc.setFontSize(18)
  doc.text('Rechnung', 14, 20)
  doc.setFontSize(11)
  doc.setTextColor(100)
  doc.text(invoice.invoiceNumber, 14, 27)

  doc.setTextColor(30)
  doc.setFontSize(10)
  doc.text(`Rechnungsempfänger: ${invoice.clientName}`, 14, 40)
  doc.text(`Rechnungsdatum: ${formatDisplayDate(invoice.issueDate)}`, 14, 46)
  doc.text(`Fällig am: ${formatDisplayDate(invoice.dueDate)}`, 14, 52)

  autoTable(doc, {
    startY: 62,
    head: [['Beschreibung', 'Menge', 'Einzelpreis', 'Summe']],
    body: invoice.lineItems.map((item) => [
      item.description,
      String(item.quantity),
      formatMoney(item.unitPriceCents),
      formatMoney(item.quantity * item.unitPriceCents),
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [20, 125, 245] },
    foot: [['', '', 'Gesamt', formatMoney(invoiceTotalCents(invoice))]],
    footStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' },
  })

  if (invoice.notes) {
    const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY
    doc.setFontSize(9)
    doc.setTextColor(100)
    doc.text(invoice.notes, 14, finalY + 12)
  }

  doc.save(`${invoice.invoiceNumber}.pdf`)
}
