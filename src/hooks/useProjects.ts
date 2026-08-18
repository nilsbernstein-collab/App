import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { projectRepository } from '@/data/repositories'
import type { NewProject } from '@/types/project'

export const projectsKey = ['projects'] as const

export function useProjects() {
  return useQuery({
    queryKey: projectsKey,
    queryFn: projectRepository.listActive,
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: NewProject) => projectRepository.create(input),
    onError: () => toast.error('Projekt konnte nicht erstellt werden.'),
    onSuccess: () => {
      toast.success('Projekt angelegt')
      queryClient.invalidateQueries({ queryKey: projectsKey })
    },
  })
}

export function useArchiveProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => projectRepository.archive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectsKey })
    },
  })
}
