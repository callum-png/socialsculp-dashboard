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
    <div className="bg-white border border-[#e4e7ed] shadow-sm px-3 py-2.5 text-xs font-syne rounded-md">
      <p className="text-[#6b7280] mb-1.5 truncate max-w-[160px]">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 mb-0.5">
          <span
            className="inline-block w-2 h-2 shrink-0 rounded-sm"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-[#6b7280] capitalize">{entry.name}:</span>
          <span className="text-[#111827] font-bold">
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
        <CartesianGrid vertical={false} stroke="#e4e7ed" strokeDasharray="0" />

        <XAxis
          dataKey="name"
          tick={{ fill: '#6b7280', fontSize: 11, fontFamily: 'Syne' }}
          axisLine={false}
          tickLine={false}
          interval={0}
          tickFormatter={(v: string) =>
            v.length > 10 ? v.slice(0, 10) + '…' : v
          }
        />

        <YAxis
          tickFormatter={(v: number) => formatNumber(v)}
          tick={{ fill: '#6b7280', fontSize: 11, fontFamily: 'Syne' }}
          axisLine={false}
          tickLine={false}
        />

        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />

        <Legend
          wrapperStyle={{ paddingTop: '16px' }}
          formatter={(value) => (
            <span style={{ color: '#6b7280', fontSize: '11px', fontFamily: 'Syne' }}>
              {value === 'tiktok' ? 'TikTok' : 'Instagram'}
            </span>
          )}
        />

        <Bar dataKey="tiktok" name="tiktok" fill="#008cff" radius={[3,3,0,0]} maxBarSize={40} />
        <Bar dataKey="instagram" name="instagram" fill="#e1306c" radius={[3,3,0,0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  )
}
