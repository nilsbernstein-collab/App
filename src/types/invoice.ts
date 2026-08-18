export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue'

export interface InvoiceLineItem {
  id: string
  description: string
  quantity: number
  unitPriceCents: number
}

export interface Invoice {
  id: string
  invoiceNumber: string
  clientName: string
  projectId?: string
  issueDate: string
  dueDate: string
  lineItems: InvoiceLineItem[]
  status: InvoiceStatus
  notes?: string
  /** Set once the invoice is marked paid and an income transaction has been created for it. */
  paidTransactionId?: string
  createdAt: string
  updatedAt: string
}

export type NewInvoice = Omit<
  Invoice,
  'id' | 'status' | 'paidTransactionId' | 'createdAt' | 'updatedAt' | 'invoiceNumber'
>

export function invoiceTotalCents(invoice: Pick<Invoice, 'lineItems'>): number {
  return invoice.lineItems.reduce((sum, item) => sum + item.quantity * item.unitPriceCents, 0)
}

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: 'Entwurf',
  sent: 'Versendet',
  paid: 'Bezahlt',
  overdue: 'Überfällig',
}
