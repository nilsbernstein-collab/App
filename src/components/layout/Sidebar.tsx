import { NavLink } from 'react-router-dom'
import { ChartIcon, HomeIcon, ListIcon, ReceiptIcon, SettingsIcon, SparkleIcon } from '@/components/common/Icons'
import { useIsPro } from '@/hooks/useSubscription'
import { useUiStore } from '@/store/uiStore'

const navItems = [
  { to: '/', label: 'Dashboard', icon: HomeIcon, end: true },
  { to: '/transactions', label: 'Transaktionen', icon: ListIcon, end: false },
  { to: '/invoices', label: 'Rechnungen', icon: ReceiptIcon, end: false },
  { to: '/reports', label: 'Berichte', icon: ChartIcon, end: false },
  { to: '/settings', label: 'Einstellungen', icon: SettingsIcon, end: false },
]

export function Sidebar() {
  const isPro = useIsPro()
  const openUpgradeModal = useUiStore((s) => s.openUpgradeModal)

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-900/60 md:flex">
      <div className="mb-6 flex items-center gap-2 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-white font-bold">N</div>
        <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">NicheTrack</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-500/10 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300'
                  : 'text-slate-600 hover:bg-slate-200/60 dark:text-slate-300 dark:hover:bg-slate-800'
              }`
            }
          >
            <item.icon className="h-4.5 w-4.5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {!isPro && (
        <button
          onClick={() => openUpgradeModal('generic')}
          className="flex items-center gap-2 rounded-lg border border-brand-200 bg-gradient-to-br from-brand-50 to-brand-100 px-3 py-3 text-left text-sm font-medium text-brand-800 transition hover:shadow-sm dark:border-brand-800 dark:from-brand-950 dark:to-brand-900 dark:text-brand-200"
        >
          <SparkleIcon className="h-4.5 w-4.5 shrink-0" />
          <span>
            Auf <strong>Pro</strong> upgraden
          </span>
        </button>
      )}
    </aside>
  )
}
