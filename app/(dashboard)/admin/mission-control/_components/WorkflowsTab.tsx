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
import type { CronReportData, TaskDefinition } from './MissionControlClient'

interface TabProps {
  data: CronReportData | null
  onRefresh: () => void
}

function getHour(iso?: string | null): number | null {
  if (!iso) return null
  try {
    return new Date(iso).getHours()
  } catch {
    return null
  }
}

function formatTime(iso?: string | null): string {
  if (!iso) return 'Never'
  try {
    return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return iso
  }
}

export function WorkflowsTab({ data, onRefresh }: TabProps) {
  const [runningAll, setRunningAll] = useState(false)

  const tasks: TaskDefinition[] = data?.tasks ?? []

  const handleRunAll = async () => {
    setRunningAll(true)
    setTimeout(() => {
      setRunningAll(false)
      onRefresh()
    }, 2000)
  }

  if (tasks.length === 0) {
    return (
      <div className="rounded-lg bg-[#111111] border border-[#222222] p-8 text-center">
        <Inbox size={32} className="mx-auto text-[#6B6860] mb-3" />
        <p className="text-[#EDE8DE] font-syne font-semibold">No Workflows Configured</p>
        <p className="text-[#6B6860] text-sm mt-1">
          Scheduled tasks and automations will appear here.
        </p>
      </div>
    )
  }

  // Build timeline dots
  const timelineDots: { hour: number; status: 'success' | 'error'; name: string }[] = []
  for (const task of tasks) {
    const h = getHour(task.lastRun)
    if (h !== null && task.lastStatus) {
      timelineDots.push({ hour: h, status: task.lastStatus, name: task.name })
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
          {runningAll ? 'Queuing...' : 'Run All'}
        </button>
      </div>

      {/* Workflow Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="rounded-lg bg-[#111111] border border-[#222222] p-5 space-y-4"
          >
            {/* Card header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-8 h-8 rounded-md bg-[#008cff]/10 text-[#008cff]">
                  <Workflow size={18} />
                </div>
                <div>
                  <p className="text-sm font-syne font-semibold text-[#EDE8DE]">{task.name}</p>
                  <p className="text-xs text-[#6B6860] mt-0.5 flex items-center gap-1">
                    <Clock size={12} />
                    {task.scheduleHuman}
                  </p>
                </div>
              </div>

              {/* Status badge */}
              <div>
                {task.lastStatus === 'success' ? (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                    <CheckCircle2 size={12} />
                    OK
                  </span>
                ) : task.lastStatus === 'error' ? (
                  <span className="inline-flex items-center gap-1 text-xs text-red-400">
                    <XCircle size={12} />
                    Error
                  </span>
                ) : (
                  <span className="text-xs text-[#6B6860]">Pending</span>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-[#6B6860] leading-relaxed">{task.description}</p>

            {/* Meta row */}
            <div className="flex items-center gap-4 text-xs text-[#6B6860]">
              <span className="flex items-center gap-1">
                <Clock size={12} />
                Last: {formatTime(task.lastRun)}
              </span>
              {task.runCount > 0 && (
                <span className="flex items-center gap-1">
                  <Zap size={12} />
                  {task.runCount} run{task.runCount !== 1 ? 's' : ''}
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
                  title={`${dot.name} — ${String(dot.hour).padStart(2, '0')}:00`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 border-[#111111] ${
                      dot.status === 'error' ? 'bg-red-400' : 'bg-emerald-400'
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
