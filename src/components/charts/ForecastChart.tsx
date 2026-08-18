import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { centsToEuros } from '@/lib/money'
import type { ForecastPoint } from '@/lib/forecast'

export function ForecastChart({ data }: { data: ForecastPoint[] }) {
  const chartData = data.map((d) => ({
    label: d.label,
    Ist: d.actualCents !== undefined ? centsToEuros(d.actualCents) : undefined,
    Trend: d.forecastCents !== undefined ? centsToEuros(d.forecastCents) : undefined,
  }))

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={chartData}>
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
        <Line type="monotone" dataKey="Ist" stroke="#147df5" strokeWidth={2.5} dot={{ r: 3 }} connectNulls />
        <Line
          type="monotone"
          dataKey="Trend"
          stroke="#c084fc"
          strokeWidth={2}
          strokeDasharray="5 4"
          dot={false}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
