'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts'
import { formatNumber } from '@/lib/utils'

interface ReachDataPoint {
  name: string
  tiktok: number
  instagram: number
}

interface Props {
  data: ReachDataPoint[]
  height?: number
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) {
  if (!active || !payload || payload.length === 0) return null

  return (
    <div className="bg-[#1A1A1A] border border-[#222222] px-3 py-2.5 text-xs font-syne">
      <p className="text-[#6B6860] mb-1.5 truncate max-w-[160px]">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 mb-0.5">
          <span
            className="inline-block w-2 h-2 shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-[#6B6860] capitalize">{entry.name}:</span>
          <span className="text-[#EDE8DE] font-bold">
            {typeof entry.value === 'number' ? formatNumber(entry.value) : entry.value}
          </span>
        </div>
      ))}
    </div>
  )
}

export function ReachBarChart({ data, height = 260 }: Props) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }} barGap={2}>
        <CartesianGrid vertical={false} stroke="#222222" strokeDasharray="0" />

        <XAxis
          dataKey="name"
          tick={{ fill: '#6B6860', fontSize: 11, fontFamily: 'Syne' }}
          axisLine={false}
          tickLine={false}
          interval={0}
          tickFormatter={(v: string) =>
            v.length > 10 ? v.slice(0, 10) + '…' : v
          }
        />

        <YAxis
          tickFormatter={(v: number) => formatNumber(v)}
          tick={{ fill: '#6B6860', fontSize: 11, fontFamily: 'Syne' }}
          axisLine={false}
          tickLine={false}
        />

        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />

        <Legend
          wrapperStyle={{ paddingTop: '16px' }}
          formatter={(value) => (
            <span style={{ color: '#6B6860', fontSize: '11px', fontFamily: 'Syne' }}>
              {value === 'tiktok' ? 'TikTok' : 'Instagram'}
            </span>
          )}
        />

        <Bar dataKey="tiktok" name="tiktok" fill="#008cff" radius={0} maxBarSize={40} />
        <Bar dataKey="instagram" name="instagram" fill="rgba(237,232,222,0.4)" radius={0} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  )
}
