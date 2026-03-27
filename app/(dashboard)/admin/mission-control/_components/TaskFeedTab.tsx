'use client'

import { useState } from 'react'
import { Loader2, CheckCircle2, XCircle, ListFilter, Clock, Zap, BrainCircuit } from 'lucide-react'
import type { OpenClawData } from './MissionControlClient'

interface TabProps {
  data: OpenClawData | null
  executeCommand: (cmd: string) => Promise<{ output: string; exitCode: number }>
  onRefresh: () => void
}

function formatDuration(ms: number | undefined): string {
  if (!ms && ms !== 0) return '--'
  const totalSeconds = Math.floor(ms / 1000)
  if (totalSeconds < 60) return `${totalSeconds}s`
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  if (minutes < 60) return `${minutes}m ${seconds}s`
  const hours = Math.floor(minutes / 60)
  const remainMinutes = minutes % 60
  return `${hours}h ${remainMinutes}m`
}

function formatTokens(count: number | undefined): string {
  if (!count && count !== 0) return '--'
  if (count < 1000) return `${count}`
  if (count < 1_000_000) return `${(count / 1000).toFixed(1)}k`
  return `${(count / 1_000_000).toFixed(2)}M`
}

function relativeTime(timestamp: string | undefined): string {
  if (!timestamp) return '--'
  const diff = Date.now() - new Date(timestamp).getTime()
  if (diff < 0) return 'just now'
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function statusColor(status: string): string {
  if (status === 'running') return 'text-[#008cff]'
  if (status === 'completed') return 'text-green-400'
  if (status === 'failed') return 'text-red-400'
  return 'text-[#6B6860]'
}

function statusBorderColor(status: string): string {
  if (status === 'running') return 'border-l-[#008cff]'
  if (status === 'completed') return 'border-l-green-400'
  if (status === 'failed') return 'border-l-red-400'
  return 'border-l-[#6B6860]'
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'running') return <Loader2 size={16} className="text-[#008cff] animate-spin" />
  if (status === 'completed') return <CheckCircle2 size={16} className="text-green-400" />
  if (status === 'failed') return <XCircle size={16} className="text-red-400" />
  return <Clock size={16} className="text-[#6B6860]" />
}

export function TaskFeedTab({ data }: TabProps) {
  const [agentFilter, setAgentFilter] = useState<string>('all')

  const tasks: any[] = data?.latest?.recentTasks ?? []

  const agents = Array.from(new Set(tasks.map((t: any) => t.agent).filter(Boolean)))
  const filterOptions = ['all', ...agents]

  const filtered = agentFilter === 'all'
    ? tasks
    : tasks.filter((t: any) => t.agent === agentFilter)

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="rounded-lg bg-[#111111] border border-[#222222] p-3 flex items-center gap-2 flex-wrap">
        <ListFilter size={16} className="text-[#6B6860]" />
        {filterOptions.map((opt) => (
          <button
            key={opt}
            onClick={() => setAgentFilter(opt)}
            className={`px-3 py-1 text-xs font-syne rounded-md border transition-colors ${
              agentFilter === opt
                ? 'bg-[#008cff]/15 text-[#008cff] border-[#008cff]/30'
                : 'bg-transparent text-[#6B6860] border-[#222222] hover:text-[#EDE8DE] hover:border-[#333333]'
            }`}
          >
            {opt === 'all' ? 'All' : opt}
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <div className="rounded-lg bg-[#111111] border border-[#222222] p-10 text-center">
            <p className="text-[#6B6860] text-sm font-syne">No recent tasks</p>
          </div>
        ) : (
          filtered.map((task: any, i: number) => (
            <div
              key={task.id ?? i}
              className={`rounded-lg bg-[#111111] border border-[#222222] border-l-2 ${statusBorderColor(task.status)} p-4`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <StatusIcon status={task.status} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span
                      className="text-[10px] font-syne font-medium px-1.5 py-0.5 rounded bg-[#222222] text-[#6B6860]"
                    >
                      {task.agent ?? 'unknown'}
                    </span>
                    {task.model && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#222222] text-[#6B6860] flex items-center gap-1">
                        <BrainCircuit size={10} />
                        {task.model}
                      </span>
                    )}
                    <span className="text-[#6B6860] text-[10px] ml-auto whitespace-nowrap">
                      {relativeTime(task.startedAt ?? task.timestamp)}
                    </span>
                  </div>

                  <p className="text-sm text-[#EDE8DE] truncate">{task.description ?? task.task ?? 'Untitled task'}</p>

                  <div className="flex items-center gap-4 mt-2">
                    {task.duration !== undefined && (
                      <span className="text-[#6B6860] text-xs flex items-center gap-1">
                        <Clock size={12} />
                        {formatDuration(task.duration)}
                      </span>
                    )}
                    {task.tokensUsed !== undefined && (
                      <span className="text-[#6B6860] text-xs flex items-center gap-1">
                        <Zap size={12} />
                        {formatTokens(task.tokensUsed)} tokens
                      </span>
                    )}
                    <span className={`text-xs font-medium ml-auto ${statusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
