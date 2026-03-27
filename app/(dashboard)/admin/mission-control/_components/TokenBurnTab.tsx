'use client'

import { useMemo } from 'react'
import { Flame, Coins, Info, TrendingUp } from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { OpenClawData } from './MissionControlClient'

interface TabProps {
  data: OpenClawData | null
  executeCommand: (cmd: string) => Promise<{ output: string; exitCode: number }>
  onRefresh: () => void
}

function formatTokens(n: number | null | undefined): string {
  if (n == null) return '—'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return n.toString()
}

function formatCost(n: number | null | undefined): string {
  if (n == null) return '—'
  return `$${n.toFixed(2)}`
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return iso
  }
}

interface PeriodData {
  input?: number
  output?: number
  total?: number
  estimatedCost?: number
}

function SummaryCard({
  label,
  period,
}: {
  label: string
  period: PeriodData | null | undefined
}) {
  return (
    <div className="rounded-lg bg-[#111111] border border-[#222222] p-5">
      <p className="text-xs font-medium text-[#6B6860] uppercase tracking-wide font-syne mb-3">
        {label}
      </p>
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-2xl font-semibold text-[#EDE8DE] font-syne">
          {formatTokens(period?.total)}
        </span>
        <span className="text-sm text-[#6B6860]">tokens</span>
      </div>
      <div className="flex items-center gap-1.5 mb-3">
        <Coins size={14} className="text-[#008cff]" />
        <span className="text-sm font-medium text-[#008cff]">
          {formatCost(period?.estimatedCost)}
        </span>
      </div>
      <div className="flex gap-4 text-xs text-[#6B6860]">
        <div>
          <span className="block text-[#EDE8DE]/60">{formatTokens(period?.input)}</span>
          <span>input</span>
        </div>
        <div>
          <span className="block text-[#EDE8DE]/60">{formatTokens(period?.output)}</span>
          <span>output</span>
        </div>
      </div>
    </div>
  )
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg bg-[#111111] border border-[#222222] px-4 py-3 shadow-xl">
      <p className="text-xs text-[#6B6860] mb-1.5">{label}</p>
      <p className="text-sm font-medium text-[#EDE8DE]">
        {formatTokens(payload[0]?.value)} tokens
      </p>
    </div>
  )
}

const MODEL_PRICING = [
  { model: 'GPT-4o-mini', input: '$0.15', output: '$0.60' },
  { model: 'GPT-4o', input: '$2.50', output: '$10.00' },
  { model: 'Claude Sonnet', input: '$3.00', output: '$15.00' },
]

export function TokenBurnTab({ data }: TabProps) {
  const tokenUsage = data?.latest?.tokenUsage ?? null

  const chartData = useMemo(() => {
    if (!data?.history?.length) return []
    return data.history
      .slice(-48)
      .map((entry) => ({
        time: formatTime(entry.receivedAt),
        tokens: entry.data?.tokenUsage?.today?.total ?? 0,
      }))
  }, [data?.history])

  if (!data) {
    return (
      <div className="rounded-lg bg-[#111111] border border-[#222222] p-8 text-center">
        <Flame size={24} className="mx-auto text-[#6B6860] mb-3" />
        <p className="text-[#6B6860] text-sm">Waiting for data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard label="Today" period={tokenUsage?.today} />
        <SummaryCard label="This Week" period={tokenUsage?.week} />
        <SummaryCard label="This Month" period={tokenUsage?.month} />
      </div>

      {/* Usage Chart */}
      <div className="rounded-lg bg-[#111111] border border-[#222222] p-5">
        <div className="flex items-center gap-3 mb-5">
          <TrendingUp size={18} className="text-[#008cff]" />
          <h3 className="text-[#EDE8DE] font-syne font-semibold">Token Usage (Last 24h)</h3>
        </div>

        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="tokenFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#008cff" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="#008cff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#222222" vertical={false} />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 11, fill: '#6B6860' }}
                axisLine={{ stroke: '#222222' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#6B6860' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => formatTokens(v)}
                width={50}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#222222' }} />
              <Area
                type="monotone"
                dataKey="tokens"
                stroke="#008cff"
                strokeWidth={2}
                fill="url(#tokenFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[280px] flex items-center justify-center">
            <p className="text-[#6B6860] text-sm">No chart data available yet</p>
          </div>
        )}
      </div>

      {/* Model Cost Reference */}
      <div className="rounded-lg bg-[#111111] border border-[#222222] p-5">
        <div className="flex items-center gap-3 mb-4">
          <Info size={18} className="text-[#6B6860]" />
          <h3 className="text-[#EDE8DE] font-syne font-semibold text-sm">
            Model Cost Reference
          </h3>
          <span className="text-[10px] text-[#6B6860]">per 1M tokens</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {MODEL_PRICING.map(({ model, input, output }) => (
            <div
              key={model}
              className="flex items-center justify-between px-4 py-3 rounded-md bg-[#090909] border border-[#222222]"
            >
              <span className="text-sm text-[#EDE8DE]/80">{model}</span>
              <div className="text-xs text-[#6B6860] space-x-1.5">
                <span className="text-emerald-400/70">{input}</span>
                <span>/</span>
                <span className="text-orange-400/70">{output}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
