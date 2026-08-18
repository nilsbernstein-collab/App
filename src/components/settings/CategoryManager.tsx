import { useState } from 'react'
import { Reorder } from 'framer-motion'
import { useCategories, useReorderCategories } from '@/hooks/useCategories'
import { categoryRepository } from '@/data/repositories'
import { useQueryClient } from '@tanstack/react-query'
import { categoriesKey } from '@/hooks/useCategories'
import { useIsPro } from '@/hooks/useSubscription'
import { useUiStore } from '@/store/uiStore'
import { SparkleIcon } from '@/components/common/Icons'
import toast from 'react-hot-toast'
import type { Category } from '@/types/category'

function CategoryItem({ category }: { category: Category }) {
  const isPro = useIsPro()
  const openUpgradeModal = useUiStore((s) => s.openUpgradeModal)
  const queryClient = useQueryClient()
  const [keyword, setKeyword] = useState(category.rule?.keyword ?? '')

  const saveRule = async (value: string) => {
    if (!isPro) {
      openUpgradeModal('auto_categorization')
      return
    }
    await categoryRepository.update(category.id, { rule: value ? { keyword: value } : undefined })
    queryClient.invalidateQueries({ queryKey: categoriesKey })
    if (value) toast.success(`Regel gespeichert: "${value}" → ${category.name}`)
  }

  return (
    <Reorder.Item
      value={category}
      className="flex cursor-grab items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5 active:cursor-grabbing dark:border-slate-800 dark:bg-slate-900"
    >
      <span className="text-slate-300 dark:text-slate-600">⠿</span>
      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: category.color }} />
      <span className="w-28 shrink-0 text-sm font-medium text-slate-700 dark:text-slate-200">{category.name}</span>
      <span className="w-16 shrink-0 text-xs text-slate-400">
        {category.type === 'income' ? 'Einnahme' : 'Ausgabe'}
      </span>
      <div className="flex flex-1 items-center gap-1.5">
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onBlur={() => saveRule(keyword)}
          onKeyDown={(e) => e.key === 'Enter' && (e.currentTarget as HTMLInputElement).blur()}
          placeholder={isPro ? 'Schlüsselwort, z.B. "Shopify"' : 'Regel (Pro)'}
          disabled={!isPro}
          onFocus={() => !isPro && openUpgradeModal('auto_categorization')}
          className="w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs outline-none ring-brand-500 focus:ring-2 disabled:cursor-pointer disabled:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        />
        {!isPro && <SparkleIcon className="h-3.5 w-3.5 shrink-0 text-brand-400" />}
      </div>
    </Reorder.Item>
  )
}

export function CategoryManager() {
  const { data: categories = [] } = useCategories()
  const reorderCategories = useReorderCategories()
  const [localOrder, setLocalOrder] = useState<Category[] | null>(null)

  const items = localOrder ?? categories

  const handleReorder = (next: Category[]) => {
    setLocalOrder(next)
    reorderCategories.mutate(next.map((c) => c.id))
  }

  return (
    <div>
      <p className="mb-3 text-xs text-slate-400 dark:text-slate-500">
        Ziehe Kategorien, um sie neu anzuordnen. Regeln für automatische Kategorisierung sind ein Pro-Feature.
      </p>
      <Reorder.Group axis="y" values={items} onReorder={handleReorder} className="space-y-2">
        {items.map((c) => (
          <CategoryItem key={c.id} category={c} />
        ))}
      </Reorder.Group>
    </div>
  )
}
