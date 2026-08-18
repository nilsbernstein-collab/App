import { AnimatePresence, motion } from 'framer-motion'
import { NavLink } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { ChartIcon, CloseIcon, HomeIcon, ListIcon, ReceiptIcon, SettingsIcon } from '@/components/common/Icons'

const navItems = [
  { to: '/', label: 'Dashboard', icon: HomeIcon, end: true },
  { to: '/transactions', label: 'Transaktionen', icon: ListIcon, end: false },
  { to: '/invoices', label: 'Rechnungen', icon: ReceiptIcon, end: false },
  { to: '/reports', label: 'Berichte', icon: ChartIcon, end: false },
  { to: '/settings', label: 'Einstellungen', icon: SettingsIcon, end: false },
]

export function MobileNav({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <motion.div
            className="absolute inset-0 bg-slate-900/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="absolute left-0 top-0 h-full w-64 bg-white p-4 shadow-xl dark:bg-slate-900"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2 px-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 font-bold text-white">
                  N
                </div>
                <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">NicheTrack</span>
              </div>
              <button onClick={onClose} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={onClose}
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
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
