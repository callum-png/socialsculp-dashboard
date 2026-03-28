'use client'

import { useState } from 'react'
import { Loader2, CheckCircle2, XCircle, ListFilter, Clock, Zap, BrainCircuit, Activity } from 'lucide-react'
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

function relativeTime(timestamp: string | number | undefined): string {
  if (!timestamp) return '--'
  const ts = typeof timestamp === 'number' ? timestamp : new Date(timestamp).getTime()
  const diff = Date.now() - ts
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

function percentBar(pct: number): string {
  if (pct < 50) return 'bg-green-400'
  if (pct < 80) return 'bg-yellow-400'
  return 'bg-red-400'
}

export function TaskFeedTab({ data }: TabProps) {
  const [agentFilter, setAgentFilter] = useState<string>('all')

  // v2 uses sessions[], legacy uses recentTasks[]
  const sessions: any[] = data?.latest?.sessions ?? []
  const legacyTasks: any[] = data?.latest?.recentTasks ?? []

  // If we have sessions, show session view; otherwise fall back to legacy tasks
  const hasSessions = sessions.length > 0
  const items = hasSessions ? sessions : legacyTasks

  const agents = Array.from(new Set(items.map((t: any) => t.agentId ?? t.agent).filter(Boolean)))
  const filterOptions = ['all', ...agents]

  const filtered = agentFilter === 'all'
    ? items
    : items.filter((t: any) => (t.agentId ?? t.agent) === agentFilter)

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

      {/* Session/Task list */}
      <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <div className="rounded-lg bg-[#111111] border border-[#222222] p-10 text-center">
            <Activity size={24} className="mx-auto text-[#6B6860] mb-3" />
            <p className="text-[#6B6860] text-sm font-syne">
              {hasSessions ? 'No recent sessions' : 'No recent tasks'}
            </p>
          </div>
        ) : hasSessions ? (
          /* v2 Session cards */
          filtered.map((session: any, i: number) => (
            <div
              key={session.key ?? i}
              className="rounded-lg bg-[#111111] border border-[#222222] border-l-2 border-l-[#008cff] p-4"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <Activity size={16} className="text-[#008cff]" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[10px] font-syne font-medium px-1.5 py-0.5 rounded bg-[#222222] text-[#6B6860]">
                      {session.agentId ?? 'unknown'}
                    </span>
                    {session.model && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#222222] text-[#6B6860] flex items-center gap-1">
                        <BrainCircuit size={10} />
                        {session.model}
                      </span>
                    )}
                    {session.kind && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#222222] text-[#6B6860]">
                        {session.kind}
                      </span>
                    )}
                    <span className="text-[#6B6860] text-[10px] ml-auto whitespace-nowrap">
                      {relativeTime(session.updatedAt)}
                    </span>
                  </div>

                  <p className="text-sm text-[#EDE8DE] font-mono truncate">{session.key}</p>

                  {/* Context usage bar */}
                  {session.percentUsed != null && session.percentUsed > 0 && (
                    <div className="mt-2">
                      <div className="flex justify-between text-[10px] text-[#6B6860] mb-1">
                        <span>Context: {session.percentUsed.toFixed(1)}%</span>
                        <span>{formatTokens(session.remainingTokens)} remaining</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#222222] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${percentBar(session.percentUsed)}`}
                          style={{ width: `${Math.min(session.percentUsed, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    {session.ageMs != null && (
                      <span className="text-[#6B6860] text-xs flex items-center gap-1">
                        <Clock size={12} />
                        {formatDuration(session.ageMs)}
                      </span>
                    )}
                    <span className="text-[#6B6860] text-xs flex items-center gap-1">
                      <Zap size={12} />
                      {formatTokens(session.totalTokens)} total
                    </span>
                    <span className="text-[#6B6860] text-xs">
                      {formatTokens(session.inputTokens)} in / {formatTokens(session.outputTokens)} out
                    </span>
                    {session.cacheRead > 0 && (
                      <span className="text-emerald-400/70 text-xs">
                        {formatTokens(session.cacheRead)} cached
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          /* Legacy task cards */
          filtered.map((task: any, i: number) => (
            <div
              key={task.id ?? i}
              className={`rounded-lg bg-[#111111] border border-[#222222] border-l-2 ${
                task.status === 'running' ? 'border-l-[#008cff]' :
                task.status === 'completed' ? 'border-l-green-400' :
                task.status === 'failed' ? 'border-l-red-400' : 'border-l-[#6B6860]'
              } p-4`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {task.status === 'running' ? <Loader2 size={16} className="text-[#008cff] animate-spin" /> :
                   task.status === 'completed' ? <CheckCircle2 size={16} className="text-green-400" /> :
                   task.status === 'failed' ? <XCircle size={16} className="text-red-400" /> :
                   <Clock size={16} className="text-[#6B6860]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[10px] font-syne font-medium px-1.5 py-0.5 rounded bg-[#222222] text-[#6B6860]">
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
                    <span className={`text-xs font-medium ml-auto ${
                      task.status === 'running' ? 'text-[#008cff]' :
                      task.status === 'completed' ? 'text-green-400' :
                      task.status === 'failed' ? 'text-red-400' : 'text-[#6B6860]'
                    }`}>
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
