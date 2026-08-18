import { MonthlyBarChart } from '@/components/charts/MonthlyBarChart'
import { ForecastChart } from '@/components/charts/ForecastChart'
import { SourceComparisonChart } from '@/components/charts/SourceComparisonChart'
import { TaxReserveCard } from '@/components/reports/TaxReserveCard'
import { ProGate } from '@/components/common/ProGate'
import { Skeleton } from '@/components/common/Skeleton'
import { useMonthlyPoints, useSourceTotals, useTotalIncomeThisYear } from '@/hooks/useReportsData'
import { useSettings } from '@/hooks/useSettings'
import { forecastIncome } from '@/lib/forecast'
import { useIsPro } from '@/hooks/useSubscription'
import { ExportPanel } from '@/components/reports/ExportPanel'
import { ProjectProfitabilityTable } from '@/components/reports/ProjectProfitabilityTable'

export function ReportsPage() {
  const { data: monthlyPoints, isLoading } = useMonthlyPoints(6)
  const { data: yearlyPoints } = useMonthlyPoints(12)
  const { data: sourceTotals } = useSourceTotals()
  const { data: settings } = useSettings()
  const yearlyIncomeCents = useTotalIncomeThisYear()
  const isPro = useIsPro()

  const forecastData = forecastIncome(yearlyPoints, 3)

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-sm font-semibold text-slate-800 dark:text-slate-100">
          Einnahmen vs. Ausgaben (letzte 6 Monate)
        </h2>
        {isLoading ? <Skeleton className="h-[280px] w-full" /> : <MonthlyBarChart data={monthlyPoints} />}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-sm font-semibold text-slate-800 dark:text-slate-100">
          Rentabilität pro Projekt/Kunde
        </h2>
        <ProjectProfitabilityTable />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-sm font-semibold text-slate-800 dark:text-slate-100">Umsatzprognose</h2>
          <ProGate trigger="forecast">
            <ForecastChart data={forecastData} />
          </ProGate>
        </div>

        <ProGate trigger="tax_reserve">
          <TaxReserveCard yearlyIncomeCents={yearlyIncomeCents} ratePercent={settings?.taxReserveRate ?? 28} />
        </ProGate>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-sm font-semibold text-slate-800 dark:text-slate-100">Einkommensquellen-Vergleich</h2>
        {isPro && sourceTotals.length <= 1 ? (
          <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Füge in den Einstellungen weitere Einkommensquellen hinzu, um sie hier zu vergleichen.
          </p>
        ) : (
          <ProGate trigger="second_income_source">
            <SourceComparisonChart
              data={sourceTotals.length > 0 ? sourceTotals : [{ name: 'Meine Quelle', color: '#147df5', totalCents: 0 }]}
            />
          </ProGate>
        )}
      </div>

      <ExportPanel />
    </div>
  )
}
