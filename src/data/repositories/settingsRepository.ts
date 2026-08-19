import { db } from '@/data/db'
import { DEFAULT_SETTINGS, type UserSettings } from '@/types/settings'

export const settingsRepository = {
  async get(): Promise<UserSettings> {
    const settings = await db.settings.get('settings')
    // Merge with defaults so fields added after a user's settings row was
    // first created (schema evolves, IndexedDB rows don't) are never undefined.
    return settings ? { ...DEFAULT_SETTINGS, ...settings } : DEFAULT_SETTINGS
  },

  async update(patch: Partial<Omit<UserSettings, 'id'>>): Promise<void> {
    const current = await this.get()
    await db.settings.put({ ...current, ...patch })
  },
}
