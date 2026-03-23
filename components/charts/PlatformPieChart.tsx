'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts'
import { formatNumber } from '@/lib/utils'

interface PieDataPoint {
  name: string
  value: number
}

interface Props {
  data: PieDataPoint[]
  height?: number
}

const COLORS = ['#008cff', '#e1306c', '#6b7280']

function CustomTooltip({ active, payload }: { active?: boolean; payload?: any[] }) {
  if (!active || !payload || payload.length === 0) return null
  const entry = payload[0]

  return (
    <div className="bg-white border border-[#e4e7ed] shadow-sm px-3 py-2.5 text-xs font-syne rounded-md">
      <div className="flex items-center gap-2">
        <span
          className="inline-block w-2 h-2 shrink-0 rounded-full"
          style={{ backgroundColor: entry.payload?.fill ?? '#008cff' }}
        />
        <span className="text-[#6b7280]">{entry.name}:</span>
        <span className="text-[#111827] font-bold">
          {typeof entry.value === 'number' ? formatNumber(entry.value) : entry.value}
        </span>
      </div>
    </div>
  )
}

export function PlatformPieChart({ data, height = 260 }: Props) {
  const total = data.reduce((sum, d) => sum + d.value, 0)

  return (
    <div style={{ height }}>
      <div className="relative" style={{ height: height - 60 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
          style={{ top: 0 }}
        >
          <span className="font-syne text-2xl font-semibold tracking-tight text-[#111827] leading-none">
            {formatNumber(total)}
          </span>
          <span className="text-[10px] font-syne uppercase tracking-widest text-[#6b7280] mt-1">
            Total
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 pt-2">
        {data.map((entry, i) => (
          <div key={entry.name} className="flex items-center gap-1.5">
            <span
              className="inline-block w-2 h-2 shrink-0"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            <span className="text-[11px] font-syne text-[#6b7280]">{entry.name}</span>
            <span className="text-[11px] font-syne text-[#111827]">
              {formatNumber(entry.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
