import type { Category } from '@/types/category'

/**
 * Rule-based auto-categorization (Pro feature): finds the first category whose
 * keyword rule matches the transaction note, e.g. a rule "Shopify" on the
 * "Umsatz" category auto-assigns any transaction whose note contains "Shopify".
 */
export function suggestCategory(note: string, categories: Category[]): Category | undefined {
  if (!note.trim()) return undefined
  const lowerNote = note.toLowerCase()
  return categories.find((c) => c.rule?.keyword && lowerNote.includes(c.rule.keyword.toLowerCase()))
}
