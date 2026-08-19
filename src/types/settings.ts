export type Theme = 'light' | 'dark' | 'system'
export type TaxCountry = 'DE' | 'AT' | 'CH'

export const TAX_COUNTRY_LABELS: Record<TaxCountry, string> = {
  DE: 'Deutschland',
  AT: 'Österreich',
  CH: 'Schweiz',
}

export interface UserSettings {
  id: 'settings' // singleton row
  theme: Theme
  currency: string // ISO 4217, e.g. 'EUR'
  /** Suggested tax reserve rate as a percentage (0-100), editable by the user. */
  taxReserveRate: number
  /** Determines which tax report format the EÜR export prepares. */
  taxCountry: TaxCountry
  onboardingCompleted: boolean
}

export const DEFAULT_SETTINGS: UserSettings = {
  id: 'settings',
  theme: 'system',
  currency: 'EUR',
  taxReserveRate: 28,
  taxCountry: 'DE',
  onboardingCompleted: false,
}
