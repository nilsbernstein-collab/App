/** Recommended tax reserve for a given income and reserve rate (both in cents / percent). */
export function calculateTaxReserve(incomeCents: number, ratePercent: number): number {
  return Math.round(incomeCents * (ratePercent / 100))
}
