import { useMemo } from 'react'
import { useCategories } from './useCategories'
import type { Category } from '@/types/category'

export function useCategoryLookup(): Map<string, Category> {
  const { data: categories } = useCategories()
  return useMemo(() => new Map((categories ?? []).map((c) => [c.id, c])), [categories])
}
