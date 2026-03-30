'use client'

import { useState, useEffect, useCallback } from 'react'
import type { MissionControlTab } from '@/types/claude'
import { StatusOverviewTab } from './StatusOverviewTab'
import { TaskFeedTab } from './TaskFeedTab'
import { CronJobsTab } from './CronJobsTab'
import { TokenBurnTab } from './TokenBurnTab'
import { RevenueTab } from './RevenueTab'
import { WorkflowsTab } from './WorkflowsTab'
import { CommandTerminalTab } from './CommandTerminalTab'

interface Props {
  activeTab: MissionControlTab
}

export interface AgentData {
  status: 'online' | 'stale' | 'offline'
  latest: any | null
  history: { receivedAt: string; data: any }[]
  recentCommands: any[]
}

/** @deprecated Use AgentData */
export type ClaudeAgentData = AgentData

export function MissionControlClient({ activeTab }: Props) {
  const [data, setData] = useState<AgentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/claude-agent/status')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setData(json)
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 30000)
    return () => clearInterval(interval)
  }, [fetchStatus])

  const executeCommand = async (command: string): Promise<{ output: string; exitCode: number }> => {
    const res = await fetch('/api/claude-agent/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || 'Command failed')
    // Refresh status after command
    fetchStatus()
    return json
  }

  if (loading) {
    return (
      <div className="px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-lg bg-[#111111] border border-[#222222] animate-pulse" />
          ))}
        </div>
        <div className="mt-6 h-64 rounded-lg bg-[#111111] border border-[#222222] animate-pulse" />
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="px-6">
        <div className="rounded-lg bg-[#111111] border border-[#222222] p-8 text-center">
          <p className="text-red-400 font-syne font-semibold">Connection Error</p>
          <p className="text-[#6B6860] text-sm mt-1">{error}</p>
          <button
            onClick={fetchStatus}
            className="mt-4 px-4 py-2 text-sm font-syne bg-[#008cff]/10 text-[#008cff] border border-[#008cff]/20 rounded-md hover:bg-[#008cff]/20 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const tabProps = { data, executeCommand, onRefresh: fetchStatus }

  return (
    <div className="px-6">
      {activeTab === 'overview' && <StatusOverviewTab {...tabProps} />}
      {activeTab === 'tasks' && <TaskFeedTab {...tabProps} />}
      {activeTab === 'crons' && <CronJobsTab {...tabProps} />}
      {activeTab === 'tokens' && <TokenBurnTab {...tabProps} />}
      {activeTab === 'revenue' && <RevenueTab {...tabProps} />}
      {activeTab === 'workflows' && <WorkflowsTab {...tabProps} />}
      {activeTab === 'terminal' && <CommandTerminalTab {...tabProps} />}
    </div>
  )
}
