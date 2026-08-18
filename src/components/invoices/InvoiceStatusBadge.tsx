import { INVOICE_STATUS_LABELS, type Invoice } from '@/types/invoice'

function effectiveStatus(invoice: Invoice): Invoice['status'] {
  if (invoice.status === 'sent' && invoice.dueDate < new Date().toISOString().slice(0, 10)) {
    return 'overdue'
  }
  return invoice.status
}

const STATUS_CLASSES: Record<Invoice['status'], string> = {
  draft: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  sent: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
  paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
  overdue: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400',
}

export function InvoiceStatusBadge({ invoice }: { invoice: Invoice }) {
  const status = effectiveStatus(invoice)
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_CLASSES[status]}`}>
      {INVOICE_STATUS_LABELS[status]}
    </span>
  )
}
