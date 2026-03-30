'use client'

import { useState, useMemo } from 'react'
import {
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Filter,
  RefreshCw,
  Activity,
} from 'lucide-react'
import type { AgentData } from './MissionControlClient'

interface TabProps {
  data: AgentData | null
  executeCommand: (cmd: string) => Promise<{ output: string; exitCode: number }>
  onRefresh: () => void
}

interface LogEntry {
  id: string
  name: string
  timestamp: string
  status: 'success' | 'error' | 'running'
  duration?: number
  tokensUsed?: number
  error?: string
  model?: string
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleString('en-GB', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  } catch {
    return iso
  }
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function formatDuration(ms: number | undefined): string {
  if (!ms) return '--'
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`
}

function formatTokens(n: number | undefined): string {
  if (!n) return '--'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return n.toString()
}

function StatusBadge({ status }: { status: 'success' | 'error' | 'running' }) {
  if (status === 'running') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#008cff]/10 text-[#008cff]">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#008cff] opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#008cff]" />
        </span>
        Running
      </span>
    )
  }
  if (status === 'success') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400">
        <CheckCircle2 size={10} />
        Success
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-500/10 text-red-400">
      <XCircle size={10} />
      Error
    </span>
  )
}

export function CommandTerminalTab({ data, onRefresh }: TabProps) {
  const [filter, setFilter] = useState<string>('all')

  // Build log entries from cron job data and recent tasks in the heartbeat
  const logs = useMemo<LogEntry[]>(() => {
    const entries: LogEntry[] = []

    // From cron jobs in latest heartbeat
    const rawCrons = data?.latest?.crons
    const cronJobs: any[] = Array.isArray(rawCrons) ? rawCrons : (rawCrons?.jobs ?? [])

    for (const job of cronJobs) {
      if (job.lastRun) {
        entries.push({
          id: `cron-${job.id ?? job.name}`,
          name: job.name ?? 'Cron Job',
          timestamp: job.lastRun,
          status: job.lastStatus === 'error' ? 'error' : job.lastStatus === 'running' ? 'running' : 'success',
          duration: job.lastDuration,
          tokensUsed: job.lastTokensUsed,
          error: job.lastError,
          model: job.model,
        })
      }
    }

    // From legacy recentTasks field
    const tasks: any[] = data?.latest?.recentTasks ?? []
    for (const task of tasks) {
      entries.push({
        id: `task-${task.id}`,
        name: task.description ?? task.agent ?? 'Task',
        timestamp: task.completedAt ?? task.startedAt,
        status: task.status === 'failed' ? 'error' : task.status === 'running' ? 'running' : 'success',
        duration: task.duration,
        tokensUsed: task.tokensUsed,
        error: task.error,
        model: task.model,
      })
    }

    // From history heartbeats — extract cron run info
    const history = data?.history ?? []
    for (const h of history.slice(-48)) {
      const hCrons = h.data?.crons
      const hJobs: any[] = Array.isArray(hCrons) ? hCrons : (hCrons?.jobs ?? [])
      for (const job of hJobs) {
        if (job.lastRun && !entries.some((e) => e.id === `hist-${job.name}-${job.lastRun}`)) {
          entries.push({
            id: `hist-${job.name}-${job.lastRun}`,
            name: job.name ?? 'Cron Job',
            timestamp: job.lastRun,
            status: job.lastStatus === 'error' ? 'error' : 'success',
            duration: job.lastDuration,
            tokensUsed: job.lastTokensUsed,
            error: job.lastError,
          })
        }
      }
    }

    // Sort newest first, deduplicate by id
    const seen = new Set<string>()
    return entries
      .filter((e) => {
        if (seen.has(e.id)) return false
        seen.add(e.id)
        return true
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [data])

  // Unique job names for filter dropdown
  const jobNames = useMemo(() => {
    const names = new Set(logs.map((l) => l.name))
    return Array.from(names).sort()
  }, [logs])

  const filtered = filter === 'all' ? logs : logs.filter((l) => l.name === filter)

  // Summary stats
  const successCount = logs.filter((l) => l.status === 'success').length
  const errorCount = logs.filter((l) => l.status === 'error').length
  const runningCount = logs.filter((l) => l.status === 'running').length

  return (
    <div className="space-y-4">
      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-[#111111] border border-[#222222] p-4 flex items-center gap-3">
          <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
          <div>
            <p className="text-xl font-syne font-semibold text-[#EDE8DE]">{successCount}</p>
            <p className="text-[10px] text-[#6B6860] uppercase tracking-wide">Succeeded</p>
          </div>
        </div>
        <div className="rounded-lg bg-[#111111] border border-[#222222] p-4 flex items-center gap-3">
          <XCircle size={18} className="text-red-400 flex-shrink-0" />
          <div>
            <p className="text-xl font-syne font-semibold text-[#EDE8DE]">{errorCount}</p>
            <p className="text-[10px] text-[#6B6860] uppercase tracking-wide">Failed</p>
          </div>
        </div>
        <div className="rounded-lg bg-[#111111] border border-[#222222] p-4 flex items-center gap-3">
          <Activity size={18} className="text-[#008cff] flex-shrink-0" />
          <div>
            <p className="text-xl font-syne font-semibold text-[#EDE8DE]">{runningCount}</p>
            <p className="text-[10px] text-[#6B6860] uppercase tracking-wide">Running</p>
          </div>
        </div>
      </div>

      {/* Log viewer */}
      <div className="rounded-lg bg-[#111111] border border-[#222222] overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#222222]">
          <div className="flex items-center gap-2 text-[#EDE8DE]">
            <FileText size={15} />
            <span className="text-sm font-syne font-semibold">Cron Report Logs</span>
            <span className="text-xs text-[#6B6860] ml-1">({filtered.length} entries)</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Filter dropdown */}
            <div className="flex items-center gap-1.5 text-[#6B6860]">
              <Filter size={13} />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-[#0a0a0a] border border-[#333] text-[#EDE8DE] text-xs rounded px-2 py-1 outline-none focus:border-[#008cff]/50"
              >
                <option value="all">All tasks</option>
                {jobNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            {/* Refresh */}
            <button
              onClick={onRefresh}
              className="flex items-center gap-1 text-xs text-[#6B6860] hover:text-[#EDE8DE] transition-colors px-2 py-1"
            >
              <RefreshCw size={13} />
            </button>
          </div>
        </div>

        {/* Log entries */}
        <div className="divide-y divide-[#1a1a1a] max-h-[560px] overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Clock size={28} className="mx-auto text-[#6B6860] mb-3" />
              <p className="text-[#EDE8DE] font-syne font-semibold text-sm">No logs yet</p>
              <p className="text-[#6B6860] text-xs mt-1">
                Task completions and cron runs will appear here.
              </p>
            </div>
          ) : (
            filtered.map((entry) => (
              <div
                key={entry.id}
                className="px-4 py-3 hover:bg-[#0a0a0a] transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="mt-0.5 flex-shrink-0">
                      {entry.status === 'success' ? (
                        <CheckCircle2 size={14} className="text-emerald-400" />
                      ) : entry.status === 'running' ? (
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-[#008cff] border-t-transparent animate-spin" />
                      ) : (
                        <XCircle size={14} className="text-red-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-[#EDE8DE] font-medium truncate">{entry.name}</p>
                      {entry.error && (
                        <p className="text-xs text-red-400 mt-0.5 truncate">{entry.error}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        {entry.duration !== undefined && (
                          <span className="text-[10px] text-[#6B6860]">
                            {formatDuration(entry.duration)}
                          </span>
                        )}
                        {entry.tokensUsed !== undefined && (
                          <span className="text-[10px] text-[#6B6860]">
                            {formatTokens(entry.tokensUsed)} tokens
                          </span>
                        )}
                        {entry.model && (
                          <span className="text-[10px] text-[#6B6860] font-mono truncate max-w-[140px]">
                            {entry.model}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <StatusBadge status={entry.status} />
                    <span
                      className="text-[10px] text-[#6B6860]"
                      title={formatTime(entry.timestamp)}
                    >
                      {relativeTime(entry.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
