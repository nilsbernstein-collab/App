import { db } from '@/data/db'
import type { Invoice, InvoiceStatus, NewInvoice } from '@/types/invoice'

async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const count = await db.invoices.filter((i) => i.invoiceNumber.startsWith(`RE-${year}-`)).count()
  return `RE-${year}-${String(count + 1).padStart(3, '0')}`
}

export const invoiceRepository = {
  async list(): Promise<Invoice[]> {
    return db.invoices.orderBy('createdAt').reverse().toArray()
  },

  async get(id: string): Promise<Invoice | undefined> {
    return db.invoices.get(id)
  },

  async create(input: NewInvoice): Promise<Invoice> {
    const now = new Date().toISOString()
    const invoice: Invoice = {
      ...input,
      id: crypto.randomUUID(),
      invoiceNumber: await generateInvoiceNumber(),
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    }
    await db.invoices.add(invoice)
    return invoice
  },

  async update(id: string, patch: Partial<NewInvoice>): Promise<void> {
    await db.invoices.update(id, { ...patch, updatedAt: new Date().toISOString() })
  },

  async setStatus(id: string, status: InvoiceStatus, paidTransactionId?: string): Promise<void> {
    await db.invoices.update(id, { status, paidTransactionId, updatedAt: new Date().toISOString() })
  },

  async remove(id: string): Promise<void> {
    await db.invoices.delete(id)
  },
}
