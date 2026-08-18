import { useState } from 'react'
import toast from 'react-hot-toast'
import {
  useDeleteInvoice,
  useInvoices,
  useSetInvoiceStatus,
} from '@/hooks/useInvoices'
import { InvoiceFormModal } from '@/components/invoices/InvoiceFormModal'
import { InvoiceStatusBadge } from '@/components/invoices/InvoiceStatusBadge'
import { Skeleton } from '@/components/common/Skeleton'
import { formatMoney } from '@/lib/money'
import { formatDisplayDate } from '@/lib/date'
import { invoiceTotalCents, type Invoice } from '@/types/invoice'
import { PlusIcon, DownloadIcon, TrashIcon } from '@/components/common/Icons'

export function InvoicesPage() {
  const { data: invoices, isLoading } = useInvoices()
  const deleteInvoice = useDeleteInvoice()
  const setStatus = useSetInvoiceStatus()

  const [isFormOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Invoice | null>(null)

  const openNew = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (invoice: Invoice) => {
    setEditing(invoice)
    setFormOpen(true)
  }

  const handleDownload = async (invoice: Invoice) => {
    const { generateInvoicePdf } = await import('@/lib/invoicePdf')
    generateInvoicePdf(invoice)
  }

  const handleMarkPaid = (invoice: Invoice) => {
    setStatus.mutate({ invoice, status: 'paid' })
  }

  const totalOutstanding = (invoices ?? [])
    .filter((i) => i.status === 'sent')
    .reduce((sum, i) => sum + invoiceTotalCents(i), 0)

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Offene Forderungen</h2>
          <p className="text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">
            {formatMoney(totalOutstanding)}
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-white hover:bg-brand-600"
        >
          <PlusIcon className="h-4 w-4" />
          Neue Rechnung
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-3">
        {isLoading ? (
          <div className="space-y-2 p-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : !invoices || invoices.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">Noch keine Rechnungen erstellt.</p>
            <button
              onClick={openNew}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
            >
              Erste Rechnung erstellen
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex flex-wrap items-center justify-between gap-3 px-3 py-3"
              >
                <div
                  className="min-w-0 flex-1 cursor-pointer"
                  onClick={() => invoice.status === 'draft' && openEdit(invoice)}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-800 dark:text-slate-100">{invoice.clientName}</span>
                    <InvoiceStatusBadge invoice={invoice} />
                  </div>
                  <p className="text-xs text-slate-400">
                    {invoice.invoiceNumber} · Fällig am {formatDisplayDate(invoice.dueDate)}
                  </p>
                </div>

                <span className="font-semibold tabular-nums text-slate-800 dark:text-slate-100">
                  {formatMoney(invoiceTotalCents(invoice))}
                </span>

                <div className="flex shrink-0 items-center gap-1.5">
                  {invoice.status === 'draft' && (
                    <button
                      onClick={() => {
                        setStatus.mutate({ invoice, status: 'sent' })
                        toast.success('Als versendet markiert')
                      }}
                      className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      Versendet
                    </button>
                  )}
                  {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                    <button
                      onClick={() => handleMarkPaid(invoice)}
                      className="rounded-lg border border-emerald-300 px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950"
                    >
                      Als bezahlt markieren
                    </button>
                  )}
                  <button
                    onClick={() => handleDownload(invoice)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    aria-label="PDF herunterladen"
                  >
                    <DownloadIcon className="h-4 w-4" />
                  </button>
                  {invoice.status === 'draft' && (
                    <button
                      onClick={() => deleteInvoice.mutate(invoice.id)}
                      className="rounded-lg p-1.5 text-slate-300 hover:bg-rose-50 hover:text-rose-500 dark:text-slate-600 dark:hover:bg-rose-950"
                      aria-label="Rechnung löschen"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <InvoiceFormModal isOpen={isFormOpen} onClose={() => setFormOpen(false)} editing={editing} />
    </div>
  )
}
