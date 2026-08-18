import { useState } from 'react'
import { useArchiveProject, useCreateProject, useProjects } from '@/hooks/useProjects'
import { PlusIcon, TrashIcon } from '@/components/common/Icons'

const PROJECT_COLORS = ['#147df5', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#f43f5e']

export function ProjectManager() {
  const { data: projects = [] } = useProjects()
  const createProject = useCreateProject()
  const archiveProject = useArchiveProject()

  const [name, setName] = useState('')
  const [clientName, setClientName] = useState('')

  const handleAdd = () => {
    if (!name.trim()) return
    createProject.mutate({
      name: name.trim(),
      clientName: clientName.trim() || undefined,
      color: PROJECT_COLORS[projects.length % PROJECT_COLORS.length],
    })
    setName('')
    setClientName('')
  }

  return (
    <div>
      <p className="mb-3 text-xs text-slate-400 dark:text-slate-500">
        Ordne Transaktionen einem Projekt oder Kunden zu, um die Rentabilität in den Berichten zu sehen.
      </p>
      {projects.length > 0 && (
        <ul className="mb-3 space-y-2">
          {projects.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800"
            >
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                <span className="text-sm text-slate-700 dark:text-slate-200">{p.name}</span>
                {p.clientName && <span className="text-xs text-slate-400">· {p.clientName}</span>}
              </div>
              <button
                onClick={() => archiveProject.mutate(p.id)}
                className="rounded-lg p-1.5 text-slate-300 hover:bg-rose-50 hover:text-rose-500 dark:text-slate-600 dark:hover:bg-rose-950"
                aria-label="Projekt entfernen"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="grid grid-cols-2 gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Projektname"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-brand-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
        <input
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Kunde (optional)"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-brand-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
      </div>
      <button
        onClick={handleAdd}
        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
      >
        <PlusIcon className="h-4 w-4" />
        Projekt hinzufügen
      </button>
    </div>
  )
}
