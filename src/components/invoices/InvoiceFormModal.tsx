import { useEffect, useState } from 'react'
import { Modal } from '@/components/common/Modal'
import { useCreateInvoice, useUpdateInvoice } from '@/hooks/useInvoices'
import { useProjects } from '@/hooks/useProjects'
import { eurosToCents, centsToEuros } from '@/lib/money'
import { toIsoDate } from '@/lib/date'
import { addDays } from 'date-fns'
import { PlusIcon, TrashIcon } from '@/components/common/Icons'
import type { Invoice, InvoiceLineItem } from '@/types/invoice'
import toast from 'react-hot-toast'

interface DraftLineItem {
  id: string
  description: string
  quantity: string
  unitPrice: string
}

function toDraftLineItems(items: InvoiceLineItem[]): DraftLineItem[] {
  return items.map((i) => ({
    id: i.id,
    description: i.description,
    quantity: String(i.quantity),
    unitPrice: String(centsToEuros(i.unitPriceCents)),
  }))
}

function emptyLineItem(): DraftLineItem {
  return { id: crypto.randomUUID(), description: '', quantity: '1', unitPrice: '' }
}

export function InvoiceFormModal({
  isOpen,
  onClose,
  editing,
}: {
  isOpen: boolean
  onClose: () => void
  editing: Invoice | null
}) {
  const { data: projects = [] } = useProjects()
  const createInvoice = useCreateInvoice()
  const updateInvoice = useUpdateInvoice()

  const [clientName, setClientName] = useState('')
  const [projectId, setProjectId] = useState('')
  const [issueDate, setIssueDate] = useState(toIsoDate(new Date()))
  const [dueDate, setDueDate] = useState(toIsoDate(addDays(new Date(), 14)))
  const [notes, setNotes] = useState('')
  const [lineItems, setLineItems] = useState<DraftLineItem[]>([emptyLineItem()])

  useEffect(() => {
    if (!isOpen) return
    if (editing) {
      setClientName(editing.clientName)
      setProjectId(editing.projectId ?? '')
      setIssueDate(editing.issueDate)
      setDueDate(editing.dueDate)
      setNotes(editing.notes ?? '')
      setLineItems(toDraftLineItems(editing.lineItems))
    } else {
      setClientName('')
      setProjectId('')
      setIssueDate(toIsoDate(new Date()))
      setDueDate(toIsoDate(addDays(new Date(), 14)))
      setNotes('')
      setLineItems([emptyLineItem()])
    }
  }, [isOpen, editing])

  const totalCents = lineItems.reduce((sum, item) => {
    const qty = Number(item.quantity.replace(',', '.')) || 0
    const price = eurosToCents(Number(item.unitPrice.replace(',', '.')) || 0)
    return sum + qty * price
  }, 0)

  const updateLineItem = (id: string, patch: Partial<DraftLineItem>) => {
    setLineItems((items) => items.map((i) => (i.id === id ? { ...i, ...patch } : i)))
  }

  const removeLineItem = (id: string) => {
    setLineItems((items) => (items.length > 1 ? items.filter((i) => i.id !== id) : items))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!clientName.trim()) {
      toast.error('Bitte einen Rechnungsempfänger angeben.')
      return
    }

    const validItems = lineItems
      .filter((i) => i.description.trim())
      .map((i) => ({
        id: i.id,
        description: i.description.trim(),
        quantity: Number(i.quantity.replace(',', '.')) || 0,
        unitPriceCents: eurosToCents(Number(i.unitPrice.replace(',', '.')) || 0),
      }))

    if (validItems.length === 0) {
      toast.error('Bitte mindestens eine Position angeben.')
      return
    }

    const payload = {
      clientName: clientName.trim(),
      projectId: projectId || undefined,
      issueDate,
      dueDate,
      lineItems: validItems,
      notes: notes.trim() || undefined,
    }

    if (editing) {
      updateInvoice.mutate({ id: editing.id, patch: payload })
    } else {
      createInvoice.mutate(payload)
    }
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editing ? 'Rechnung bearbeiten' : 'Neue Rechnung'} maxWidthClassName="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Rechnungsempfänger</label>
            <input
              autoFocus
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Kundenname"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-brand-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
          {projects.length > 0 && (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Projekt (optional)</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-brand-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="">Kein Projekt</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Rechnungsdatum</label>
            <input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-brand-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Fällig am</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-brand-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Positionen</label>
          <div className="space-y-2">
            {lineItems.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <input
                  value={item.description}
                  onChange={(e) => updateLineItem(item.id, { description: e.target.value })}
                  placeholder="Beschreibung"
                  className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm outline-none ring-brand-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
                <input
                  value={item.quantity}
                  onChange={(e) => updateLineItem(item.id, { quantity: e.target.value })}
                  inputMode="decimal"
                  placeholder="Menge"
                  className="w-16 shrink-0 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm outline-none ring-brand-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
                <input
                  value={item.unitPrice}
                  onChange={(e) => updateLineItem(item.id, { unitPrice: e.target.value })}
                  inputMode="decimal"
                  placeholder="Preis (€)"
                  className="w-24 shrink-0 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm outline-none ring-brand-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
                <button
                  type="button"
                  onClick={() => removeLineItem(item.id)}
                  className="shrink-0 rounded-lg p-1.5 text-slate-300 hover:bg-rose-50 hover:text-rose-500 dark:text-slate-600 dark:hover:bg-rose-950"
                  aria-label="Position entfernen"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setLineItems((items) => [...items, emptyLineItem()])}
            className="mt-2 flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            <PlusIcon className="h-3.5 w-3.5" />
            Position hinzufügen
          </button>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Notiz (optional)</label>
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="z.B. Zahlungsbedingungen"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-brand-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Gesamt: <span className="font-semibold text-slate-800 dark:text-slate-100">{(totalCents / 100).toFixed(2)} €</span>
          </span>
          <button
            type="submit"
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-600"
          >
            {editing ? 'Speichern' : 'Rechnung erstellen'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
