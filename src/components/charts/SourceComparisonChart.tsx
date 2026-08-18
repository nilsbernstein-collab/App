import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { centsToEuros } from '@/lib/money'

export interface SourceTotal {
  name: string
  color: string
  totalCents: number
}

export function SourceComparisonChart({ data }: { data: SourceTotal[] }) {
  const chartData = data.map((d) => ({ name: d.name, Umsatz: centsToEuros(d.totalCents), color: d.color }))

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 12 }} stroke="currentColor" className="text-slate-400" tickFormatter={(v) => `${v}€`} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={110} stroke="currentColor" className="text-slate-400" />
        <Tooltip
          formatter={(value) => `${Number(value).toLocaleString('de-DE')} €`}
          contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}
        />
        <Bar dataKey="Umsatz" radius={[0, 4, 4, 0]}>
          {chartData.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
