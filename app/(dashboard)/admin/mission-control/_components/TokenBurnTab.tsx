'use client'

import { useMemo } from 'react'
import { Flame, Coins, Info, TrendingUp, Zap } from 'lucide-react'
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
  return `$${n.toFixed(4)}`
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return iso
  }
}

// Rough cost estimates per 1M tokens
const MODEL_COSTS: Record<string, { input: number; output: number }> = {
  'ollama': { input: 0, output: 0 }, // local models are free
  'gpt-4o-mini': { input: 0.15, output: 0.60 },
  'gpt-4o': { input: 2.50, output: 10.00 },
  'claude-sonnet': { input: 3.00, output: 15.00 },
  'claude-opus': { input: 15.00, output: 75.00 },
  'claude-haiku': { input: 0.25, output: 1.25 },
}

function estimateCostForSession(session: any): number {
  const model = (session.model || '').toLowerCase()
  let pricing = { input: 0.15, output: 0.60 } // default to cheap model

  for (const [key, costs] of Object.entries(MODEL_COSTS)) {
    if (model.includes(key)) {
      pricing = costs
      break
    }
  }

  const inputCost = (session.inputTokens || 0) * (pricing.input / 1_000_000)
  const outputCost = (session.outputTokens || 0) * (pricing.output / 1_000_000)
  return inputCost + outputCost
}

interface PeriodData {
  input: number
  output: number
  total: number
  estimatedCost: number
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

export function TokenBurnTab({ data }: TabProps) {
  // v2 payload: aggregate from sessions[]; legacy: use tokenUsage directly
  const legacyTokenUsage = data?.latest?.tokenUsage ?? null
  const sessions: any[] = data?.latest?.sessions ?? []

  const sessionTokens = useMemo((): PeriodData | null => {
    if (sessions.length === 0) return null
    let input = 0, output = 0, total = 0, cost = 0
    for (const s of sessions) {
      input += s.inputTokens || 0
      output += s.outputTokens || 0
      total += s.totalTokens || 0
      cost += estimateCostForSession(s)
    }
    return { input, output, total, estimatedCost: cost }
  }, [sessions])

  // Per-model breakdown from sessions
  const modelBreakdown = useMemo(() => {
    if (sessions.length === 0) return []
    const byModel: Record<string, { input: number; output: number; total: number; cost: number; count: number }> = {}
    for (const s of sessions) {
      const key = s.model || 'unknown'
      if (!byModel[key]) byModel[key] = { input: 0, output: 0, total: 0, cost: 0, count: 0 }
      byModel[key].input += s.inputTokens || 0
      byModel[key].output += s.outputTokens || 0
      byModel[key].total += s.totalTokens || 0
      byModel[key].cost += estimateCostForSession(s)
      byModel[key].count++
    }
    return Object.entries(byModel)
      .map(([model, data]) => ({ model, ...data }))
      .sort((a, b) => b.total - a.total)
  }, [sessions])

  const chartData = useMemo(() => {
    if (!data?.history?.length) return []
    return data.history
      .slice(-48)
      .map((entry) => {
        // v2: sum sessions tokens; legacy: use tokenUsage.today.total
        const entrySessions = entry.data?.sessions ?? []
        const legacyTotal = entry.data?.tokenUsage?.today?.total ?? 0
        const sessionTotal = entrySessions.reduce((sum: number, s: any) => sum + (s.totalTokens || 0), 0)
        return {
          time: formatTime(entry.receivedAt),
          tokens: sessionTotal > 0 ? sessionTotal : legacyTotal,
        }
      })
  }, [data?.history])

  if (!data) {
    return (
      <div className="rounded-lg bg-[#111111] border border-[#222222] p-8 text-center">
        <Flame size={24} className="mx-auto text-[#6B6860] mb-3" />
        <p className="text-[#6B6860] text-sm">Waiting for data...</p>
      </div>
    )
  }

  // Use session-derived data if available, fall back to legacy
  const hasSessionData = sessionTokens && sessionTokens.total > 0

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {hasSessionData ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SummaryCard label="Active Sessions" period={sessionTokens} />
          <div className="rounded-lg bg-[#111111] border border-[#222222] p-5">
            <p className="text-xs font-medium text-[#6B6860] uppercase tracking-wide font-syne mb-3">
              Sessions
            </p>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-2xl font-semibold text-[#EDE8DE] font-syne">
                {sessions.length}
              </span>
              <span className="text-sm text-[#6B6860]">active</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap size={14} className="text-[#008cff]" />
              <span className="text-sm font-medium text-[#008cff]">
                {formatCost(sessionTokens?.estimatedCost)} est. cost
              </span>
            </div>
          </div>
          <div className="rounded-lg bg-[#111111] border border-[#222222] p-5">
            <p className="text-xs font-medium text-[#6B6860] uppercase tracking-wide font-syne mb-3">
              Cache Efficiency
            </p>
            {(() => {
              const totalCache = sessions.reduce((sum: number, s: any) => sum + (s.cacheRead || 0), 0)
              const totalInput = sessions.reduce((sum: number, s: any) => sum + (s.inputTokens || 0), 0)
              const cacheRate = totalInput > 0 ? ((totalCache / (totalInput + totalCache)) * 100) : 0
              return (
                <>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-2xl font-semibold text-emerald-400 font-syne">
                      {cacheRate.toFixed(1)}%
                    </span>
                    <span className="text-sm text-[#6B6860]">cache hit</span>
                  </div>
                  <p className="text-xs text-[#6B6860]">
                    {formatTokens(totalCache)} tokens served from cache
                  </p>
                </>
              )
            })()}
          </div>
        </div>
      ) : legacyTokenUsage ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SummaryCard label="Today" period={legacyTokenUsage?.today} />
          <SummaryCard label="This Week" period={legacyTokenUsage?.week} />
          <SummaryCard label="This Month" period={legacyTokenUsage?.month} />
        </div>
      ) : (
        <div className="rounded-lg bg-[#111111] border border-[#222222] p-8 text-center">
          <Zap size={24} className="mx-auto text-[#6B6860] mb-3" />
          <p className="text-[#EDE8DE] font-syne font-semibold">No Token Data</p>
          <p className="text-[#6B6860] text-sm mt-1">
            No active sessions or token usage data available yet.
          </p>
        </div>
      )}

      {/* Per-model breakdown */}
      {modelBreakdown.length > 0 && (
        <div className="rounded-lg bg-[#111111] border border-[#222222] p-5">
          <div className="flex items-center gap-3 mb-4">
            <Flame size={18} className="text-orange-400" />
            <h3 className="text-[#EDE8DE] font-syne font-semibold">Token Burn by Model</h3>
          </div>
          <div className="space-y-3">
            {modelBreakdown.map(({ model, input, output, total, cost, count }) => (
              <div key={model} className="flex items-center gap-4 px-4 py-3 rounded-md bg-[#090909] border border-[#222222]">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#EDE8DE] font-mono truncate">{model}</p>
                  <p className="text-[10px] text-[#6B6860]">{count} session{count !== 1 ? 's' : ''}</p>
                </div>
                <div className="text-right text-xs">
                  <p className="text-[#EDE8DE]">{formatTokens(total)} tokens</p>
                  <p className="text-[#6B6860]">{formatTokens(input)} in / {formatTokens(output)} out</p>
                </div>
                <div className="text-right min-w-[70px]">
                  <p className="text-sm font-medium text-[#008cff]">{formatCost(cost)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
          {[
            { model: 'Ollama (local)', input: 'Free', output: 'Free' },
            { model: 'GPT-4o-mini', input: '$0.15', output: '$0.60' },
            { model: 'GPT-4o', input: '$2.50', output: '$10.00' },
            { model: 'Claude Haiku', input: '$0.25', output: '$1.25' },
            { model: 'Claude Sonnet', input: '$3.00', output: '$15.00' },
            { model: 'Claude Opus', input: '$15.00', output: '$75.00' },
          ].map(({ model, input, output }) => (
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
