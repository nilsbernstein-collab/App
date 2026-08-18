import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { subscriptionRepository } from '@/data/repositories'
import type { SubscriptionStatus } from '@/types/subscription'

export const subscriptionKey = ['subscription'] as const

export function useSubscription() {
  return useQuery({
    queryKey: subscriptionKey,
    queryFn: subscriptionRepository.get,
  })
}

export function useIsPro(): boolean {
  const { data } = useSubscription()
  return data?.tier === 'pro'
}

export function useSetSubscription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (patch: Partial<Omit<SubscriptionStatus, 'id'>>) => subscriptionRepository.set(patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKey })
    },
  })
}
