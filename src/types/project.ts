export interface Project {
  id: string
  name: string
  clientName?: string
  color: string
  archived: boolean
  createdAt: string
}

export type NewProject = Omit<Project, 'id' | 'archived' | 'createdAt'>
