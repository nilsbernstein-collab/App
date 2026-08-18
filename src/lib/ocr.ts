export interface ReceiptOcrResult {
  rawText: string
  amountCents?: number
  date?: string // ISO yyyy-MM-dd
  vendor?: string
}

const TOTAL_KEYWORDS = /(gesamt|summe|total|betrag|zu\s*zahlen|endbetrag|amount due)/i

/** Matches amounts like "12,34", "1.234,56", "12.34", optionally with a currency symbol. */
const AMOUNT_PATTERN = /(?:€|eur)?\s*(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})\s*(?:€|eur)?/i

function parseGermanAmount(raw: string): number | undefined {
  // Normalize "1.234,56" or "12,34" -> 1234.56 / 12.34; also accept plain "12.34".
  const hasComma = raw.includes(',')
  const normalized = hasComma ? raw.replace(/\./g, '').replace(',', '.') : raw
  const value = Number(normalized)
  return Number.isFinite(value) ? Math.round(value * 100) : undefined
}

function extractAmount(lines: string[]): number | undefined {
  // Prefer an amount on a line that mentions a total/sum keyword.
  for (const line of lines) {
    if (TOTAL_KEYWORDS.test(line)) {
      const match = line.match(AMOUNT_PATTERN)
      if (match) {
        const cents = parseGermanAmount(match[1])
        if (cents !== undefined) return cents
      }
    }
  }

  // Fall back to the largest amount found anywhere on the receipt — usually the total.
  let largest: number | undefined
  for (const line of lines) {
    const matches = line.matchAll(new RegExp(AMOUNT_PATTERN, 'gi'))
    for (const match of matches) {
      const cents = parseGermanAmount(match[1])
      if (cents !== undefined && (largest === undefined || cents > largest)) {
        largest = cents
      }
    }
  }
  return largest
}

/** Matches dd.mm.yyyy, dd.mm.yy, or yyyy-mm-dd. */
const DATE_PATTERNS = [
  /\b(\d{1,2})[./](\d{1,2})[./](\d{4})\b/,
  /\b(\d{1,2})[./](\d{1,2})[./](\d{2})\b/,
  /\b(\d{4})-(\d{2})-(\d{2})\b/,
]

function extractDate(lines: string[]): string | undefined {
  for (const line of lines) {
    for (const pattern of DATE_PATTERNS) {
      const match = line.match(pattern)
      if (!match) continue

      if (pattern === DATE_PATTERNS[2]) {
        return `${match[1]}-${match[2]}-${match[3]}`
      }
      let [, day, month, year] = match
      if (year.length === 2) year = `20${year}`
      const dayNum = Number(day)
      const monthNum = Number(month)
      if (dayNum < 1 || dayNum > 31 || monthNum < 1 || monthNum > 12) continue
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    }
  }
  return undefined
}

function extractVendor(lines: string[]): string | undefined {
  // The vendor name is almost always one of the first non-empty, non-numeric lines.
  for (const line of lines.slice(0, 5)) {
    const trimmed = line.trim()
    if (trimmed.length < 3) continue
    const digitRatio = (trimmed.match(/\d/g)?.length ?? 0) / trimmed.length
    if (digitRatio > 0.4) continue
    return trimmed
  }
  return undefined
}

/**
 * Runs OCR on a receipt photo and heuristically extracts amount/date/vendor.
 * Tesseract.js itself is loaded lazily (dynamic import) so its ~2MB core +
 * language data are never fetched for users who don't use this feature. Its
 * worker/wasm/language files are fetched from a CDN on first use, so this
 * needs a network connection; a hung or blocked fetch is turned into a
 * rejection after 30s instead of leaving the caller waiting forever.
 */
export async function scanReceipt(image: File): Promise<ReceiptOcrResult> {
  const { recognize } = await import('tesseract.js')

  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('OCR timed out — check your internet connection.')), 30000),
  )
  const { data } = await Promise.race([recognize(image, 'deu+eng'), timeout])

  const lines = data.text.split('\n').map((l) => l.trim()).filter(Boolean)

  return {
    rawText: data.text,
    amountCents: extractAmount(lines),
    date: extractDate(lines),
    vendor: extractVendor(lines),
  }
}
