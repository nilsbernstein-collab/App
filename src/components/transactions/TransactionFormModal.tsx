import { useEffect, useState } from 'react'
import { Modal } from '@/components/common/Modal'
import { useUiStore } from '@/store/uiStore'
import { useCategories } from '@/hooks/useCategories'
import { useIncomeSources } from '@/hooks/useIncomeSources'
import { useCreateTransaction, useDeleteTransaction, useUpdateTransaction } from '@/hooks/useTransactions'
import { eurosToCents, centsToEuros } from '@/lib/money'
import { toIsoDate } from '@/lib/date'
import { suggestCategory } from '@/lib/categorize'
import { useIsPro } from '@/hooks/useSubscription'
import { TrashIcon, SparkleIcon } from '@/components/common/Icons'
import type { TransactionType } from '@/types/transaction'
import toast from 'react-hot-toast'

export function TransactionFormModal() {
  const isOpen = useUiStore((s) => s.isTransactionFormOpen)
  const closeForm = useUiStore((s) => s.closeTransactionForm)
  const type = useUiStore((s) => s.transactionFormType)
  const setType = (t: TransactionType) => useUiStore.setState({ transactionFormType: t })
  const editing = useUiStore((s) => s.editingTransaction)

  const { data: categories = [] } = useCategories()
  const { data: sources = [] } = useIncomeSources()
  const createTransaction = useCreateTransaction()
  const updateTransaction = useUpdateTransaction()
  const deleteTransaction = useDeleteTransaction()
  const isPro = useIsPro()

  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(toIsoDate(new Date()))
  const [categoryId, setCategoryId] = useState('')
  const [sourceId, setSourceId] = useState('')
  const [note, setNote] = useState('')
  const [amountError, setAmountError] = useState<string | null>(null)
  const [autoSuggestedCategoryId, setAutoSuggestedCategoryId] = useState<string | null>(null)

  const categoriesForType = categories.filter((c) => c.type === type)

  useEffect(() => {
    if (!isOpen) return
    if (editing) {
      setAmount(String(centsToEuros(editing.amountCents)))
      setDate(editing.date)
      setCategoryId(editing.categoryId)
      setSourceId(editing.sourceId ?? '')
      setNote(editing.note ?? '')
    } else {
      setAmount('')
      setDate(toIsoDate(new Date()))
      setNote('')
      setSourceId(sources[0]?.id ?? '')
    }
    setAmountError(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, editing])

  useEffect(() => {
    if (!isOpen || editing) return
    const firstOfType = categories.find((c) => c.type === type)
    setCategoryId(firstOfType?.id ?? '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, isOpen, categories])

  useEffect(() => {
    if (!isOpen || editing || !isPro) return
    const suggestion = suggestCategory(note, categoriesForType)
    if (suggestion && suggestion.id !== categoryId) {
      setCategoryId(suggestion.id)
      setAutoSuggestedCategoryId(suggestion.id)
    } else if (!suggestion) {
      setAutoSuggestedCategoryId(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note, isPro, isOpen, editing])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const parsedAmount = Number(amount.replace(',', '.'))
    if (!amount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setAmountError('Bitte einen gültigen Betrag größer 0 eingeben.')
      return
    }
    if (!categoryId) {
      toast.error('Bitte eine Kategorie wählen.')
      return
    }

    const payload = {
      type,
      amountCents: eurosToCents(parsedAmount),
      date,
      categoryId,
      sourceId: type === 'income' ? sourceId || undefined : undefined,
      note: note.trim() || undefined,
    }

    if (editing) {
      updateTransaction.mutate({ id: editing.id, patch: payload })
    } else {
      createTransaction.mutate(payload)
    }
    closeForm()
  }

  const handleDelete = () => {
    if (!editing) return
    deleteTransaction.mutate(editing.id)
    closeForm()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeForm}
      title={editing ? 'Transaktion bearbeiten' : 'Neue Transaktion'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
          {(['income', 'expense'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`rounded-md py-2 text-sm font-medium transition ${
                type === t
                  ? t === 'income'
                    ? 'bg-white text-emerald-600 shadow-sm dark:bg-slate-700 dark:text-emerald-400'
                    : 'bg-white text-rose-600 shadow-sm dark:bg-slate-700 dark:text-rose-400'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {t === 'income' ? 'Einnahme' : 'Ausgabe'}
            </button>
          ))}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Betrag (€)</label>
          <input
            autoFocus
            inputMode="decimal"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value)
              setAmountError(null)
            }}
            placeholder="0,00"
            className={`w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none ring-brand-500 focus:ring-2 dark:bg-slate-900 dark:text-slate-100 ${
              amountError ? 'border-rose-400' : 'border-slate-300 dark:border-slate-700'
            }`}
          />
          {amountError && <p className="mt-1 text-xs text-rose-500">{amountError}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Datum</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-brand-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Kategorie</label>
            <select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value)
                setAutoSuggestedCategoryId(null)
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-brand-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              {categoriesForType.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {autoSuggestedCategoryId === categoryId && (
              <p className="mt-1 flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400">
                <SparkleIcon className="h-3.5 w-3.5" />
                Automatisch erkannt
              </p>
            )}
          </div>
        </div>

        {type === 'income' && sources.length > 1 && (
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Einkommensquelle</label>
            <select
              value={sourceId}
              onChange={(e) => setSourceId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-brand-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              {sources.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Notiz (optional)</label>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="z.B. Shopify Auszahlung Juli"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-brand-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          {editing ? (
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950"
            >
              <TrashIcon className="h-4 w-4" />
              Löschen
            </button>
          ) : (
            <span />
          )}
          <button
            type="submit"
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-600"
          >
            {editing ? 'Speichern' : 'Hinzufügen'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
