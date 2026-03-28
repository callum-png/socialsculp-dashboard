'use client'

import { useMemo } from 'react'
import { Cpu, HardDrive, MemoryStick, Clock, Radio, Server, Bot, Monitor, Layers, Wifi } from 'lucide-react'
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

function formatUptime(uptime: string | number | undefined): string {
  if (uptime === undefined || uptime === null) return '--'
  // v2 sends string like "11:02" or "3 days, 2:14"
  if (typeof uptime === 'string') return uptime || '--'
  // Legacy: seconds as number
  const d = Math.floor(uptime / 86400)
  const h = Math.floor((uptime % 86400) / 3600)
  const m = Math.floor((uptime % 3600) / 60)
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
  if (status === 'active') return 'text-green-400'
  if (status === 'idle') return 'text-yellow-400'
  if (status === 'busy') return 'text-[#008cff]'
  if (status === 'error') return 'text-red-400'
  return 'text-[#6B6860]'
}

function agentStatusDot(status: string | undefined): string {
  if (status === 'active') return 'bg-green-400'
  if (status === 'idle') return 'bg-yellow-400'
  if (status === 'busy') return 'bg-[#008cff]'
  if (status === 'error') return 'bg-red-400'
  return 'bg-[#6B6860]'
}

function serviceStatusColor(runtime: string | undefined): string {
  if (!runtime) return 'text-[#6B6860]'
  if (runtime.includes('running')) return 'text-green-400'
  return 'text-red-400'
}

function serviceStatusDot(runtime: string | undefined): string {
  if (!runtime) return 'bg-[#6B6860]'
  if (runtime.includes('running')) return 'bg-green-400'
  return 'bg-red-400'
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
        <div className="flex-1">
          <p className="text-[#EDE8DE] font-syne font-semibold">
            {status === 'online' ? 'Online' : status === 'stale' ? 'Stale' : 'Offline'}
          </p>
          <p className="text-[#6B6860] text-sm">
            Last heartbeat: {relativeTime(latest?.timestamp)}
          </p>
        </div>
        {latest?.os && (
          <div className="flex items-center gap-2 text-[#6B6860] text-xs">
            <Monitor size={14} />
            <span>{latest.os.label || `${latest.os.platform} ${latest.os.arch}`}</span>
          </div>
        )}
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
            {typeof cpuPct === 'number' ? cpuPct.toFixed(1) : cpuPct}%
          </p>
          {latest?.system?.loadAvg && (
            <p className="text-[#6B6860] text-xs mt-1">
              Load: {latest.system.loadAvg.map((l: number) => (typeof l === 'number' ? l.toFixed(2) : l)).join(' / ')}
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
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
          <div>
            <p className="text-[#6B6860] text-xs font-syne uppercase tracking-wide mb-1">Mode</p>
            <p className="text-sm text-[#EDE8DE]">{latest?.gateway?.mode ?? '--'}</p>
          </div>
          <div>
            <p className="text-[#6B6860] text-xs font-syne uppercase tracking-wide mb-1">Latency</p>
            <p className="text-sm text-[#EDE8DE]">{latest?.gateway?.latencyMs != null ? `${latest.gateway.latencyMs}ms` : '--'}</p>
          </div>
        </div>
      </div>

      {/* Services */}
      {latest?.services && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {['gateway', 'node'].map((svc) => {
            const service = latest.services?.[svc]
            if (!service) return null
            return (
              <div key={svc} className="rounded-lg bg-[#111111] border border-[#222222] p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Server size={16} className="text-[#6B6860]" />
                    <span className="text-[#EDE8DE] text-sm font-syne font-semibold capitalize">{svc} Service</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${serviceStatusDot(service.runtime)}`} />
                    <span className={`text-xs font-medium ${serviceStatusColor(service.runtime)}`}>
                      {service.runtime || 'unknown'}
                    </span>
                  </div>
                </div>
                <div className="mt-2 flex gap-4 text-xs text-[#6B6860]">
                  <span>{service.label || '--'}</span>
                  <span>{service.installed ? 'Installed' : 'Not installed'}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Models */}
      {latest?.models && latest.models.length > 0 && (
        <div className="rounded-lg bg-[#111111] border border-[#222222] p-5">
          <div className="flex items-center gap-2 mb-4">
            <Layers size={18} className="text-[#6B6860]" />
            <span className="text-[#EDE8DE] font-syne font-semibold">Available Models</span>
            <span className="text-xs text-[#6B6860] bg-[#222222] px-2 py-0.5 rounded-full">
              {latest.models.length}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {latest.models.map((model: any) => (
              <div
                key={model.key}
                className="flex items-center justify-between px-4 py-3 rounded-md bg-[#090909] border border-[#222222]"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-[#EDE8DE] truncate">{model.name || model.key}</p>
                  <p className="text-[10px] text-[#6B6860] font-mono truncate">{model.key}</p>
                </div>
                <div className="flex items-center gap-2 ml-3">
                  {model.local && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">local</span>
                  )}
                  {model.contextWindow > 0 && (
                    <span className="text-[10px] text-[#6B6860]">{(model.contextWindow / 1000).toFixed(0)}k ctx</span>
                  )}
                  <div className={`w-2 h-2 rounded-full ${model.available ? 'bg-green-400' : 'bg-[#6B6860]'}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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

              {agent.sessionsCount != null && (
                <div className="flex justify-between">
                  <span className="text-[#6B6860] text-xs">Sessions</span>
                  <span className="text-[#EDE8DE] text-xs">{agent.sessionsCount}</span>
                </div>
              )}

              {agent.workspace && (
                <div className="flex justify-between">
                  <span className="text-[#6B6860] text-xs">Workspace</span>
                  <span className="text-[#EDE8DE] text-xs font-mono truncate max-w-[60%] text-right">
                    {agent.workspace.split('/').slice(-2).join('/')}
                  </span>
                </div>
              )}

              {/* Legacy fields */}
              {agent.status === 'busy' && agent.currentTask && (
                <div className="flex justify-between">
                  <span className="text-[#6B6860] text-xs">Task</span>
                  <span className="text-[#008cff] text-xs truncate max-w-[60%] text-right">{agent.currentTask}</span>
                </div>
              )}

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

      {/* Channels */}
      {latest?.channels && latest.channels.length > 0 && (
        <div className="rounded-lg bg-[#111111] border border-[#222222] p-5">
          <div className="flex items-center gap-2 mb-4">
            <Wifi size={18} className="text-[#6B6860]" />
            <span className="text-[#EDE8DE] font-syne font-semibold">Channels</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {latest.channels.map((ch: any, i: number) => (
              <div key={i} className="px-4 py-2 rounded-md bg-[#090909] border border-[#222222] text-sm text-[#EDE8DE]">
                {ch.type || ch.name || `Channel ${i + 1}`}
                {ch.enabled !== undefined && (
                  <span className={`ml-2 text-[10px] ${ch.enabled ? 'text-green-400' : 'text-[#6B6860]'}`}>
                    {ch.enabled ? 'enabled' : 'disabled'}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
