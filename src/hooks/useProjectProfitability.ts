import { useMemo } from 'react'
import { useTransactions } from './useTransactions'
import { useProjects } from './useProjects'

export interface ProjectProfitability {
  projectId: string
  name: string
  clientName?: string
  color: string
  incomeCents: number
  expenseCents: number
  marginCents: number
  marginPercent: number
}

export function useProjectProfitability(): { data: ProjectProfitability[]; isLoading: boolean } {
  const { data: transactions, isLoading: transactionsLoading } = useTransactions()
  const { data: projects, isLoading: projectsLoading } = useProjects()

  const data = useMemo(() => {
    return (projects ?? []).map((project) => {
      const projectTransactions = (transactions ?? []).filter((t) => t.projectId === project.id)
      const incomeCents = projectTransactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amountCents, 0)
      const expenseCents = projectTransactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amountCents, 0)
      const marginCents = incomeCents - expenseCents

      return {
        projectId: project.id,
        name: project.name,
        clientName: project.clientName,
        color: project.color,
        incomeCents,
        expenseCents,
        marginCents,
        marginPercent: incomeCents > 0 ? Math.round((marginCents / incomeCents) * 100) : 0,
      }
    })
  }, [transactions, projects])

  return { data, isLoading: transactionsLoading || projectsLoading }
}
