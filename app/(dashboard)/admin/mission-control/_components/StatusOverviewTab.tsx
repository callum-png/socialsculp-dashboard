'use client'

import { CheckCircle2, XCircle, Clock, CalendarClock, AlertTriangle, FileText, TrendingUp, Zap } from 'lucide-react'
import type { CronReportData, TaskDefinition, CronReport } from './MissionControlClient'

interface TabProps {
  data: CronReportData | null
  onRefresh: () => void
}

function relativeTime(iso: string | null | undefined): string {
  if (!iso) return 'never'
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(diff / 86400000)
  return `${days}d ago`
}

function isToday(iso: string | null | undefined): boolean {
  if (!iso) return false
  const d = new Date(iso)
  const now = new Date()
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  )
}

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: number | string
  subtitle?: string
  accent?: boolean
}

function StatCard({ icon, label, value, subtitle, accent }: StatCardProps) {
  return (
    <div className="rounded-lg bg-[#111111] border border-[#222222] p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className={accent ? 'text-[#008cff]' : 'text-[#6B6860]'}>{icon}</span>
        <span className="text-xs font-syne uppercase tracking-wide text-[#6B6860]">{label}</span>
      </div>
      <p className={`text-2xl font-syne font-bold ${accent ? 'text-[#008cff]' : 'text-[#EDE8DE]'}`}>
        {value}
      </p>
      {subtitle && <p className="text-xs text-[#6B6860] mt-1">{subtitle}</p>}
    </div>
  )
}

export function StatusOverviewTab({ data, onRefresh }: TabProps) {
  if (!data) {
    return (
      <div className="rounded-lg bg-[#111111] border border-[#222222] p-8 text-center">
        <div className="w-4 h-4 rounded-full bg-[#6B6860] mx-auto mb-3" />
        <p className="text-[#EDE8DE] font-syne font-semibold">Loading dashboard...</p>
      </div>
    )
  }

  const { tasks, reports } = data

  // Compute stats
  const todayReports = reports.filter((r) => isToday(r.startedAt))
  const tasksRunToday = todayReports.length
  const successesToday = todayReports.filter((r) => r.status === 'success').length
  const errorCount = todayReports.filter((r) => r.status === 'error').length
  const successRate =
    tasksRunToday > 0 ? Math.round((successesToday / tasksRunToday) * 100) : null

  // Latest morning brief
  const morningBrief = tasks.find((t) => t.id === 'morning-brief')
  const latestBriefReport = reports.find((r) => r.taskId === 'morning-brief')

  // Tasks with errors today
  const errorTasks = todayReports
    .filter((r) => r.status === 'error')
    .map((r) => r.taskId)

  // Pending tasks (haven't run yet today)
  const pendingTasks = tasks.filter((t) => !t.lastRun || !isToday(t.lastRun))

  // Upcoming tasks (next run in the future)
  const now = Date.now()
  const upcomingTasks = tasks
    .filter((t) => t.nextRun && new Date(t.nextRun).getTime() > now)
    .sort((a, b) => new Date(a.nextRun!).getTime() - new Date(b.nextRun!).getTime())
    .slice(0, 4)

  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Zap size={18} />}
          label="Tasks Run Today"
          value={tasksRunToday}
          subtitle={`of ${tasks.length} scheduled`}
          accent={tasksRunToday > 0}
        />
        <StatCard
          icon={<TrendingUp size={18} />}
          label="Success Rate"
          value={successRate !== null ? `${successRate}%` : '—'}
          subtitle={successRate !== null ? `${successesToday} of ${tasksRunToday} succeeded` : 'No runs yet today'}
        />
        <StatCard
          icon={<CheckCircle2 size={18} />}
          label="Successful"
          value={successesToday}
          subtitle="Today"
        />
        <StatCard
          icon={<XCircle size={18} />}
          label="Errors"
          value={errorCount}
          subtitle="Today"
        />
      </div>

      {/* Morning brief summary */}
      <div className="rounded-lg bg-[#111111] border border-[#222222] p-5">
        <div className="flex items-center gap-2 mb-3">
          <FileText size={18} className="text-[#008cff]" />
          <h3 className="text-[#EDE8DE] font-syne font-semibold">Latest Morning Brief</h3>
          {morningBrief?.lastRun && (
            <span className="text-xs text-[#6B6860] ml-auto">
              {relativeTime(morningBrief.lastRun)}
            </span>
          )}
        </div>
        {latestBriefReport?.summary ? (
          <p className="text-sm text-[#EDE8DE]/80 leading-relaxed">{latestBriefReport.summary}</p>
        ) : (
          <p className="text-sm text-[#6B6860]">
            No brief available yet — next run {morningBrief?.nextRun ? relativeTime(morningBrief.nextRun) : 'unscheduled'}.
          </p>
        )}
      </div>

      {/* Alerts */}
      {errorTasks.length > 0 && (
        <div className="rounded-lg bg-red-500/5 border border-red-500/20 p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={18} className="text-red-400" />
            <h3 className="text-red-400 font-syne font-semibold">Alerts</h3>
          </div>
          <ul className="space-y-1.5">
            {errorTasks.map((id) => (
              <li key={id} className="flex items-center gap-2 text-sm text-[#EDE8DE]/80">
                <XCircle size={14} className="text-red-400 flex-shrink-0" />
                <span className="font-mono text-sm">{id}</span>
                <span className="text-[#6B6860]">failed today</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Upcoming tasks */}
      {upcomingTasks.length > 0 && (
        <div className="rounded-lg bg-[#111111] border border-[#222222] p-5">
          <div className="flex items-center gap-2 mb-4">
            <CalendarClock size={18} className="text-[#6B6860]" />
            <h3 className="text-[#EDE8DE] font-syne font-semibold">Upcoming</h3>
          </div>
          <div className="space-y-3">
            {upcomingTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock size={14} className="text-[#6B6860]" />
                  <div>
                    <p className="text-sm text-[#EDE8DE]">{task.name}</p>
                    <p className="text-xs text-[#6B6860]">{task.scheduleHuman}</p>
                  </div>
                </div>
                <span className="text-xs text-[#008cff]">{relativeTime(task.nextRun)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All tasks quick overview */}
      <div className="rounded-lg bg-[#111111] border border-[#222222] overflow-hidden">
        <div className="px-5 py-3 border-b border-[#222222]">
          <h3 className="text-sm font-syne font-semibold text-[#6B6860] uppercase tracking-wide">
            All Tasks
          </h3>
        </div>
        <div className="divide-y divide-[#222222]">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between px-5 py-3 hover:bg-[#1a1a1a] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    task.lastStatus === 'success'
                      ? 'bg-emerald-400'
                      : task.lastStatus === 'error'
                      ? 'bg-red-400'
                      : 'bg-[#444444]'
                  }`}
                />
                <div>
                  <p className="text-sm text-[#EDE8DE]">{task.name}</p>
                  <p className="text-xs text-[#6B6860]">{task.scheduleHuman}</p>
                </div>
              </div>
              <span className="text-xs text-[#6B6860]">
                {task.lastRun ? relativeTime(task.lastRun) : 'Never run'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
