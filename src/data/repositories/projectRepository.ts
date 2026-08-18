import { db } from '@/data/db'
import type { NewProject, Project } from '@/types/project'

export const projectRepository = {
  async list(): Promise<Project[]> {
    return db.projects.orderBy('createdAt').toArray()
  },

  async listActive(): Promise<Project[]> {
    const all = await db.projects.orderBy('createdAt').toArray()
    return all.filter((p) => !p.archived)
  },

  async create(input: NewProject): Promise<Project> {
    const project: Project = {
      ...input,
      id: crypto.randomUUID(),
      archived: false,
      createdAt: new Date().toISOString(),
    }
    await db.projects.add(project)
    return project
  },

  async update(id: string, patch: Partial<NewProject>): Promise<void> {
    await db.projects.update(id, patch)
  },

  async archive(id: string): Promise<void> {
    await db.projects.update(id, { archived: true })
  },

  async remove(id: string): Promise<void> {
    await db.projects.delete(id)
  },
}
