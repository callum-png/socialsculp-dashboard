'use client'

import { Mail, Users, ListChecks, Inbox, TrendingUp, DollarSign, CalendarDays, Target } from 'lucide-react'
import type { OpenClawData } from './MissionControlClient'

interface TabProps {
  data: OpenClawData | null
  executeCommand: (cmd: string) => Promise<{ output: string; exitCode: number }>
  onRefresh: () => void
}

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: number | string
  subtitle?: string
}

function StatCard({ icon, label, value, subtitle }: StatCardProps) {
  return (
    <div className="rounded-lg bg-[#111111] border border-[#222222] p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2 text-[#6B6860]">
        {icon}
        <span className="text-xs font-syne uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-2xl font-syne font-bold text-[#EDE8DE]">{value}</p>
      {subtitle && <p className="text-xs text-[#6B6860]">{subtitle}</p>}
    </div>
  )
}

const STAGE_LABELS: Record<string, { label: string; color: string }> = {
  APPOINTMENT_SET: { label: 'Appointment Set', color: 'bg-[#008cff]' },
  QUALIFIED: { label: 'Qualified', color: 'bg-purple-500' },
  DECISION_MAKER: { label: 'Decision Maker', color: 'bg-yellow-500' },
  PROPOSAL_SENT: { label: 'Proposal Sent', color: 'bg-orange-500' },
  CLOSED_WON: { label: 'Closed Won', color: 'bg-emerald-500' },
  CLOSED_LOST: { label: 'Closed Lost', color: 'bg-red-500' },
}

function formatCurrency(n: number): string {
  if (n === 0) return '$0'
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}k`
  return `$${n.toFixed(0)}`
}

export function RevenueTab({ data }: TabProps) {
  // CRM data comes from the DB via the status API
  const crm = (data as any)?.crm as {
    leads: { total: number; thisWeek: number; thisMonth: number }
    deals: { total: number; pipelineValue: number; byStage: { stage: string; count: number; value: number }[] }
    emails?: { sent: number; recent: { id: string; to: string[]; subject: string; created_at: string }[] }
  } | undefined

  // Legacy workspace data from reporter heartbeat
  const workspace = data?.latest?.workspace as
    | { targets: string[]; emailsSent: number; emailsQueued: number; leadsTotal: number; trackerEntries: number }
    | undefined

  const hasData = crm || (workspace && (workspace.leadsTotal > 0 || workspace.emailsSent > 0))

  if (!hasData) {
    return (
      <div className="rounded-lg bg-[#111111] border border-[#222222] p-8 text-center">
        <Inbox size={32} className="mx-auto text-[#6B6860] mb-3" />
        <p className="text-[#EDE8DE] font-syne font-semibold">No Pipeline Data</p>
        <p className="text-[#6B6860] text-sm mt-1">
          Lead generation and deal pipeline data will appear once OpenClaw starts running outreach.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Lead Stats */}
      {crm && (
        <>
          <div>
            <h3 className="text-sm font-syne font-semibold text-[#6B6860] uppercase tracking-wide mb-3">
              Lead Generation
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={<Users size={18} />}
                label="Total Leads"
                value={crm.leads.total}
                subtitle="All time via Apollo"
              />
              <StatCard
                icon={<CalendarDays size={18} />}
                label="This Month"
                value={crm.leads.thisMonth}
                subtitle="Last 30 days"
              />
              <StatCard
                icon={<TrendingUp size={18} />}
                label="This Week"
                value={crm.leads.thisWeek}
                subtitle="Last 7 days"
              />
              <StatCard
                icon={<Mail size={18} />}
                label="Emails Sent"
                value={crm.emails?.sent ?? workspace?.emailsSent ?? 0}
                subtitle="Via Resend (live)"
              />
            </div>
          </div>

          {/* Deal Pipeline */}
          {crm.deals.total > 0 && (
            <div>
              <h3 className="text-sm font-syne font-semibold text-[#6B6860] uppercase tracking-wide mb-3">
                Deal Pipeline
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <StatCard
                  icon={<Target size={18} />}
                  label="Active Deals"
                  value={crm.deals.total}
                />
                <StatCard
                  icon={<DollarSign size={18} />}
                  label="Pipeline Value"
                  value={formatCurrency(crm.deals.pipelineValue)}
                />
                <StatCard
                  icon={<ListChecks size={18} />}
                  label="Stages Active"
                  value={crm.deals.byStage.length}
                />
              </div>

              {/* Pipeline by Stage */}
              <div className="rounded-lg bg-[#111111] border border-[#222222]">
                <div className="px-5 py-4 border-b border-[#222222]">
                  <h3 className="text-sm font-syne font-semibold text-[#EDE8DE]">Pipeline Breakdown</h3>
                </div>
                <div className="divide-y divide-[#222222]">
                  {crm.deals.byStage.map((stage) => {
                    const stageInfo = STAGE_LABELS[stage.stage] || { label: stage.stage, color: 'bg-[#6B6860]' }
                    return (
                      <div
                        key={stage.stage}
                        className="flex items-center justify-between px-5 py-3.5 hover:bg-[#0a0a0a] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-2.5 h-2.5 rounded-full ${stageInfo.color}`} />
                          <span className="text-sm text-[#EDE8DE]">{stageInfo.label}</span>
                        </div>
                        <div className="flex items-center gap-6">
                          <span className="text-xs text-[#6B6860]">
                            {stage.count} deal{stage.count !== 1 ? 's' : ''}
                          </span>
                          {stage.value > 0 && (
                            <span className="text-sm font-medium text-[#008cff]">
                              {formatCurrency(stage.value)}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Recent Emails from Resend */}
          {crm.emails && crm.emails.recent.length > 0 && (
            <div>
              <h3 className="text-sm font-syne font-semibold text-[#6B6860] uppercase tracking-wide mb-3">
                Recent Emails
              </h3>
              <div className="rounded-lg bg-[#111111] border border-[#222222]">
                <div className="divide-y divide-[#222222]">
                  {crm.emails.recent.map((email) => (
                    <div
                      key={email.id}
                      className="flex items-center justify-between px-5 py-3.5 hover:bg-[#0a0a0a] transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Mail size={14} className="text-[#008cff] flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm text-[#EDE8DE] truncate">{email.subject || '(no subject)'}</p>
                          <p className="text-xs text-[#6B6860] truncate">
                            To: {email.to.join(', ')}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-[#6B6860] flex-shrink-0 ml-4">
                        {new Date(email.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Fallback: workspace targets from reporter */}
      {!crm && workspace && (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-syne font-semibold text-[#6B6860] uppercase tracking-wide mb-3">
              Outreach Stats
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={<Mail size={18} />} label="Emails Sent" value={workspace.emailsSent} />
              <StatCard icon={<Users size={18} />} label="Leads Total" value={workspace.leadsTotal} />
              <StatCard icon={<ListChecks size={18} />} label="Pipeline Entries" value={workspace.trackerEntries} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
