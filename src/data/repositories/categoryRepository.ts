import { db } from '@/data/db'
import type { Category, NewCategory } from '@/types/category'

export const categoryRepository = {
  async list(): Promise<Category[]> {
    return db.categories.orderBy('order').toArray()
  },

  async create(input: NewCategory): Promise<Category> {
    const category: Category = { ...input, id: crypto.randomUUID() }
    await db.categories.add(category)
    return category
  },

  async update(id: string, patch: Partial<NewCategory>): Promise<void> {
    await db.categories.update(id, patch)
  },

  async remove(id: string): Promise<void> {
    await db.categories.delete(id)
  },

  /** Persists a new drag-and-drop order for a set of categories. */
  async reorder(orderedIds: string[]): Promise<void> {
    await db.transaction('rw', db.categories, async () => {
      await Promise.all(orderedIds.map((id, index) => db.categories.update(id, { order: index })))
    })
  },
}
