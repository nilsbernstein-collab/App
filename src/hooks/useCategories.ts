import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { categoryRepository } from '@/data/repositories'
import type { Category, NewCategory } from '@/types/category'

export const categoriesKey = ['categories'] as const

export function useCategories() {
  return useQuery({
    queryKey: categoriesKey,
    queryFn: categoryRepository.list,
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: NewCategory) => categoryRepository.create(input),
    onError: () => toast.error('Kategorie konnte nicht erstellt werden.'),
    onSuccess: () => {
      toast.success('Kategorie erstellt')
      queryClient.invalidateQueries({ queryKey: categoriesKey })
    },
  })
}

export function useReorderCategories() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (orderedIds: string[]) => categoryRepository.reorder(orderedIds),
    onMutate: async (orderedIds) => {
      await queryClient.cancelQueries({ queryKey: categoriesKey })
      const previous = queryClient.getQueryData<Category[]>(categoriesKey)

      queryClient.setQueryData<Category[]>(categoriesKey, (old) => {
        if (!old) return old
        const byId = new Map(old.map((c) => [c.id, c]))
        return orderedIds
          .map((id, index) => {
            const category = byId.get(id)
            return category ? { ...category, order: index } : undefined
          })
          .filter((c): c is Category => Boolean(c))
      })

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(categoriesKey, context.previous)
      toast.error('Reihenfolge konnte nicht gespeichert werden.')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: categoriesKey })
    },
  })
}
