import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Modal } from '@/components/common/Modal'
import { useCategories } from '@/hooks/useCategories'
import { useBulkCreateTransactions, useTransactions } from '@/hooks/useTransactions'
import { useProjects } from '@/hooks/useProjects'
import {
  buildImportCandidates,
  guessColumnMapping,
  parseCsvFile,
  type ColumnMapping,
  type ImportCandidate,
  type ParsedCsv,
} from '@/lib/csvImport'
import { suggestCategory } from '@/lib/categorize'
import { formatSignedMoney } from '@/lib/money'
import { UploadIcon, LoaderIcon } from '@/components/common/Icons'
import type { NewTransaction } from '@/types/transaction'

type Step = 'upload' | 'mapping' | 'review'

const COLUMN_MODE = { SINGLE: 'single', SPLIT: 'split' } as const

export function ImportModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { data: categories = [] } = useCategories()
  const { data: existingTransactions = [] } = useTransactions()
  const { data: projects = [] } = useProjects()
  const bulkCreate = useBulkCreateTransactions()

  const [step, setStep] = useState<Step>('upload')
  const [isParsing, setIsParsing] = useState(false)
  const [csv, setCsv] = useState<ParsedCsv | null>(null)
  const [columnMode, setColumnMode] = useState<'single' | 'split'>(COLUMN_MODE.SINGLE)
  const [dateColumn, setDateColumn] = useState<number>(-1)
  const [descriptionColumn, setDescriptionColumn] = useState<number>(-1)
  const [amountColumn, setAmountColumn] = useState<number>(-1)
  const [debitColumn, setDebitColumn] = useState<number>(-1)
  const [creditColumn, setCreditColumn] = useState<number>(-1)
  const [incomeCategoryId, setIncomeCategoryId] = useState('')
  const [expenseCategoryId, setExpenseCategoryId] = useState('')
  const [projectId, setProjectId] = useState('')
  const [candidates, setCandidates] = useState<ImportCandidate[]>([])

  const incomeCategories = categories.filter((c) => c.type === 'income')
  const expenseCategories = categories.filter((c) => c.type === 'expense')

  const reset = () => {
    setStep('upload')
    setCsv(null)
    setCandidates([])
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    setIsParsing(true)
    try {
      const parsed = await parseCsvFile(file)
      const guess = guessColumnMapping(parsed.headers)
      setCsv(parsed)
      setDateColumn(guess.dateColumn ?? 0)
      setDescriptionColumn(guess.descriptionColumn ?? 0)
      if (guess.debitColumn !== undefined || guess.creditColumn !== undefined) {
        setColumnMode(COLUMN_MODE.SPLIT)
        setDebitColumn(guess.debitColumn ?? -1)
        setCreditColumn(guess.creditColumn ?? -1)
      } else {
        setColumnMode(COLUMN_MODE.SINGLE)
        setAmountColumn(guess.amountColumn ?? -1)
      }
      setIncomeCategoryId(incomeCategories[0]?.id ?? '')
      setExpenseCategoryId(expenseCategories[0]?.id ?? '')
      setStep('mapping')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'CSV konnte nicht gelesen werden.')
    } finally {
      setIsParsing(false)
    }
  }

  const mappingIsValid =
    dateColumn >= 0 &&
    descriptionColumn >= 0 &&
    (columnMode === COLUMN_MODE.SINGLE ? amountColumn >= 0 : debitColumn >= 0 || creditColumn >= 0)

  const handleBuildPreview = () => {
    if (!csv) return
    const mapping: ColumnMapping =
      columnMode === COLUMN_MODE.SINGLE
        ? { dateColumn, descriptionColumn, amountColumn }
        : {
            dateColumn,
            descriptionColumn,
            debitColumn: debitColumn >= 0 ? debitColumn : undefined,
            creditColumn: creditColumn >= 0 ? creditColumn : undefined,
          }

    const built = buildImportCandidates(csv.rows, mapping, existingTransactions)
    setCandidates(built)
    setStep('review')
  }

  const importableCandidates = useMemo(
    () => candidates.filter((c) => c.include && c.date && c.amountCents !== undefined && c.amountCents > 0),
    [candidates],
  )

  const toggleCandidate = (rowIndex: number) => {
    setCandidates((items) => items.map((c) => (c.rowIndex === rowIndex ? { ...c, include: !c.include } : c)))
  }

  const handleImport = () => {
    const inputs: NewTransaction[] = importableCandidates.map((c) => {
      const autoCategory = suggestCategory(c.description, categories.filter((cat) => cat.type === c.type))
      const categoryId = autoCategory?.id ?? (c.type === 'income' ? incomeCategoryId : expenseCategoryId)
      return {
        type: c.type,
        amountCents: c.amountCents!,
        date: c.date!,
        categoryId,
        projectId: projectId || undefined,
        note: c.description || undefined,
      }
    })

    if (inputs.length === 0) {
      toast.error('Keine Zeilen zum Importieren ausgewählt.')
      return
    }
    if ((incomeCategories.length === 0 && inputs.some((i) => i.type === 'income' && !i.categoryId)) ||
        (expenseCategories.length === 0 && inputs.some((i) => i.type === 'expense' && !i.categoryId))) {
      toast.error('Bitte zuerst passende Kategorien anlegen.')
      return
    }

    bulkCreate.mutate(inputs)
    handleClose()
  }

  const duplicateCount = candidates.filter((c) => c.isDuplicate).length

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="CSV importieren" maxWidthClassName="max-w-2xl">
      {step === 'upload' && (
        <div>
          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
            Lade einen Kontoauszug, Shopify-Bestell-Export oder PayPal-Export als CSV-Datei hoch. Die Spalten
            werden im nächsten Schritt zugeordnet.
          </p>
          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 py-10 text-slate-400 transition hover:border-brand-400 hover:text-brand-500 dark:border-slate-700 dark:hover:border-brand-600">
            {isParsing ? (
              <LoaderIcon className="h-6 w-6 animate-spin" />
            ) : (
              <UploadIcon className="h-6 w-6" />
            )}
            <span className="text-sm font-medium">{isParsing ? 'Wird gelesen…' : 'CSV-Datei auswählen'}</span>
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
              disabled={isParsing}
            />
          </label>
        </div>
      )}

      {step === 'mapping' && csv && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
            {(['single', 'split'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setColumnMode(mode)}
                className={`rounded-md py-1.5 text-xs font-medium transition ${
                  columnMode === mode
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-100'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {mode === 'single' ? 'Ein Betrags-Spalte (+/-)' : 'Getrennte Soll/Haben-Spalten'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <ColumnSelect label="Datum" headers={csv.headers} value={dateColumn} onChange={setDateColumn} />
            <ColumnSelect label="Beschreibung" headers={csv.headers} value={descriptionColumn} onChange={setDescriptionColumn} />
            {columnMode === 'single' ? (
              <ColumnSelect label="Betrag" headers={csv.headers} value={amountColumn} onChange={setAmountColumn} />
            ) : (
              <>
                <ColumnSelect label="Ausgang (Soll)" headers={csv.headers} value={debitColumn} onChange={setDebitColumn} />
                <ColumnSelect label="Eingang (Haben)" headers={csv.headers} value={creditColumn} onChange={setCreditColumn} />
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Standard-Kategorie (Einnahmen)
              </label>
              <select
                value={incomeCategoryId}
                onChange={(e) => setIncomeCategoryId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-brand-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                {incomeCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Standard-Kategorie (Ausgaben)
              </label>
              <select
                value={expenseCategoryId}
                onChange={(e) => setExpenseCategoryId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-brand-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                {expenseCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {projects.length > 0 && (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Projekt/Kunde zuordnen (optional)
              </label>
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

          <p className="text-xs text-slate-400">
            Zeilen, deren Beschreibung eine Auto-Kategorisierungs-Regel trifft (Einstellungen → Kategorien),
            werden automatisch der passenden Kategorie zugeordnet — sonst gilt die Standard-Kategorie oben.
          </p>

          <div className="flex justify-between pt-2">
            <button
              onClick={() => setStep('upload')}
              className="rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Zurück
            </button>
            <button
              onClick={handleBuildPreview}
              disabled={!mappingIsValid}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
            >
              Vorschau anzeigen
            </button>
          </div>
        </div>
      )}

      {step === 'review' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-300">
              {candidates.length} Zeilen gefunden
              {duplicateCount > 0 && `, ${duplicateCount} vermutlich bereits vorhanden (abgewählt)`}
            </span>
            <span className="font-medium text-brand-600 dark:text-brand-400">
              {importableCandidates.length} werden importiert
            </span>
          </div>

          <div className="max-h-80 space-y-1 overflow-y-auto rounded-lg border border-slate-200 p-2 dark:border-slate-800">
            {candidates.map((c) => (
              <label
                key={c.rowIndex}
                className={`flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-sm ${
                  c.isDuplicate ? 'opacity-50' : ''
                } ${!c.date || c.amountCents === undefined ? 'bg-rose-50 dark:bg-rose-950/40' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={c.include}
                  onChange={() => toggleCandidate(c.rowIndex)}
                  disabled={!c.date || c.amountCents === undefined}
                  className="accent-brand-500"
                />
                <span className="w-20 shrink-0 text-xs text-slate-400">{c.date ?? 'ungültig'}</span>
                <span className="min-w-0 flex-1 truncate text-slate-700 dark:text-slate-200">
                  {c.description || '(keine Beschreibung)'}
                </span>
                {c.amountCents !== undefined ? (
                  <span
                    className={`shrink-0 font-medium tabular-nums ${
                      c.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {formatSignedMoney(c.amountCents, c.type)}
                  </span>
                ) : (
                  <span className="shrink-0 text-xs text-rose-500">kein Betrag</span>
                )}
                {c.isDuplicate && <span className="shrink-0 text-xs text-amber-500">Duplikat?</span>}
              </label>
            ))}
          </div>

          <div className="flex justify-between pt-2">
            <button
              onClick={() => setStep('mapping')}
              className="rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Zurück
            </button>
            <button
              onClick={handleImport}
              disabled={importableCandidates.length === 0}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
            >
              {importableCandidates.length} Transaktionen importieren
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}

function ColumnSelect({
  label,
  headers,
  value,
  onChange,
}: {
  label: string
  headers: string[]
  value: number
  onChange: (index: number) => void
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-brand-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      >
        <option value={-1}>— keine —</option>
        {headers.map((header, index) => (
          <option key={index} value={index}>
            {header}
          </option>
        ))}
      </select>
    </div>
  )
}
