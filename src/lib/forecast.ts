export interface MonthlyPoint {
  year: number
  month: number
  label: string
  incomeCents: number
  expenseCents: number
}

export interface ForecastPoint {
  label: string
  actualCents?: number
  forecastCents?: number
}

/**
 * Simple linear regression over monthly income totals, projected `monthsAhead`
 * months into the future. Good enough for a "where is this trending" signal —
 * not a substitute for real seasonality-aware forecasting.
 */
export function forecastIncome(history: MonthlyPoint[], monthsAhead = 3): ForecastPoint[] {
  const n = history.length
  if (n === 0) return []

  const xs = history.map((_, i) => i)
  const ys = history.map((h) => h.incomeCents)
  const meanX = xs.reduce((a, b) => a + b, 0) / n
  const meanY = ys.reduce((a, b) => a + b, 0) / n

  let numerator = 0
  let denominator = 0
  for (let i = 0; i < n; i++) {
    numerator += (xs[i] - meanX) * (ys[i] - meanY)
    denominator += (xs[i] - meanX) ** 2
  }
  const slope = denominator === 0 ? 0 : numerator / denominator
  const intercept = meanY - slope * meanX

  const points: ForecastPoint[] = history.map((h, i) => ({
    label: h.label,
    actualCents: h.incomeCents,
    forecastCents: Math.round(intercept + slope * i),
  }))

  for (let i = 0; i < monthsAhead; i++) {
    const x = n + i
    const date = new Date()
    date.setMonth(date.getMonth() + i + 1)
    const label = date.toLocaleDateString('de-DE', { month: 'short', year: '2-digit' })
    points.push({ label, forecastCents: Math.max(0, Math.round(intercept + slope * x)) })
  }

  return points
}
