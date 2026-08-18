import { useState } from 'react'
import toast from 'react-hot-toast'
import { ProGate } from '@/components/common/ProGate'

/** Generates a display-only mock key — no real credential is issued yet. See server-stubs/routes/integrations.ts. */
function generateMockApiKey(): string {
  return `nt_live_${crypto.randomUUID().replace(/-/g, '').slice(0, 24)}`
}

export function ApiAccessCard() {
  const [apiKey, setApiKey] = useState<string | null>(null)

  const handleGenerate = () => {
    setApiKey(generateMockApiKey())
    toast.success('API-Key erstellt (Demo)')
  }

  const handleCopy = () => {
    if (!apiKey) return
    navigator.clipboard.writeText(apiKey)
    toast.success('In Zwischenablage kopiert')
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="mb-1 text-sm font-semibold text-slate-800 dark:text-slate-100">API-Zugang</h2>
      <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
        Für zukünftige Bank- und Shopify-Anbindungen. Aktuell als Vorschau — echte Datenverbindungen folgen.
      </p>
      <ProGate trigger="api_access">
        {apiKey ? (
          <div className="flex items-center gap-2">
            <code className="flex-1 truncate rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {apiKey}
            </code>
            <button
              onClick={handleCopy}
              className="shrink-0 rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Kopieren
            </button>
          </div>
        ) : (
          <button
            onClick={handleGenerate}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            API-Key erstellen
          </button>
        )}
      </ProGate>
    </div>
  )
}
