'use client'

import { useState } from 'react'
import { Play, Clock, CheckCircle2, XCircle, CalendarClock, ChevronDown, ChevronRight, Timer } from 'lucide-react'
import type { CronReportData, TaskDefinition } from './MissionControlClient'

interface TabProps {
  data: CronReportData | null
  onRefresh: () => void
}

function relativeTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  const now = Date.now()
  const then = new Date(iso).getTime()
  const diffMs = now - then
  const future = diffMs < 0
  const abs = Math.abs(diffMs)
  const minutes = Math.floor(abs / 60000)
  const hours = Math.floor(abs / 3600000)
  const days = Math.floor(abs / 86400000)
  if (minutes < 1) return future ? 'in <1m' : 'just now'
  if (minutes < 60) return future ? `in ${minutes}m` : `${minutes}m ago`
  if (hours < 24) return future ? `in ${hours}h` : `${hours}h ago`
  return future ? `in ${days}d` : `${days}d ago`
}

function StatusBadge({ status }: { status: TaskDefinition['lastStatus'] }) {
  if (!status) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#222222] text-[#6B6860]">
        Pending
      </span>
    )
  }
  if (status === 'success') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">
        <CheckCircle2 size={12} />
        Success
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400">
      <XCircle size={12} />
      Error
    </span>
  )
}

function TaskRow({ task }: { task: TaskDefinition }) {
  const [expanded, setExpanded] = useState(false)
  const [running, setRunning] = useState(false)
  const isOnDemand = task.schedule === 'on-demand'

  const handleRunNow = () => {
    setRunning(true)
    setTimeout(() => setRunning(false), 2000)
  }

  return (
    <>
      <tr className="hover:bg-[#1a1a1a] transition-colors cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <td className="px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0 text-[#6B6860]">
              {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </div>
            <Timer size={14} className="text-[#6B6860] flex-shrink-0" />
            <div>
              <span className="text-[#EDE8DE] text-sm font-medium">{task.name}</span>
              <p className="text-[#6B6860] text-xs mt-0.5">{task.description}</p>
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-1.5">
            <Clock size={12} className="text-[#6B6860] flex-shrink-0" />
            <span className="text-xs text-[#EDE8DE]/70">{task.scheduleHuman}</span>
          </div>
          {!isOnDemand && (
            <code className="text-[10px] text-[#6B6860] font-mono mt-0.5 block">{task.schedule}</code>
          )}
        </td>
        <td className="px-6 py-4 text-sm text-[#6B6860]">
          {relativeTime(task.lastRun)}
        </td>
        <td className="px-6 py-4 text-sm text-[#6B6860]">
          {isOnDemand ? '—' : relativeTime(task.nextRun)}
        </td>
        <td className="px-6 py-4">
          <StatusBadge status={task.lastStatus} />
        </td>
        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={handleRunNow}
            disabled={running}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium
              bg-[#008cff]/10 text-[#008cff] hover:bg-[#008cff]/20
              disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Play size={12} />
            {running ? 'Queued' : 'Run Now'}
          </button>
        </td>
      </tr>

      {/* Expanded summary row */}
      {expanded && (
        <tr className="bg-[#0d0d0d]">
          <td colSpan={6} className="px-6 py-4 border-t border-[#222222]">
            {task.lastSummary ? (
              <div className="space-y-3">
                <p className="text-xs font-syne font-semibold text-[#6B6860] uppercase tracking-wide">Last Run Summary</p>
                <p className="text-sm text-[#EDE8DE]/80 leading-relaxed">{task.lastSummary}</p>
                {task.lastDetails && (
                  <pre className="text-xs text-[#EDE8DE]/60 font-mono whitespace-pre-wrap bg-[#090909] rounded-md p-3 border border-[#222222] max-h-48 overflow-auto">
                    {task.lastDetails}
                  </pre>
                )}
              </div>
            ) : (
              <p className="text-sm text-[#6B6860]">No run history yet.</p>
            )}
          </td>
        </tr>
      )}
    </>
  )
}

export function CronJobsTab({ data, onRefresh }: TabProps) {
  if (!data) {
    return (
      <div className="rounded-lg bg-[#111111] border border-[#222222] p-8 text-center">
        <Clock size={24} className="mx-auto text-[#6B6860] mb-3" />
        <p className="text-[#6B6860] text-sm">Loading task definitions...</p>
      </div>
    )
  }

  const tasks = data.tasks

  if (tasks.length === 0) {
    return (
      <div className="rounded-lg bg-[#111111] border border-[#222222] p-12 text-center">
        <CalendarClock size={32} className="mx-auto text-[#6B6860] mb-4" />
        <p className="text-[#EDE8DE] font-syne font-semibold text-lg">No Tasks Defined</p>
        <p className="text-[#6B6860] text-sm mt-1">
          Seed public/cron-reports/latest-status.json to define scheduled tasks.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg bg-[#111111] border border-[#222222] overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#222222] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarClock size={18} className="text-[#008cff]" />
          <h3 className="text-[#EDE8DE] font-syne font-semibold">Scheduled Tasks</h3>
          <span className="text-xs text-[#6B6860] bg-[#222222] px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={onRefresh}
          className="text-xs text-[#6B6860] hover:text-[#EDE8DE] transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#222222]">
              <th className="text-left text-xs font-medium text-[#6B6860] uppercase tracking-wide px-6 py-3 font-syne">
                Task
              </th>
              <th className="text-left text-xs font-medium text-[#6B6860] uppercase tracking-wide px-6 py-3 font-syne">
                Schedule
              </th>
              <th className="text-left text-xs font-medium text-[#6B6860] uppercase tracking-wide px-6 py-3 font-syne">
                Last Run
              </th>
              <th className="text-left text-xs font-medium text-[#6B6860] uppercase tracking-wide px-6 py-3 font-syne">
                Next Run
              </th>
              <th className="text-left text-xs font-medium text-[#6B6860] uppercase tracking-wide px-6 py-3 font-syne">
                Status
              </th>
              <th className="text-right text-xs font-medium text-[#6B6860] uppercase tracking-wide px-6 py-3 font-syne">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222222]">
            {tasks.map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
