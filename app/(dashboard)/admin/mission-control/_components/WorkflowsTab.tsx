'use client'

import { useState } from 'react'
import {
  Play,
  Clock,
  CheckCircle2,
  XCircle,
  Zap,
  RotateCcw,
  Workflow,
  Inbox,
} from 'lucide-react'
import type { AgentData } from './MissionControlClient'

interface TabProps {
  data: AgentData | null
  executeCommand: (cmd: string) => Promise<{ output: string; exitCode: number }>
  onRefresh: () => void
}

interface CronJob {
  name: string
  schedule: string
  enabled: boolean
  lastRun?: string
  lastStatus?: 'success' | 'failed'
  runCount?: number
}

/** Parse a cron schedule string into something human-readable. */
function humanCron(schedule: string): string {
  if (!schedule) return schedule
  const parts = schedule.trim().split(/\s+/)
  if (parts.length < 5) return schedule

  const [min, hour, dom, mon, dow] = parts

  // Every N minutes
  if (min.startsWith('*/') && hour === '*') {
    return `Every ${min.slice(2)} minutes`
  }

  // Hourly
  if (min !== '*' && hour === '*' && dom === '*' && mon === '*' && dow === '*') {
    return `Hourly at :${min.padStart(2, '0')}`
  }

  // Daily at specific time
  if (min !== '*' && hour !== '*' && dom === '*' && mon === '*' && dow === '*') {
    const h = parseInt(hour, 10)
    const m = parseInt(min, 10)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
    return `Daily at ${h12}:${String(m).padStart(2, '0')} ${ampm}`
  }

  // Weekdays
  if (dow === '1-5' && dom === '*' && mon === '*') {
    const h = parseInt(hour, 10)
    const m = parseInt(min, 10)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
    return `Weekdays at ${h12}:${String(m).padStart(2, '0')} ${ampm}`
  }

  return schedule
}

/** Get the hour from a lastRun ISO timestamp, or null. */
function getHour(iso?: string): number | null {
  if (!iso) return null
  try {
    return new Date(iso).getHours()
  } catch {
    return null
  }
}

function formatTime(iso?: string): string {
  if (!iso) return 'Never'
  try {
    const d = new Date(iso)
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return iso
  }
}

export function WorkflowsTab({ data, executeCommand, onRefresh }: TabProps) {
  const [runningAll, setRunningAll] = useState(false)

  // v2 payload sends { jobs: [], total: 0 }, legacy sends CronJob[]
  const rawCrons = data?.latest?.crons
  const crons: CronJob[] = (Array.isArray(rawCrons) ? rawCrons : (rawCrons as any)?.jobs ?? []) as CronJob[]

  const handleRunAll = async () => {
    setRunningAll(true)
    try {
      await executeCommand('cron:run-all')
      onRefresh()
    } catch {
      // swallow
    } finally {
      setRunningAll(false)
    }
  }

  if (!data?.latest || crons.length === 0) {
    return (
      <div className="rounded-lg bg-[#111111] border border-[#222222] p-8 text-center">
        <Inbox size={32} className="mx-auto text-[#6B6860] mb-3" />
        <p className="text-[#EDE8DE] font-syne font-semibold">No Workflows Configured</p>
        <p className="text-[#6B6860] text-sm mt-1">
          Cron jobs and automations will appear here once active workflows are configured.
        </p>
      </div>
    )
  }

  // Build timeline dots from lastRun timestamps
  const timelineDots: { hour: number; status: 'success' | 'failed'; name: string }[] = []
  for (const cron of crons) {
    const h = getHour(cron.lastRun)
    if (h !== null) {
      timelineDots.push({
        hour: h,
        status: cron.lastStatus ?? 'success',
        name: cron.name,
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Run All button */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-syne font-semibold text-[#6B6860] uppercase tracking-wide">
          Active Workflows
        </h3>
        <button
          onClick={handleRunAll}
          disabled={runningAll}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-syne font-semibold bg-[#008cff] text-white hover:bg-[#008cff]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {runningAll ? (
            <RotateCcw size={14} className="animate-spin" />
          ) : (
            <Play size={14} />
          )}
          {runningAll ? 'Running...' : 'Run All'}
        </button>
      </div>

      {/* Workflow Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {crons.map((cron, i) => (
          <div
            key={i}
            className="rounded-lg bg-[#111111] border border-[#222222] p-5 space-y-4"
          >
            {/* Card header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-8 h-8 rounded-md bg-[#008cff]/10 text-[#008cff]">
                  <Workflow size={18} />
                </div>
                <div>
                  <p className="text-sm font-syne font-semibold text-[#EDE8DE]">{cron.name}</p>
                  <p className="text-xs text-[#6B6860] mt-0.5 flex items-center gap-1">
                    <Clock size={12} />
                    {humanCron(cron.schedule)}
                  </p>
                </div>
              </div>

              {/* Toggle pill */}
              <div
                className={`relative w-9 h-5 rounded-full transition-colors ${
                  cron.enabled ? 'bg-[#008cff]' : 'bg-[#222222]'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    cron.enabled ? 'left-[18px]' : 'left-0.5'
                  }`}
                />
              </div>
            </div>

            {/* Meta row */}
            <div className="flex items-center gap-4 text-xs text-[#6B6860]">
              <span className="flex items-center gap-1">
                {cron.lastStatus === 'failed' ? (
                  <XCircle size={14} className="text-red-400" />
                ) : (
                  <CheckCircle2 size={14} className="text-emerald-400" />
                )}
                Last: {formatTime(cron.lastRun)}
              </span>

              {typeof cron.runCount === 'number' && (
                <span className="flex items-center gap-1">
                  <Zap size={14} />
                  {cron.runCount} runs
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Execution Timeline */}
      <div className="rounded-lg bg-[#111111] border border-[#222222] p-5">
        <h4 className="text-xs font-syne font-semibold text-[#6B6860] uppercase tracking-wide mb-4">
          Today&apos;s Execution Timeline
        </h4>

        {timelineDots.length === 0 ? (
          <p className="text-sm text-[#6B6860]">No executions today.</p>
        ) : (
          <div className="relative">
            {/* 24h bar */}
            <div className="h-1 rounded-full bg-[#222222] w-full" />

            {/* Hour labels */}
            <div className="flex justify-between mt-1.5 text-[10px] text-[#6B6860]">
              {[0, 6, 12, 18, 23].map((h) => (
                <span key={h}>{String(h).padStart(2, '0')}:00</span>
              ))}
            </div>

            {/* Dots */}
            {timelineDots.map((dot, i) => {
              const leftPct = (dot.hour / 23) * 100
              return (
                <div
                  key={i}
                  className="absolute -top-1.5 group"
                  style={{ left: `${leftPct}%` }}
                  title={`${dot.name} - ${String(dot.hour).padStart(2, '0')}:00`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 border-[#111111] ${
                      dot.status === 'failed' ? 'bg-red-400' : 'bg-emerald-400'
                    }`}
                  />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
