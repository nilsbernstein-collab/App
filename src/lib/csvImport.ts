import type { Transaction } from '@/types/transaction'

export interface ParsedCsv {
  headers: string[]
  rows: string[][]
}

export async function parseCsvFile(file: File): Promise<ParsedCsv> {
  const Papa = await import('papaparse')
  return new Promise((resolve, reject) => {
    Papa.parse<string[]>(file, {
      complete: (result) => {
        const rows = result.data.filter((row) => row.some((cell) => cell.trim() !== ''))
        if (rows.length === 0) {
          reject(new Error('Die Datei enthält keine Daten.'))
          return
        }
        const [headers, ...body] = rows
        resolve({ headers, rows: body })
      },
      error: (error: Error) => reject(error),
      skipEmptyLines: true,
    })
  })
}

export interface ColumnMapping {
  dateColumn: number
  descriptionColumn: number
  /** Single signed-amount column (positive = income, negative = expense). Mutually exclusive with debit/credit columns. */
  amountColumn?: number
  /** Separate debit (money out) column, as used by many bank exports. */
  debitColumn?: number
  /** Separate credit (money in) column. */
  creditColumn?: number
}

const DATE_HINTS = ['datum', 'date', 'buchungstag', 'valuta', 'created', 'day']
const AMOUNT_HINTS = ['betrag', 'amount', 'summe', 'total', 'wert']
const DEBIT_HINTS = ['soll', 'debit', 'ausgang', 'belastung', 'abbuchung']
const CREDIT_HINTS = ['haben', 'credit', 'eingang', 'gutschrift']
const DESCRIPTION_HINTS = ['beschreibung', 'description', 'verwendungszweck', 'buchungstext', 'name', 'empfänger', 'zahlungsempfänger', 'memo', 'note', 'item']

function findColumn(headers: string[], hints: string[]): number | undefined {
  const lower = headers.map((h) => h.toLowerCase())
  for (const hint of hints) {
    const index = lower.findIndex((h) => h.includes(hint))
    if (index !== -1) return index
  }
  return undefined
}

/** Best-effort column guess so the import wizard starts pre-filled for common bank/Shopify/PayPal exports. */
export function guessColumnMapping(headers: string[]): Partial<ColumnMapping> {
  const debitColumn = findColumn(headers, DEBIT_HINTS)
  const creditColumn = findColumn(headers, CREDIT_HINTS)

  return {
    dateColumn: findColumn(headers, DATE_HINTS),
    descriptionColumn: findColumn(headers, DESCRIPTION_HINTS),
    ...(debitColumn !== undefined || creditColumn !== undefined
      ? { debitColumn, creditColumn }
      : { amountColumn: findColumn(headers, AMOUNT_HINTS) }),
  }
}

/**
 * Parses an amount string from either German (1.234,56) or US (1,234.56)
 * formatting: if both separators appear, the rightmost one is the decimal
 * point; if only one appears, it's the decimal point only when followed by
 * exactly 1-2 digits at the end of the string.
 */
export function parseFlexibleAmount(raw: string): number | undefined {
  const trimmed = raw.trim().replace(/[€$£]/g, '').trim()
  if (!trimmed) return undefined

  const isNegative = /^-/.test(trimmed) || /^\(.*\)$/.test(trimmed)
  const cleaned = trimmed.replace(/[()-]/g, '')

  const lastComma = cleaned.lastIndexOf(',')
  const lastDot = cleaned.lastIndexOf('.')
  let normalized: string

  if (lastComma !== -1 && lastDot !== -1) {
    normalized =
      lastComma > lastDot
        ? cleaned.replace(/\./g, '').replace(',', '.')
        : cleaned.replace(/,/g, '')
  } else if (lastComma !== -1) {
    const decimals = cleaned.length - lastComma - 1
    normalized = decimals === 2 ? cleaned.replace(',', '.') : cleaned.replace(/,/g, '')
  } else {
    normalized = cleaned
  }

  const value = Number(normalized)
  if (!Number.isFinite(value)) return undefined
  return Math.round(value * 100) * (isNegative ? -1 : 1)
}

const DATE_FORMATS: Array<{ pattern: RegExp; toIso: (m: RegExpMatchArray) => string }> = [
  { pattern: /^(\d{4})-(\d{2})-(\d{2})/, toIso: (m) => `${m[1]}-${m[2]}-${m[3]}` },
  { pattern: /^(\d{1,2})\.(\d{1,2})\.(\d{4})/, toIso: (m) => `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}` },
  { pattern: /^(\d{1,2})\/(\d{1,2})\/(\d{4})/, toIso: (m) => `${m[3]}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}` },
]

export function parseFlexibleDate(raw: string): string | undefined {
  const trimmed = raw.trim()
  for (const { pattern, toIso } of DATE_FORMATS) {
    const match = trimmed.match(pattern)
    if (match) return toIso(match)
  }
  return undefined
}

export interface ImportCandidate {
  rowIndex: number
  date?: string
  amountCents?: number
  description: string
  type: 'income' | 'expense'
  isDuplicate: boolean
  include: boolean
}

export function buildImportCandidates(
  rows: string[][],
  mapping: ColumnMapping,
  existingTransactions: Transaction[],
): ImportCandidate[] {
  const existingKeys = new Set(existingTransactions.map((t) => `${t.date}|${t.amountCents}|${t.type}`))

  return rows.map((row, rowIndex) => {
    const date = parseFlexibleDate(row[mapping.dateColumn] ?? '')
    const description = row[mapping.descriptionColumn]?.trim() ?? ''

    let signedCents: number | undefined
    if (mapping.amountColumn !== undefined) {
      signedCents = parseFlexibleAmount(row[mapping.amountColumn] ?? '')
    } else {
      const debit = mapping.debitColumn !== undefined ? parseFlexibleAmount(row[mapping.debitColumn] ?? '') : undefined
      const credit = mapping.creditColumn !== undefined ? parseFlexibleAmount(row[mapping.creditColumn] ?? '') : undefined
      if (credit) signedCents = Math.abs(credit)
      else if (debit) signedCents = -Math.abs(debit)
    }

    const type: 'income' | 'expense' = (signedCents ?? 0) >= 0 ? 'income' : 'expense'
    const amountCents = signedCents !== undefined ? Math.abs(signedCents) : undefined
    const isDuplicate = Boolean(date && amountCents !== undefined && existingKeys.has(`${date}|${amountCents}|${type}`))

    return { rowIndex, date, amountCents, description, type, isDuplicate, include: !isDuplicate }
  })
}
