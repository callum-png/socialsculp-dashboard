'use client'

import { useMemo } from 'react'
import { Cpu, HardDrive, MemoryStick, Clock, Radio, Server, Bot } from 'lucide-react'
import type { OpenClawData } from './MissionControlClient'

interface TabProps {
  data: OpenClawData | null
  executeCommand: (cmd: string) => Promise<{ output: string; exitCode: number }>
  onRefresh: () => void
}

function relativeTime(timestamp: string | undefined): string {
  if (!timestamp) return 'never'
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

function formatUptime(seconds: number | undefined): string {
  if (!seconds) return '--'
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (d > 0) return `${d}d ${h}h ${m}m`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

function formatBytes(bytes: number | undefined): string {
  if (bytes === undefined || bytes === null) return '--'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

function percentColor(pct: number, thresholds = { green: 60, yellow: 80 }): string {
  if (pct < thresholds.green) return 'text-green-400'
  if (pct < thresholds.yellow) return 'text-yellow-400'
  return 'text-red-400'
}

function statusDotColor(status: 'online' | 'stale' | 'offline'): string {
  if (status === 'online') return 'bg-green-400'
  if (status === 'stale') return 'bg-yellow-400'
  return 'bg-red-400'
}

function agentStatusColor(status: string | undefined): string {
  if (status === 'idle') return 'text-green-400'
  if (status === 'busy') return 'text-[#008cff]'
  if (status === 'error') return 'text-red-400'
  return 'text-[#6B6860]'
}

function agentStatusDot(status: string | undefined): string {
  if (status === 'idle') return 'bg-green-400'
  if (status === 'busy') return 'bg-[#008cff]'
  if (status === 'error') return 'bg-red-400'
  return 'bg-[#6B6860]'
}

export function StatusOverviewTab({ data }: TabProps) {
  const status = data?.status ?? 'offline'
  const latest = data?.latest

  const cpuPct = latest?.system?.cpu ?? 0
  const memUsed = latest?.system?.memoryUsed
  const memTotal = latest?.system?.memoryTotal
  const memPct = memTotal ? Math.round((memUsed / memTotal) * 100) : 0
  const diskUsed = latest?.system?.diskUsed
  const diskTotal = latest?.system?.diskTotal
  const diskPct = diskTotal ? Math.round((diskUsed / diskTotal) * 100) : 0

  if (!data || !latest) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg bg-[#111111] border border-[#222222] p-8 flex flex-col items-center justify-center gap-3">
          <div className="relative">
            <div className="w-5 h-5 rounded-full bg-[#6B6860]" />
          </div>
          <p className="text-[#EDE8DE] font-syne font-semibold text-lg">Waiting for first heartbeat...</p>
          <p className="text-[#6B6860] text-sm">No data received from OpenClaw yet</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Heartbeat Indicator */}
      <div className="rounded-lg bg-[#111111] border border-[#222222] p-5 flex items-center gap-4">
        <div className="relative flex items-center justify-center">
          <div className={`w-4 h-4 rounded-full ${statusDotColor(status)}`} />
          {status === 'online' && (
            <div className="absolute w-4 h-4 rounded-full bg-green-400 animate-ping opacity-40" />
          )}
        </div>
        <div>
          <p className="text-[#EDE8DE] font-syne font-semibold">
            {status === 'online' ? 'Online' : status === 'stale' ? 'Stale' : 'Offline'}
          </p>
          <p className="text-[#6B6860] text-sm">
            Last heartbeat: {relativeTime(latest?.timestamp)}
          </p>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CPU */}
        <div className="rounded-lg bg-[#111111] border border-[#222222] p-4">
          <div className="flex items-center gap-2 mb-3">
            <Cpu size={18} className="text-[#6B6860]" />
            <span className="text-[#6B6860] text-xs font-syne uppercase tracking-wide">CPU</span>
          </div>
          <p className={`text-2xl font-syne font-bold ${percentColor(cpuPct)}`}>
            {cpuPct.toFixed(1)}%
          </p>
          {latest?.system?.loadAvg && (
            <p className="text-[#6B6860] text-xs mt-1">
              Load: {latest.system.loadAvg.map((l: number) => l.toFixed(2)).join(' / ')}
            </p>
          )}
        </div>

        {/* Memory */}
        <div className="rounded-lg bg-[#111111] border border-[#222222] p-4">
          <div className="flex items-center gap-2 mb-3">
            <MemoryStick size={18} className="text-[#6B6860]" />
            <span className="text-[#6B6860] text-xs font-syne uppercase tracking-wide">Memory</span>
          </div>
          <p className={`text-2xl font-syne font-bold ${percentColor(memPct)}`}>
            {memPct}%
          </p>
          <p className="text-[#6B6860] text-xs mt-1">
            {formatBytes(memUsed)} / {formatBytes(memTotal)}
          </p>
        </div>

        {/* Disk */}
        <div className="rounded-lg bg-[#111111] border border-[#222222] p-4">
          <div className="flex items-center gap-2 mb-3">
            <HardDrive size={18} className="text-[#6B6860]" />
            <span className="text-[#6B6860] text-xs font-syne uppercase tracking-wide">Disk</span>
          </div>
          <p className={`text-2xl font-syne font-bold ${percentColor(diskPct)}`}>
            {diskPct}%
          </p>
          <p className="text-[#6B6860] text-xs mt-1">
            {formatBytes(diskUsed)} / {formatBytes(diskTotal)}
          </p>
        </div>

        {/* Uptime */}
        <div className="rounded-lg bg-[#111111] border border-[#222222] p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={18} className="text-[#6B6860]" />
            <span className="text-[#6B6860] text-xs font-syne uppercase tracking-wide">Uptime</span>
          </div>
          <p className="text-2xl font-syne font-bold text-[#EDE8DE]">
            {formatUptime(latest?.system?.uptime)}
          </p>
        </div>
      </div>

      {/* Gateway Status */}
      <div className="rounded-lg bg-[#111111] border border-[#222222] p-5">
        <div className="flex items-center gap-2 mb-4">
          <Radio size={18} className="text-[#6B6860]" />
          <span className="text-[#EDE8DE] font-syne font-semibold">Gateway</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-[#6B6860] text-xs font-syne uppercase tracking-wide mb-1">Status</p>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${latest?.gateway?.running ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className={`text-sm font-medium ${latest?.gateway?.running ? 'text-green-400' : 'text-red-400'}`}>
                {latest?.gateway?.running ? 'Running' : 'Stopped'}
              </span>
            </div>
          </div>
          <div>
            <p className="text-[#6B6860] text-xs font-syne uppercase tracking-wide mb-1">Port</p>
            <p className="text-sm text-[#EDE8DE]">{latest?.gateway?.port ?? '--'}</p>
          </div>
          <div>
            <p className="text-[#6B6860] text-xs font-syne uppercase tracking-wide mb-1">Version</p>
            <p className="text-sm text-[#EDE8DE]">{latest?.gateway?.version ?? '--'}</p>
          </div>
          <div>
            <p className="text-[#6B6860] text-xs font-syne uppercase tracking-wide mb-1">PID</p>
            <p className="text-sm text-[#EDE8DE]">{latest?.gateway?.pid ?? '--'}</p>
          </div>
        </div>
      </div>

      {/* Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {latest?.agents?.map((agent: any) => (
          <div key={agent.name} className="rounded-lg bg-[#111111] border border-[#222222] p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bot size={18} className="text-[#6B6860]" />
                <span className="text-[#EDE8DE] font-syne font-semibold">{agent.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${agentStatusDot(agent.status)}`} />
                <span className={`text-xs font-medium ${agentStatusColor(agent.status)}`}>
                  {agent.status ?? 'unknown'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-[#6B6860] text-xs">Model</span>
                <span className="text-[#EDE8DE] text-xs font-mono">{agent.model ?? '--'}</span>
              </div>

              {agent.status === 'busy' && agent.currentTask && (
                <div className="flex justify-between">
                  <span className="text-[#6B6860] text-xs">Task</span>
                  <span className="text-[#008cff] text-xs truncate max-w-[60%] text-right">{agent.currentTask}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-[#6B6860] text-xs">Max Concurrent</span>
                <span className="text-[#EDE8DE] text-xs">{agent.maxConcurrent ?? '--'}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#6B6860] text-xs">Max Subagents</span>
                <span className="text-[#EDE8DE] text-xs">{agent.maxSubagents ?? '--'}</span>
              </div>

              {agent.fallbackModels?.length > 0 && (
                <div>
                  <span className="text-[#6B6860] text-xs">Fallbacks</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {agent.fallbackModels.map((m: string) => (
                      <span
                        key={m}
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#222222] text-[#6B6860]"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {(!latest?.agents || latest.agents.length === 0) && (
          <div className="col-span-full rounded-lg bg-[#111111] border border-[#222222] p-6 text-center">
            <p className="text-[#6B6860] text-sm">No agents reported</p>
          </div>
        )}
      </div>
    </div>
  )
}
