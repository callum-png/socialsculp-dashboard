'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts'

interface EngagementDataPoint {
  date: string
  tiktok: number
  instagram: number
}

interface Props {
  data: EngagementDataPoint[]
  height?: number
}

function formatXLabel(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatYLabel(v: number) {
  return `${v.toFixed(1)}%`
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) {
  if (!active || !payload || payload.length === 0) return null

  return (
    <div className="bg-[#1A1A1A] border border-[#222222] px-3 py-2.5 text-xs font-syne">
      <p className="text-[#6B6860] mb-1.5">
        {label ? formatXLabel(label) : ''}
      </p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 mb-0.5">
          <span
            className="inline-block w-2 h-2 shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-[#6B6860] capitalize">{entry.name}:</span>
          <span className="text-[#EDE8DE] font-bold">
            {typeof entry.value === 'number' ? `${entry.value.toFixed(1)}%` : entry.value}
          </span>
        </div>
      ))}
    </div>
  )
}

function CustomDot(props: { cx?: number; cy?: number; stroke?: string }) {
  const { cx, cy, stroke } = props
  if (cx == null || cy == null) return null
  return <circle cx={cx} cy={cy} r={3} fill={stroke} stroke="none" />
}

export function EngagementLineChart({ data, height = 260 }: Props) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#222222" strokeDasharray="0" />

        <XAxis
          dataKey="date"
          tickFormatter={formatXLabel}
          tick={{ fill: '#6B6860', fontSize: 11, fontFamily: 'Syne' }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />

        <YAxis
          tickFormatter={formatYLabel}
          tick={{ fill: '#6B6860', fontSize: 11, fontFamily: 'Syne' }}
          axisLine={false}
          tickLine={false}
        />

        <Tooltip content={<CustomTooltip />} />

        <Legend
          wrapperStyle={{ paddingTop: '16px' }}
          formatter={(value) => (
            <span style={{ color: '#6B6860', fontSize: '11px', fontFamily: 'Syne' }}>
              {value === 'tiktok' ? 'TikTok' : 'Instagram'}
            </span>
          )}
        />

        <Line
          type="monotone"
          dataKey="tiktok"
          name="tiktok"
          stroke="#C9FF47"
          strokeWidth={2}
          dot={<CustomDot stroke="#C9FF47" />}
          activeDot={{ r: 4, fill: '#C9FF47', strokeWidth: 0 }}
        />

        <Line
          type="monotone"
          dataKey="instagram"
          name="instagram"
          stroke="rgba(237, 232, 222, 0.6)"
          strokeWidth={2}
          dot={<CustomDot stroke="rgba(237, 232, 222, 0.6)" />}
          activeDot={{ r: 4, fill: '#EDE8DE', strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
