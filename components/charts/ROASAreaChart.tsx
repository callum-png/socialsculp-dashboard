'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts'

interface ROASDataPoint {
  date: string
  roas: number
  target?: number
}

interface ROASAreaChartProps {
  data: ROASDataPoint[]
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) {
  if (!active || !payload || payload.length === 0) return null

  return (
    <div className="bg-white border border-[#e4e7ed] shadow-sm px-3 py-2.5 text-xs font-syne rounded-md">
      <p className="text-[#6b7280] mb-1.5">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-[#6b7280] capitalize">{entry.dataKey}:</span>
          <span className="text-[#111827] font-bold">
            {typeof entry.value === 'number' ? `${entry.value.toFixed(2)}x` : entry.value}
          </span>
        </div>
      ))}
    </div>
  )
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function ROASAreaChart({ data }: ROASAreaChartProps) {
  const hasTarget = data.some((d) => d.target !== undefined)

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="roasGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#008cff" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#008cff" stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid
          vertical={false}
          stroke="#e4e7ed"
          strokeDasharray="0"
        />

        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          tick={{ fill: '#6b7280', fontSize: 11, fontFamily: 'Syne' }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />

        <YAxis
          tickFormatter={(v) => `${v.toFixed(1)}x`}
          tick={{ fill: '#6b7280', fontSize: 11, fontFamily: 'Syne' }}
          axisLine={false}
          tickLine={false}
        />

        <Tooltip content={<CustomTooltip />} />

        <Area
          type="monotone"
          dataKey="roas"
          stroke="#008cff"
          strokeWidth={2}
          fill="url(#roasGradient)"
          dot={false}
          activeDot={{ r: 4, fill: '#008cff', strokeWidth: 0 }}
        />

        {hasTarget && (
          <Area
            type="monotone"
            dataKey="target"
            stroke="#9ca3af"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            fill="none"
            dot={false}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  )
}
