import { lazy, Suspense, useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { AppShell } from '@/components/layout/AppShell'
import { DashboardPage } from '@/pages/DashboardPage'
import { TransactionsPage } from '@/pages/TransactionsPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { InvoicesPage } from '@/pages/InvoicesPage'
import { CashflowPage } from '@/pages/CashflowPage'
import { TransactionFormModal } from '@/components/transactions/TransactionFormModal'
import { UpgradeModal } from '@/components/upgrade/UpgradeModal'
import { CheckoutModal } from '@/components/upgrade/CheckoutModal'
import { ensureSeeded } from '@/data/db'
import { generateDueRecurringTransactions } from '@/data/recurringGenerator'
import { transactionsKey } from '@/hooks/useTransactions'
import { recurringRulesKey } from '@/hooks/useRecurringRules'
import { PageSkeleton } from '@/components/common/PageSkeleton'
import { SplashScreen } from '@/components/common/SplashScreen'

// Recharts pulls in a meaningful chunk of its own — split it off the main bundle.
const ReportsPage = lazy(() => import('@/pages/ReportsPage').then((m) => ({ default: m.ReportsPage })))

function App() {
  const [isSeeded, setIsSeeded] = useState(false)
  const queryClient = useQueryClient()

  useEffect(() => {
    // Seeding must finish before any query (categories, income sources, ...) reads
    // from IndexedDB — otherwise a query firing during seeding could cache an
    // empty result that never gets invalidated afterwards.
    ensureSeeded()
      .then(() => generateDueRecurringTransactions())
      .then((created) => {
        setIsSeeded(true)
        if (created.length > 0) {
          queryClient.invalidateQueries({ queryKey: transactionsKey })
          queryClient.invalidateQueries({ queryKey: recurringRulesKey })
          toast.success(
            created.length === 1
              ? '1 wiederkehrende Buchung hinzugefügt'
              : `${created.length} wiederkehrende Buchungen hinzugefügt`,
          )
        }
      })
  }, [queryClient])

  if (!isSeeded) return <SplashScreen />

  return (
    <>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route
            path="/reports"
            element={
              <Suspense fallback={<PageSkeleton />}>
                <ReportsPage />
              </Suspense>
            }
          />
          <Route path="/invoices" element={<InvoicesPage />} />
          <Route path="/cashflow" element={<CashflowPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
      <TransactionFormModal />
      <UpgradeModal />
      <CheckoutModal />
    </>
  )
}

export default App
