import { useState } from 'react'
import {
  useCreateRecurringRule,
  useDeleteRecurringRule,
  useRecurringRules,
  useUpdateRecurringRule,
} from '@/hooks/useRecurringRules'
import { useCategories } from '@/hooks/useCategories'
import { useCategoryLookup } from '@/hooks/useCategoryLookup'
import { formatMoney } from '@/lib/money'
import { toIsoDate } from '@/lib/date'
import { FREQUENCY_LABELS, type RecurrenceFrequency } from '@/types/recurringRule'
import type { TransactionType } from '@/types/transaction'
import { PlusIcon, TrashIcon } from '@/components/common/Icons'

export function RecurringRulesManager() {
  const { data: rules = [] } = useRecurringRules()
  const { data: categories = [] } = useCategories()
  const categoryLookup = useCategoryLookup()
  const createRule = useCreateRecurringRule()
  const updateRule = useUpdateRecurringRule()
  const deleteRule = useDeleteRecurringRule()

  const [isFormOpen, setFormOpen] = useState(false)
  const [type, setType] = useState<TransactionType>('expense')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [frequency, setFrequency] = useState<RecurrenceFrequency>('monthly')
  const [note, setNote] = useState('')

  const categoriesForType = categories.filter((c) => c.type === type)

  const resetForm = () => {
    setAmount('')
    setNote('')
    setCategoryId('')
    setFormOpen(false)
  }

  const handleCreate = () => {
    const parsedAmount = Number(amount.replace(',', '.'))
    const resolvedCategoryId = categoryId || categoriesForType[0]?.id
    if (!parsedAmount || parsedAmount <= 0 || !resolvedCategoryId) return

    createRule.mutate({
      type,
      amountCents: Math.round(parsedAmount * 100),
      categoryId: resolvedCategoryId,
      frequency,
      interval: 1,
      startDate: toIsoDate(new Date()),
      note: note.trim() || undefined,
    })
    resetForm()
  }

  return (
    <div>
      <p className="mb-3 text-xs text-slate-400 dark:text-slate-500">
        Regelmäßige Einnahmen und Ausgaben (Abos, Miete, Kunden-Retainer) werden automatisch als
        Transaktion angelegt, sobald sie fällig sind.
      </p>

      {rules.length > 0 && (
        <ul className="mb-3 space-y-2">
          {rules.map((rule) => (
            <li
              key={rule.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                    {categoryLookup.get(rule.categoryId)?.name ?? 'Unkategorisiert'}
                  </span>
                  <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    {FREQUENCY_LABELS[rule.frequency]}
                  </span>
                </div>
                {rule.note && <p className="truncate text-xs text-slate-400">{rule.note}</p>}
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span
                  className={`text-sm font-semibold tabular-nums ${
                    rule.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {rule.type === 'income' ? '+' : '-'}
                  {formatMoney(rule.amountCents)}
                </span>
                <button
                  onClick={() => updateRule.mutate({ id: rule.id, patch: { active: !rule.active } })}
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    rule.active
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {rule.active ? 'Aktiv' : 'Pausiert'}
                </button>
                <button
                  onClick={() => deleteRule.mutate(rule.id)}
                  className="rounded-lg p-1.5 text-slate-300 hover:bg-rose-50 hover:text-rose-500 dark:text-slate-600 dark:hover:bg-rose-950"
                  aria-label="Regel löschen"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {isFormOpen ? (
        <div className="space-y-3 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
          <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
            {(['expense', 'income'] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setType(t)
                  setCategoryId('')
                }}
                className={`rounded-md py-1.5 text-xs font-medium transition ${
                  type === t
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-100'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {t === 'income' ? 'Einnahme' : 'Ausgabe'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="decimal"
              placeholder="Betrag (€)"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-brand-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as RecurrenceFrequency)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-brand-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              {Object.entries(FREQUENCY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-brand-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            <option value="">Kategorie wählen…</option>
            {categoriesForType.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Notiz (optional), z.B. 'Adobe Creative Cloud'"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-brand-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />

          <div className="flex justify-end gap-2">
            <button
              onClick={resetForm}
              className="rounded-lg px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Abbrechen
            </button>
            <button
              onClick={handleCreate}
              className="rounded-lg bg-brand-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-600"
            >
              Anlegen
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setFormOpen(true)}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <PlusIcon className="h-4 w-4" />
          Wiederkehrende Buchung hinzufügen
        </button>
      )}
    </div>
  )
}
