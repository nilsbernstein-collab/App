export type Theme = 'light' | 'dark' | 'system'

export interface UserSettings {
  id: 'settings' // singleton row
  theme: Theme
  currency: string // ISO 4217, e.g. 'EUR'
  /** Suggested tax reserve rate as a percentage (0-100), editable by the user. */
  taxReserveRate: number
  onboardingCompleted: boolean
}

export const DEFAULT_SETTINGS: UserSettings = {
  id: 'settings',
  theme: 'system',
  currency: 'EUR',
  taxReserveRate: 28,
  onboardingCompleted: false,
}
