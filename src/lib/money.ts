/** Formats a cents-integer as a localized currency string, e.g. 123456 -> "1.234,56 €". */
export function formatMoney(cents: number, currency = 'EUR', locale = 'de-DE'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(cents / 100)
}

/** Formats a cents-integer as a signed currency string for transaction lists, e.g. "+123,45 €" / "-50,00 €". */
export function formatSignedMoney(cents: number, type: 'income' | 'expense', currency = 'EUR'): string {
  const sign = type === 'income' ? '+' : '-'
  return `${sign}${formatMoney(Math.abs(cents), currency)}`
}

export function eurosToCents(value: number): number {
  return Math.round(value * 100)
}

export function centsToEuros(cents: number): number {
  return cents / 100
}
