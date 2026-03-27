'use client'

import { Mail, MailPlus, Users, ListChecks, Inbox } from 'lucide-react'
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
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="rounded-lg bg-[#111111] border border-[#222222] p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2 text-[#6B6860]">
        {icon}
        <span className="text-xs font-syne uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-2xl font-syne font-bold text-[#EDE8DE]">{value}</p>
    </div>
  )
}

export function RevenueTab({ data }: TabProps) {
  const workspace = data?.latest?.workspace as
    | { targets: string[]; emailsSent: number; emailsQueued: number; leadsTotal: number; trackerEntries: number }
    | undefined

  if (!workspace) {
    return (
      <div className="rounded-lg bg-[#111111] border border-[#222222] p-8 text-center">
        <Inbox size={32} className="mx-auto text-[#6B6860] mb-3" />
        <p className="text-[#EDE8DE] font-syne font-semibold">No Workspace Data</p>
        <p className="text-[#6B6860] text-sm mt-1">
          Outreach and pipeline data will appear here once OpenClaw reports workspace metrics.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Outreach Stats */}
      <div>
        <h3 className="text-sm font-syne font-semibold text-[#6B6860] uppercase tracking-wide mb-3">
          Outreach Stats
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Mail size={18} />}
            label="Emails Sent"
            value={workspace.emailsSent}
          />
          <StatCard
            icon={<MailPlus size={18} />}
            label="Emails Queued"
            value={workspace.emailsQueued}
          />
          <StatCard
            icon={<Users size={18} />}
            label="Leads Total"
            value={workspace.leadsTotal}
          />
          <StatCard
            icon={<ListChecks size={18} />}
            label="Pipeline Entries"
            value={workspace.trackerEntries}
          />
        </div>
      </div>

      {/* Pipeline Table */}
      <div className="rounded-lg bg-[#111111] border border-[#222222]">
        <div className="px-5 py-4 border-b border-[#222222]">
          <h3 className="text-sm font-syne font-semibold text-[#EDE8DE]">Pipeline Targets</h3>
        </div>

        {workspace.targets.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-[#6B6860] text-sm">No targets in pipeline yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#222222]">
            {workspace.targets.map((target, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-5 py-3 hover:bg-[#0a0a0a] transition-colors"
              >
                <span className="text-sm text-[#EDE8DE]">{target}</span>
                <span className="text-xs font-syne px-2.5 py-0.5 rounded-full bg-[#008cff]/10 text-[#008cff] border border-[#008cff]/20">
                  Active
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
