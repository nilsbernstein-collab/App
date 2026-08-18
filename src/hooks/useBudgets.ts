import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { budgetRepository } from '@/data/repositories'

export const budgetsKey = ['budgets'] as const

export function useBudgets() {
  return useQuery({
    queryKey: budgetsKey,
    queryFn: budgetRepository.list,
  })
}

export function useSetBudget() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ categoryId, monthlyLimitCents }: { categoryId: string; monthlyLimitCents: number }) =>
      budgetRepository.upsertForCategory(categoryId, monthlyLimitCents),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: budgetsKey })
    },
  })
}

export function useRemoveBudget() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => budgetRepository.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: budgetsKey })
    },
  })
}
