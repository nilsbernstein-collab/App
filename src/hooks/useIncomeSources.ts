import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { incomeSourceRepository } from '@/data/repositories'
import type { NewIncomeSource } from '@/types/incomeSource'

export const incomeSourcesKey = ['incomeSources'] as const

export function useIncomeSources() {
  return useQuery({
    queryKey: incomeSourcesKey,
    queryFn: incomeSourceRepository.listActive,
  })
}

export function useCreateIncomeSource() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: NewIncomeSource) => incomeSourceRepository.create(input),
    onError: () => toast.error('Einkommensquelle konnte nicht erstellt werden.'),
    onSuccess: () => {
      toast.success('Einkommensquelle hinzugefügt')
      queryClient.invalidateQueries({ queryKey: incomeSourcesKey })
    },
  })
}

export function useArchiveIncomeSource() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => incomeSourceRepository.archive(id),
    onError: () => toast.error('Einkommensquelle konnte nicht entfernt werden.'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: incomeSourcesKey })
    },
  })
}
