'use client'

import { useState, useEffect, useCallback } from 'react'
import type { MissionControlTab } from '@/types/openclaw'
import { StatusOverviewTab } from './StatusOverviewTab'
import { TaskFeedTab } from './TaskFeedTab'
import { CronJobsTab } from './CronJobsTab'
import { TokenBurnTab } from './TokenBurnTab'
import { RevenueTab } from './RevenueTab'
import { WorkflowsTab } from './WorkflowsTab'
import { CommandTerminalTab } from './CommandTerminalTab'
import { AiBriefTab } from './AiBriefTab'
import type { AiDashboardData } from './AiBriefTab'

interface Props {
  activeTab: MissionControlTab
}

export interface OpenClawData {
  status: 'online' | 'stale' | 'offline'
  latest: any | null
  history: { receivedAt: string; data: any }[]
  recentCommands: any[]
  crm?: any
}

export function MissionControlClient({ activeTab }: Props) {
  const [data, setData] = useState<OpenClawData | null>(null)
  const [aiData, setAiData] = useState<AiDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/openclaw/status')
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

  const fetchAiData = useCallback(async () => {
    try {
      const res = await fetch('/api/mission-control')
      if (!res.ok) return
      const json = await res.json()
      setAiData(json)
    } catch {
      // non-fatal — AI data may not be available yet
    }
  }, [])

  useEffect(() => {
    fetchStatus()
    fetchAiData()
    const interval = setInterval(() => {
      fetchStatus()
      fetchAiData()
    }, 30000)
    return () => clearInterval(interval)
  }, [fetchStatus, fetchAiData])

  const onRefresh = useCallback(() => {
    fetchStatus()
    fetchAiData()
  }, [fetchStatus, fetchAiData])

  const executeCommand = async (command: string): Promise<{ output: string; exitCode: number }> => {
    const res = await fetch('/api/openclaw/command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || 'Command failed')
    onRefresh()
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
            onClick={onRefresh}
            className="mt-4 px-4 py-2 text-sm font-syne bg-[#008cff]/10 text-[#008cff] border border-[#008cff]/20 rounded-md hover:bg-[#008cff]/20 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const tabProps = { data, executeCommand, onRefresh }

  return (
    <div className="px-6">
      {activeTab === 'brief'     && <AiBriefTab {...tabProps} aiData={aiData} />}
      {activeTab === 'overview'  && <StatusOverviewTab {...tabProps} />}
      {activeTab === 'tasks'     && <TaskFeedTab {...tabProps} />}
      {activeTab === 'crons'     && <CronJobsTab {...tabProps} />}
      {activeTab === 'tokens'    && <TokenBurnTab {...tabProps} />}
      {activeTab === 'revenue'   && <RevenueTab {...tabProps} />}
      {activeTab === 'workflows' && <WorkflowsTab {...tabProps} />}
      {activeTab === 'terminal'  && <CommandTerminalTab {...tabProps} />}
    </div>
  )
}
