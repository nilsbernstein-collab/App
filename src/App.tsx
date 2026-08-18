import { lazy, Suspense, useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { DashboardPage } from '@/pages/DashboardPage'
import { TransactionsPage } from '@/pages/TransactionsPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { TransactionFormModal } from '@/components/transactions/TransactionFormModal'
import { UpgradeModal } from '@/components/upgrade/UpgradeModal'
import { CheckoutModal } from '@/components/upgrade/CheckoutModal'
import { ensureSeeded } from '@/data/db'
import { PageSkeleton } from '@/components/common/PageSkeleton'
import { SplashScreen } from '@/components/common/SplashScreen'

// Recharts pulls in a meaningful chunk of its own — split it off the main bundle.
const ReportsPage = lazy(() => import('@/pages/ReportsPage').then((m) => ({ default: m.ReportsPage })))

function App() {
  const [isSeeded, setIsSeeded] = useState(false)

  useEffect(() => {
    // Seeding must finish before any query (categories, income sources, ...) reads
    // from IndexedDB — otherwise a query firing during seeding could cache an
    // empty result that never gets invalidated afterwards.
    ensureSeeded().then(() => setIsSeeded(true))
  }, [])

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
