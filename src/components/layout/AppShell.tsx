import { useMemo, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { MobileNav } from './MobileNav'
import { useUiStore } from '@/store/uiStore'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

const titles: Record<string, string> = {
  '/': 'Dashboard',
  '/transactions': 'Transaktionen',
  '/reports': 'Berichte',
  '/settings': 'Einstellungen',
}

export function AppShell() {
  const location = useLocation()
  const [isMobileNavOpen, setMobileNavOpen] = useState(false)
  const openTransactionForm = useUiStore((s) => s.openTransactionForm)
  const isTransactionFormOpen = useUiStore((s) => s.isTransactionFormOpen)
  const isUpgradeModalOpen = useUiStore((s) => s.isUpgradeModalOpen)

  const title = useMemo(() => titles[location.pathname] ?? 'NicheTrack', [location.pathname])

  useKeyboardShortcuts(
    {
      n: () => openTransactionForm('expense'),
    },
    !isTransactionFormOpen && !isUpgradeModalOpen,
  )

  return (
    <div className="flex h-full min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Sidebar />
      <MobileNav isOpen={isMobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header title={title} onOpenMobileNav={() => setMobileNavOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/*
            Deliberately no AnimatePresence here: mode="wait" combined with
            react-router navigation caused framer-motion to occasionally lose
            track of the current child and force a phantom remount of the
            page well after navigation had settled (reproduced independent of
            lazy-loading). A keyed enter-only animation gives the same
            "page just appeared" feel without that exit-choreography.
          */}
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  )
}
