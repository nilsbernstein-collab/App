import { db } from '@/data/db'
import { DEFAULT_SETTINGS, type UserSettings } from '@/types/settings'

export const settingsRepository = {
  async get(): Promise<UserSettings> {
    const settings = await db.settings.get('settings')
    return settings ?? DEFAULT_SETTINGS
  },

  async update(patch: Partial<Omit<UserSettings, 'id'>>): Promise<void> {
    const current = await this.get()
    await db.settings.put({ ...current, ...patch })
  },
}
