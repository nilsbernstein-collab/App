import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { transactionRepository } from '@/data/repositories'
import type { NewTransaction, Transaction, TransactionUpdate } from '@/types/transaction'

export const transactionsKey = ['transactions'] as const

export function useTransactions() {
  return useQuery({
    queryKey: transactionsKey,
    queryFn: transactionRepository.list,
  })
}

export function useCreateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: NewTransaction) => transactionRepository.create(input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: transactionsKey })
      const previous = queryClient.getQueryData<Transaction[]>(transactionsKey)

      const optimistic: Transaction = {
        ...input,
        id: `optimistic-${crypto.randomUUID()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      queryClient.setQueryData<Transaction[]>(transactionsKey, (old) =>
        old ? [optimistic, ...old] : [optimistic],
      )

      return { previous }
    },
    onError: (_err, _input, context) => {
      if (context?.previous) queryClient.setQueryData(transactionsKey, context.previous)
      toast.error('Transaktion konnte nicht gespeichert werden.')
    },
    onSuccess: () => {
      toast.success('Transaktion gespeichert')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: transactionsKey })
    },
  })
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: TransactionUpdate }) =>
      transactionRepository.update(id, patch),
    onMutate: async ({ id, patch }) => {
      await queryClient.cancelQueries({ queryKey: transactionsKey })
      const previous = queryClient.getQueryData<Transaction[]>(transactionsKey)

      queryClient.setQueryData<Transaction[]>(transactionsKey, (old) =>
        old?.map((t) => (t.id === id ? { ...t, ...patch } : t)),
      )

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(transactionsKey, context.previous)
      toast.error('Änderung konnte nicht gespeichert werden.')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: transactionsKey })
    },
  })
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => transactionRepository.remove(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: transactionsKey })
      const previous = queryClient.getQueryData<Transaction[]>(transactionsKey)

      queryClient.setQueryData<Transaction[]>(transactionsKey, (old) =>
        old?.filter((t) => t.id !== id),
      )

      return { previous }
    },
    onError: (_err, _id, context) => {
      if (context?.previous) queryClient.setQueryData(transactionsKey, context.previous)
      toast.error('Transaktion konnte nicht gelöscht werden.')
    },
    onSuccess: () => {
      toast.success('Transaktion gelöscht')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: transactionsKey })
    },
  })
}
