'use client'

import { useState, useEffect, useCallback } from 'react'
import type { MissionControlTab } from '@/types/openclaw'
import { StatusOverviewTab } from './StatusOverviewTab'
import { TaskFeedTab } from './TaskFeedTab'
import { CronJobsTab } from './CronJobsTab'
import { RevenueTab } from './RevenueTab'
import { WorkflowsTab } from './WorkflowsTab'

interface Props {
  activeTab: MissionControlTab
}

export interface TaskDefinition {
  id: string
  name: string
  description: string
  schedule: string
  scheduleHuman: string
  lastRun: string | null
  lastStatus: 'success' | 'error' | null
  nextRun: string | null
  runCount: number
  lastSummary: string | null
  lastDetails: string | null
}

export interface CronReport {
  taskId: string
  description: string
  startedAt: string
  completedAt: string
  status: 'success' | 'error'
  summary: string
  details: string
}

export interface CronReportData {
  tasks: TaskDefinition[]
  reports: CronReport[]
  generatedAt: string
}

export function MissionControlClient({ activeTab }: Props) {
  const [data, setData] = useState<CronReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReports = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/cron-reports')
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
    fetchReports()
    const interval = setInterval(fetchReports, 60000)
    return () => clearInterval(interval)
  }, [fetchReports])

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
          <p className="text-red-400 font-syne font-semibold">Failed to load reports</p>
          <p className="text-[#6B6860] text-sm mt-1">{error}</p>
          <button
            onClick={fetchReports}
            className="mt-4 px-4 py-2 text-sm font-syne bg-[#008cff]/10 text-[#008cff] border border-[#008cff]/20 rounded-md hover:bg-[#008cff]/20 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const tabProps = { data, onRefresh: fetchReports }

  return (
    <div className="px-6">
      {activeTab === 'overview' && <StatusOverviewTab {...tabProps} />}
      {activeTab === 'tasks' && <TaskFeedTab {...tabProps} />}
      {activeTab === 'crons' && <CronJobsTab {...tabProps} />}
      {activeTab === 'revenue' && <RevenueTab data={null} executeCommand={async () => ({ output: '', exitCode: 0 })} onRefresh={fetchReports} />}
      {activeTab === 'workflows' && <WorkflowsTab {...tabProps} />}
    </div>
  )
}
