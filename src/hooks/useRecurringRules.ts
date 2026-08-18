import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { recurringRuleRepository } from '@/data/repositories'
import { transactionsKey } from './useTransactions'
import type { NewRecurringRule, RecurringRule } from '@/types/recurringRule'

export const recurringRulesKey = ['recurringRules'] as const

export function useRecurringRules() {
  return useQuery({
    queryKey: recurringRulesKey,
    queryFn: recurringRuleRepository.list,
  })
}

export function useCreateRecurringRule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: NewRecurringRule) => recurringRuleRepository.create(input),
    onError: () => toast.error('Regel konnte nicht erstellt werden.'),
    onSuccess: () => {
      toast.success('Wiederkehrende Buchung angelegt')
      queryClient.invalidateQueries({ queryKey: recurringRulesKey })
      queryClient.invalidateQueries({ queryKey: transactionsKey })
    },
  })
}

export function useUpdateRecurringRule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<RecurringRule> }) =>
      recurringRuleRepository.update(id, patch),
    onError: () => toast.error('Änderung konnte nicht gespeichert werden.'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recurringRulesKey })
    },
  })
}

export function useDeleteRecurringRule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => recurringRuleRepository.remove(id),
    onSuccess: () => {
      toast.success('Regel gelöscht')
      queryClient.invalidateQueries({ queryKey: recurringRulesKey })
    },
  })
}
