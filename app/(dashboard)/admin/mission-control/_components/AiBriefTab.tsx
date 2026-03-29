'use client'

import { useState } from 'react'
import {
  Bot,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Newspaper,
  Users,
  Mail,
  MailOpen,
  ListChecks,
  Play,
  Loader2,
  Zap,
  Target,
  TrendingUp,
  RefreshCw,
  Tag,
  CalendarClock,
  Timer,
} from 'lucide-react'
import type { OpenClawData } from './MissionControlClient'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AiTask {
  id: string
  taskId: string
  title: string
  status: string // running | completed | failed | idle
  summary: string | null
  lastActivity: string
  createdAt: string
}

export interface DailyBrief {
  id: string
  category: string
  content: string
  priority: string // high | normal | low
  createdAt: string
}

export interface AiDashboardData {
  tasks: AiTask[]
  briefs: DailyBrief[]
  metrics: {
    today: Record<string, number>
    week: Record<string, number>
  }
}

interface TabProps {
  data: OpenClawData | null
  aiData: AiDashboardData | null
  executeCommand: (cmd: string) => Promise<{ output: string; exitCode: number }>
  onRefresh: () => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  if (diff < 0) return 'just now'
  const s = Math.floor(diff / 1000)
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function formatTimestamp(iso: string): string {
  try {
    const d = new Date(iso)
    const today = new Date()
    const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    if (d.toDateString() === today.toDateString()) return `Today ${time}`
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    if (d.toDateString() === yesterday.toDateString()) return `Yesterday ${time}`
    return (
      d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + time
    )
  } catch {
    return iso
  }
}

// ─── Category tag config ──────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  'morning-brief':     { label: 'Morning Brief',    color: 'text-[#FFB547]',    bg: 'bg-[#1A1200]' },
  'lead-gen':          { label: 'Lead Gen',          color: 'text-[#008cff]',    bg: 'bg-[#001a33]' },
  'follow-up':         { label: 'Follow-up',         color: 'text-[#4ADE80]',    bg: 'bg-[#0A1F0A]' },
  'competitive-intel': { label: 'Competitive Intel', color: 'text-purple-400',   bg: 'bg-purple-500/10' },
  'content-research':  { label: 'Content Research',  color: 'text-orange-400',   bg: 'bg-orange-500/10' },
  'security':          { label: 'Security',          color: 'text-[#FF4747]',    bg: 'bg-[#1F0A0A]' },
  'general':           { label: 'General',           color: 'text-[#6B6860]',    bg: 'bg-[#1A1A1A]' },
}

function getCategoryConfig(cat: string) {
  return CATEGORY_CONFIG[cat] ?? { label: cat, color: 'text-[#6B6860]', bg: 'bg-[#1A1A1A]' }
}

// ─── Quick Actions ────────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { label: 'Run Lead Gen',       cmd: 'openclaw cron run lead-gen',          icon: Users },
  { label: 'Morning Brief',      cmd: 'openclaw cron run morning-brief',      icon: Newspaper },
  { label: 'Content Research',   cmd: 'openclaw cron run content-research',   icon: Tag },
  { label: 'Run Follow-ups',     cmd: 'openclaw cron run follow-up',          icon: MailOpen },
  { label: 'Security Audit',     cmd: 'openclaw cron run security-audit',     icon: AlertTriangle },
  { label: 'Competitive Intel',  cmd: 'openclaw cron run competitive-intel',  icon: Target },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetricCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode
  label: string
  value: number | string
  sub?: string
}) {
  return (
    <div className="rounded-lg bg-[#111111] border border-[#222222] p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2 text-[#6B6860]">
        {icon}
        <span className="text-[10px] font-syne uppercase tracking-wide leading-tight">{label}</span>
      </div>
      <p className="text-2xl font-syne font-bold text-[#EDE8DE]">{value}</p>
      {sub && <p className="text-[10px] text-[#6B6860]">{sub}</p>}
    </div>
  )
}

function TaskStatusIcon({ status }: { status: string }) {
  if (status === 'running') {
    return (
      <span className="relative flex h-3 w-3 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#008cff] opacity-40" />
        <span className="relative inline-flex h-3 w-3 rounded-full bg-[#008cff]" />
      </span>
    )
  }
  if (status === 'completed') return <CheckCircle2 size={14} className="text-[#4ADE80] shrink-0" />
  if (status === 'failed')    return <XCircle size={14} className="text-[#FF4747] shrink-0" />
  return <Clock size={14} className="text-[#6B6860] shrink-0" />
}

function statusBorderColor(status: string) {
  if (status === 'running')   return 'border-l-[#008cff]'
  if (status === 'completed') return 'border-l-[#4ADE80]'
  if (status === 'failed')    return 'border-l-[#FF4747]'
  return 'border-l-[#2A2A2A]'
}

// ─── Main Tab ─────────────────────────────────────────────────────────────────

export function AiBriefTab({ data, aiData, executeCommand, onRefresh }: TabProps) {
  const [runningAction, setRunningAction] = useState<string | null>(null)
  const [actionFeedback, setActionFeedback] = useState<Record<string, 'success' | 'error'>>({})

  // ── Derived data ────────────────────────────────────────────────────────────
  const crm   = (data as any)?.crm
  const tasks  = aiData?.tasks  ?? []
  const briefs = aiData?.briefs ?? []
  const metrics = aiData?.metrics

  // Key metrics — prefer AI-tracked values, fall back to CRM data from heartbeat
  const leadsToday   = metrics?.today?.leads_generated ?? 0
  const leadsWeek    = metrics?.week?.leads_generated  ?? (crm?.leads?.thisWeek ?? 0)
  const emailsSent   = crm?.emails?.sent               ?? (metrics?.week?.emails_sent ?? 0)
  const emailsDrafted = metrics?.today?.emails_drafted ?? 0
  const replies       = metrics?.week?.replies_received ?? 0

  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
  const tasksCompletedToday = tasks.filter(
    t => t.status === 'completed' && new Date(t.lastActivity) >= todayStart
  ).length

  // Panel data
  const activeTasks  = tasks.filter(t => t.status === 'running' || t.status === 'idle').slice(0, 10)
  const recentTasks  = tasks.filter(t => t.status === 'completed' || t.status === 'failed').slice(0, 5)
  const roadblocks   = tasks.filter(t => t.status === 'failed')
  const highBriefs   = briefs.filter(b => b.priority === 'high').slice(0, 3)

  // Cron jobs from heartbeat
  const rawCrons = data?.latest?.crons
  const crons: any[] = Array.isArray(rawCrons) ? rawCrons : (rawCrons?.jobs ?? [])

  // ── Quick action handler ─────────────────────────────────────────────────────
  const handleAction = async (label: string, cmd: string) => {
    setRunningAction(label)
    try {
      await executeCommand(cmd)
      setActionFeedback(p => ({ ...p, [label]: 'success' }))
      setTimeout(() => setActionFeedback(p => { const n = { ...p }; delete n[label]; return n }), 3000)
    } catch {
      setActionFeedback(p => ({ ...p, [label]: 'error' }))
      setTimeout(() => setActionFeedback(p => { const n = { ...p }; delete n[label]; return n }), 3000)
    } finally {
      setRunningAction(null)
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Key Metrics ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard icon={<TrendingUp size={16} />} label="Leads Today"       value={leadsToday}          sub="AI-tracked" />
        <MetricCard icon={<Users size={16} />}      label="Leads This Week"   value={leadsWeek}            sub="Last 7 days" />
        <MetricCard icon={<Mail size={16} />}       label="Emails Drafted"    value={emailsDrafted}        sub="Today" />
        <MetricCard icon={<MailOpen size={16} />}   label="Emails Sent"       value={emailsSent}           sub="Via Resend" />
        <MetricCard icon={<Zap size={16} />}        label="Replies Received"  value={replies}              sub="This week" />
        <MetricCard icon={<ListChecks size={16} />} label="Tasks Done Today"  value={tasksCompletedToday}  sub="Completed" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left column: Active Tasks + Brief Feed ──────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Active Tasks Panel */}
          <div className="rounded-lg bg-[#111111] border border-[#222222] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#222222] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Bot size={17} className="text-[#008cff]" />
                <h3 className="text-[#EDE8DE] font-syne font-semibold">Active Tasks</h3>
                {tasks.filter(t => t.status === 'running').length > 0 && (
                  <span className="text-[10px] font-syne bg-[#008cff]/15 text-[#008cff] border border-[#008cff]/25 px-2 py-0.5 rounded-full">
                    {tasks.filter(t => t.status === 'running').length} running
                  </span>
                )}
              </div>
              <button
                onClick={onRefresh}
                className="text-[#6B6860] hover:text-[#EDE8DE] transition-colors p-1"
                title="Refresh"
              >
                <RefreshCw size={14} />
              </button>
            </div>

            {activeTasks.length === 0 && recentTasks.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <Bot size={28} className="mx-auto text-[#2A2A2A] mb-3" />
                <p className="text-[#6B6860] text-sm font-syne">No task updates yet</p>
                <p className="text-[#6B6860] text-xs mt-1">
                  POST to <code className="text-[#EDE8DE]/60 bg-[#1A1A1A] px-1 rounded">/api/mission-control</code> with{' '}
                  <code className="text-[#EDE8DE]/60 bg-[#1A1A1A] px-1 rounded">type: &quot;task_update&quot;</code> to populate this panel
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#1A1A1A]">
                {[...activeTasks, ...recentTasks].map(task => (
                  <div
                    key={task.id}
                    className={`flex items-start gap-3 px-5 py-3.5 border-l-2 hover:bg-[#0a0a0a] transition-colors ${statusBorderColor(task.status)}`}
                  >
                    <div className="mt-1">
                      <TaskStatusIcon status={task.status} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm text-[#EDE8DE] truncate">{task.title}</p>
                        <span className="text-[10px] text-[#6B6860] shrink-0 mt-0.5">
                          {relativeTime(task.lastActivity)}
                        </span>
                      </div>
                      {task.summary && (
                        <p className="text-xs text-[#6B6860] mt-0.5 line-clamp-2 leading-relaxed">
                          {task.summary}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Daily Brief Feed */}
          <div className="rounded-lg bg-[#111111] border border-[#222222] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#222222] flex items-center gap-2.5">
              <Newspaper size={17} className="text-[#6B6860]" />
              <h3 className="text-[#EDE8DE] font-syne font-semibold">Daily Brief</h3>
              <span className="text-[10px] text-[#6B6860] bg-[#222222] px-2 py-0.5 rounded-full ml-0.5">
                {briefs.length}
              </span>
            </div>

            {briefs.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <Newspaper size={28} className="mx-auto text-[#2A2A2A] mb-3" />
                <p className="text-[#6B6860] text-sm font-syne">No briefs yet</p>
                <p className="text-[#6B6860] text-xs mt-1">
                  Morning briefs, lead gen results, and activity summaries appear here
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#1A1A1A] max-h-[500px] overflow-y-auto">
                {briefs.map(brief => {
                  const cfg = getCategoryConfig(brief.category)
                  return (
                    <div key={brief.id} className="px-5 py-4 hover:bg-[#0a0a0a] transition-colors">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded ${cfg.bg} ${cfg.color}`}>
                          <Tag size={8} />
                          {cfg.label}
                        </span>
                        <span className="text-[10px] text-[#6B6860] shrink-0">
                          {formatTimestamp(brief.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-[#EDE8DE]/90 leading-relaxed">{brief.content}</p>
                      {brief.priority === 'high' && (
                        <div className="flex items-center gap-1.5 mt-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#FF4747]" />
                          <span className="text-[10px] text-[#FF4747] font-medium">High Priority</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Scheduled Tasks Overview */}
          <div className="rounded-lg bg-[#111111] border border-[#222222] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#222222] flex items-center gap-2.5">
              <CalendarClock size={17} className="text-[#6B6860]" />
              <h3 className="text-[#EDE8DE] font-syne font-semibold">Scheduled Tasks</h3>
              <span className="text-[10px] text-[#6B6860] bg-[#222222] px-2 py-0.5 rounded-full">
                {crons.length}
              </span>
            </div>

            {crons.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <CalendarClock size={28} className="mx-auto text-[#2A2A2A] mb-3" />
                <p className="text-[#6B6860] text-sm">No scheduled tasks reported yet</p>
              </div>
            ) : (
              <div className="divide-y divide-[#1A1A1A]">
                {crons.map((job: any) => {
                  const isSuccess = job.lastStatus === 'success'
                  const isError   = job.lastStatus === 'error'
                  return (
                    <div
                      key={job.id ?? job.name}
                      className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#0a0a0a] transition-colors"
                    >
                      <Timer size={14} className="text-[#6B6860] shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-[#EDE8DE] truncate">{job.name}</p>
                          {!job.enabled && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#222222] text-[#6B6860]">
                              Disabled
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-[#6B6860] font-mono mt-0.5">{job.schedule}</p>
                      </div>
                      <div className="text-right shrink-0 text-xs text-[#6B6860]">
                        {job.nextRun ? (
                          <p className="text-[#EDE8DE]/70">
                            Next: {relativeTime(job.nextRun)}
                          </p>
                        ) : null}
                        {job.lastRun ? (
                          <p>Last: {relativeTime(job.lastRun)}</p>
                        ) : (
                          <p>Never run</p>
                        )}
                      </div>
                      <div className="shrink-0">
                        {isSuccess ? (
                          <CheckCircle2 size={14} className="text-[#4ADE80]" />
                        ) : isError ? (
                          <XCircle size={14} className="text-[#FF4747]" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-[#2A2A2A]" />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </div>

        {/* ── Right column: Roadblocks + Quick Actions ─────────────────────── */}
        <div className="space-y-6">

          {/* Roadblocks & Action Items */}
          <div className="rounded-lg bg-[#111111] border border-[#222222] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#222222] flex items-center gap-2.5">
              <AlertTriangle
                size={16}
                className={roadblocks.length > 0 || highBriefs.length > 0 ? 'text-[#FF4747]' : 'text-[#6B6860]'}
              />
              <h3 className="text-[#EDE8DE] font-syne font-semibold">Roadblocks</h3>
              {(roadblocks.length + highBriefs.length) > 0 && (
                <span className="text-[10px] font-syne bg-[#1F0A0A] text-[#FF4747] border border-[#4A1A1A] px-2 py-0.5 rounded-full">
                  {roadblocks.length + highBriefs.length}
                </span>
              )}
            </div>

            {roadblocks.length === 0 && highBriefs.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <CheckCircle2 size={24} className="mx-auto text-[#4ADE80] mb-2" />
                <p className="text-[#EDE8DE] text-sm font-syne font-semibold">All clear</p>
                <p className="text-[#6B6860] text-xs mt-0.5">No blocked tasks or urgent items</p>
              </div>
            ) : (
              <div className="divide-y divide-[#1A1A1A]">
                {roadblocks.map(task => (
                  <div key={task.id} className="flex items-start gap-2.5 px-4 py-3.5">
                    <XCircle size={14} className="text-[#FF4747] mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm text-[#EDE8DE] truncate">{task.title}</p>
                      {task.summary && (
                        <p className="text-xs text-[#6B6860] mt-0.5 line-clamp-2">{task.summary}</p>
                      )}
                      <p className="text-[10px] text-[#FF4747]/70 mt-1">{relativeTime(task.lastActivity)}</p>
                    </div>
                  </div>
                ))}
                {highBriefs.map(brief => {
                  const cfg = getCategoryConfig(brief.category)
                  return (
                    <div key={brief.id} className="flex items-start gap-2.5 px-4 py-3.5">
                      <AlertTriangle size={14} className="text-[#FFB547] mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded mb-1 ${cfg.bg} ${cfg.color}`}>
                          {cfg.label}
                        </span>
                        <p className="text-xs text-[#EDE8DE]/80 line-clamp-3 leading-relaxed">
                          {brief.content}
                        </p>
                        <p className="text-[10px] text-[#6B6860] mt-1">{relativeTime(brief.createdAt)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="rounded-lg bg-[#111111] border border-[#222222] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#222222] flex items-center gap-2.5">
              <Zap size={16} className="text-[#008cff]" />
              <h3 className="text-[#EDE8DE] font-syne font-semibold">Quick Actions</h3>
            </div>
            <div className="p-3 flex flex-col gap-2">
              {QUICK_ACTIONS.map(({ label, cmd, icon: Icon }) => {
                const isRunning = runningAction === label
                const fb = actionFeedback[label]
                return (
                  <button
                    key={label}
                    onClick={() => handleAction(label, cmd)}
                    disabled={runningAction !== null}
                    className={`
                      w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-md text-sm font-medium
                      text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed
                      ${fb === 'success'
                        ? 'bg-[#0A1F0A] text-[#4ADE80] border border-[#1A4A1A]'
                        : fb === 'error'
                        ? 'bg-[#1F0A0A] text-[#FF4747] border border-[#4A1A1A]'
                        : 'bg-[#0a0a0a] border border-[#222222] text-[#EDE8DE] hover:border-[#008cff]/40 hover:bg-[#008cff]/5 hover:text-[#008cff]'
                      }
                    `}
                  >
                    {isRunning     ? <Loader2 size={15} className="animate-spin shrink-0" />
                     : fb === 'success' ? <CheckCircle2 size={15} className="shrink-0" />
                     : fb === 'error'   ? <XCircle size={15} className="shrink-0" />
                     : <Icon size={15} className="shrink-0" />}
                    <span className="flex-1">
                      {isRunning ? 'Queuing…' : fb === 'success' ? 'Queued!' : label}
                    </span>
                    {!isRunning && !fb && (
                      <Play size={11} className="opacity-30 shrink-0" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
