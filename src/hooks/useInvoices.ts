import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { invoiceRepository, transactionRepository } from '@/data/repositories'
import { db } from '@/data/db'
import { transactionsKey } from './useTransactions'
import { invoiceTotalCents, type Invoice, type InvoiceStatus, type NewInvoice } from '@/types/invoice'
import { toIsoDate } from '@/lib/date'

export const invoicesKey = ['invoices'] as const

export function useInvoices() {
  return useQuery({
    queryKey: invoicesKey,
    queryFn: invoiceRepository.list,
  })
}

export function useCreateInvoice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: NewInvoice) => invoiceRepository.create(input),
    onError: () => toast.error('Rechnung konnte nicht erstellt werden.'),
    onSuccess: () => {
      toast.success('Rechnung erstellt')
      queryClient.invalidateQueries({ queryKey: invoicesKey })
    },
  })
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<NewInvoice> }) => invoiceRepository.update(id, patch),
    onError: () => toast.error('Änderung konnte nicht gespeichert werden.'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoicesKey })
    },
  })
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => invoiceRepository.remove(id),
    onSuccess: () => {
      toast.success('Rechnung gelöscht')
      queryClient.invalidateQueries({ queryKey: invoicesKey })
    },
  })
}

/** Category used for the auto-created income transaction when an invoice is marked paid. */
const FALLBACK_INCOME_CATEGORY_NAME = 'Umsatz'

export function useSetInvoiceStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ invoice, status }: { invoice: Invoice; status: InvoiceStatus }) => {
      if (status === 'paid' && !invoice.paidTransactionId) {
        const categories = await db.categories.toArray()
        const incomeCategory =
          categories.find((c) => c.type === 'income' && c.name === FALLBACK_INCOME_CATEGORY_NAME) ??
          categories.find((c) => c.type === 'income')

        if (incomeCategory) {
          const transaction = await transactionRepository.create({
            type: 'income',
            amountCents: invoiceTotalCents(invoice),
            date: toIsoDate(new Date()),
            categoryId: incomeCategory.id,
            projectId: invoice.projectId,
            invoiceId: invoice.id,
            note: `Rechnung ${invoice.invoiceNumber} — ${invoice.clientName}`,
          })
          await invoiceRepository.setStatus(invoice.id, status, transaction.id)
          return
        }
      }
      await invoiceRepository.setStatus(invoice.id, status)
    },
    onSuccess: (_data, variables) => {
      if (variables.status === 'paid') toast.success('Als bezahlt markiert — Einnahme wurde erfasst')
      queryClient.invalidateQueries({ queryKey: invoicesKey })
      queryClient.invalidateQueries({ queryKey: transactionsKey })
    },
    onError: () => toast.error('Status konnte nicht geändert werden.'),
  })
}
