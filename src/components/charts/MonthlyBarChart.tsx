import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { centsToEuros } from '@/lib/money'
import type { MonthlyPoint } from '@/lib/forecast'

export function MonthlyBarChart({ data }: { data: MonthlyPoint[] }) {
  const chartData = data.map((d) => ({
    label: d.label,
    Einnahmen: centsToEuros(d.incomeCents),
    Ausgaben: centsToEuros(d.expenseCents),
  }))

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="currentColor" className="text-slate-400" />
        <YAxis
          tick={{ fontSize: 12 }}
          stroke="currentColor"
          className="text-slate-400"
          tickFormatter={(v) => `${v}€`}
          width={48}
        />
        <Tooltip
          formatter={(value) => `${Number(value).toLocaleString('de-DE')} €`}
          contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}
        />
        <Legend wrapperStyle={{ fontSize: 13 }} />
        <Bar dataKey="Einnahmen" fill="#10b981" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Ausgaben" fill="#f43f5e" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
