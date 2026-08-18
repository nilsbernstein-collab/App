import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { settingsRepository } from '@/data/repositories'
import type { UserSettings } from '@/types/settings'

export const settingsKey = ['settings'] as const

export function useSettings() {
  return useQuery({
    queryKey: settingsKey,
    queryFn: settingsRepository.get,
  })
}

export function useUpdateSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (patch: Partial<Omit<UserSettings, 'id'>>) => settingsRepository.update(patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKey })
    },
  })
}
