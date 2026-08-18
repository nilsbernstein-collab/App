import { MenuIcon, MoonIcon, PlusIcon, SunIcon } from '@/components/common/Icons'
import { useUiStore } from '@/store/uiStore'
import { useThemeStore } from '@/store/themeStore'

export function Header({ title, onOpenMobileNav }: { title: string; onOpenMobileNav: () => void }) {
  const openTransactionForm = useUiStore((s) => s.openTransactionForm)
  const theme = useThemeStore((s) => s.theme)
  const setTheme = useThemeStore((s) => s.setTheme)

  const toggleTheme = () => {
    const isDark =
      theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    setTheme(isDark ? 'light' : 'dark')
  }

  return (
    <header className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileNav}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
          aria-label="Menü öffnen"
        >
          <MenuIcon className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          aria-label="Dark Mode umschalten"
          title="Dark Mode umschalten"
        >
          {theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
        </button>
        <button
          onClick={() => openTransactionForm('expense')}
          className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-600 active:scale-[0.98]"
          title="Neue Transaktion (Shortcut: N)"
        >
          <PlusIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Neue Transaktion</span>
          <kbd className="ml-1 hidden rounded border border-white/30 px-1.5 py-0.5 text-xs opacity-80 sm:inline">
            N
          </kbd>
        </button>
      </div>
    </header>
  )
}
