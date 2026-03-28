'use client'

import { useState } from 'react'
import { Play, Clock, CheckCircle2, XCircle, Loader2, CalendarClock, Timer } from 'lucide-react'
import type { OpenClawData } from './MissionControlClient'

interface TabProps {
  data: OpenClawData | null
  executeCommand: (cmd: string) => Promise<{ output: string; exitCode: number }>
  onRefresh: () => void
}

function relativeTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  const now = Date.now()
  const then = new Date(iso).getTime()
  const diffMs = now - then
  const future = diffMs < 0
  const abs = Math.abs(diffMs)

  const minutes = Math.floor(abs / 60000)
  const hours = Math.floor(abs / 3600000)
  const days = Math.floor(abs / 86400000)

  if (minutes < 1) return future ? 'in <1m' : 'just now'
  if (minutes < 60) return future ? `in ${minutes}m` : `${minutes}m ago`
  if (hours < 24) return future ? `in ${hours}h` : `${hours}h ago`
  return future ? `in ${days}d` : `${days}d ago`
}

function StatusBadge({ status }: { status: string | undefined }) {
  if (!status) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#222222] text-[#6B6860]">
        Unknown
      </span>
    )
  }

  if (status === 'running') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#008cff]/10 text-[#008cff]">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#008cff] opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#008cff]" />
        </span>
        Running
      </span>
    )
  }

  if (status === 'success') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">
        <CheckCircle2 size={12} />
        Success
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400">
      <XCircle size={12} />
      Error
    </span>
  )
}

export function CronJobsTab({ data, executeCommand, onRefresh }: TabProps) {
  const [runningJob, setRunningJob] = useState<string | null>(null)

  // v2 payload sends { jobs: [], total: 0 }, legacy sends CronJob[]
  const rawCrons = data?.latest?.crons
  const crons: any[] = Array.isArray(rawCrons) ? rawCrons : (rawCrons?.jobs ?? [])

  const handleRunNow = async (name: string) => {
    setRunningJob(name)
    try {
      await executeCommand(`openclaw cron run ${name}`)
      onRefresh()
    } catch {
      // error handled upstream
    } finally {
      setRunningJob(null)
    }
  }

  if (!data) {
    return (
      <div className="rounded-lg bg-[#111111] border border-[#222222] p-8 text-center">
        <Clock size={24} className="mx-auto text-[#6B6860] mb-3" />
        <p className="text-[#6B6860] text-sm">Waiting for data...</p>
      </div>
    )
  }

  if (crons.length === 0) {
    return (
      <div className="rounded-lg bg-[#111111] border border-[#222222] p-12 text-center">
        <CalendarClock size={32} className="mx-auto text-[#6B6860] mb-4" />
        <p className="text-[#EDE8DE] font-syne font-semibold text-lg">No Cron Jobs</p>
        <p className="text-[#6B6860] text-sm mt-1">
          No scheduled jobs are configured. Use the terminal to add one.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg bg-[#111111] border border-[#222222] overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#222222] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarClock size={18} className="text-[#008cff]" />
          <h3 className="text-[#EDE8DE] font-syne font-semibold">Cron Jobs</h3>
          <span className="text-xs text-[#6B6860] bg-[#222222] px-2 py-0.5 rounded-full">
            {crons.length}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#222222]">
              <th className="text-left text-xs font-medium text-[#6B6860] uppercase tracking-wide px-6 py-3 font-syne">
                Name
              </th>
              <th className="text-left text-xs font-medium text-[#6B6860] uppercase tracking-wide px-6 py-3 font-syne">
                Schedule
              </th>
              <th className="text-left text-xs font-medium text-[#6B6860] uppercase tracking-wide px-6 py-3 font-syne">
                Last Run
              </th>
              <th className="text-left text-xs font-medium text-[#6B6860] uppercase tracking-wide px-6 py-3 font-syne">
                Next Run
              </th>
              <th className="text-left text-xs font-medium text-[#6B6860] uppercase tracking-wide px-6 py-3 font-syne">
                Status
              </th>
              <th className="text-right text-xs font-medium text-[#6B6860] uppercase tracking-wide px-6 py-3 font-syne">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222222]">
            {crons.map((job) => {
              const isRunning = runningJob === job.name
              return (
                <tr
                  key={job.id ?? job.name}
                  className="hover:bg-[#1a1a1a] transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Timer size={14} className="text-[#6B6860] shrink-0" />
                      <span className="text-[#EDE8DE] text-sm font-medium">{job.name}</span>
                      {!job.enabled && (
                        <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-[#222222] text-[#6B6860]">
                          Disabled
                        </span>
                      )}
                    </div>
                    {job.runCount != null && (
                      <p className="text-[#6B6860] text-xs mt-0.5 ml-[22px]">
                        {job.runCount} total runs
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-xs text-[#EDE8DE]/70 bg-[#090909] px-2 py-1 rounded font-mono">
                      {job.schedule}
                    </code>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#6B6860]">
                    {relativeTime(job.lastRun)}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#6B6860]">
                    {relativeTime(job.nextRun)}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={job.lastStatus} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleRunNow(job.name)}
                      disabled={isRunning}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium
                        bg-[#008cff]/10 text-[#008cff] hover:bg-[#008cff]/20
                        disabled:opacity-50 disabled:cursor-not-allowed
                        transition-colors"
                    >
                      {isRunning ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          Running...
                        </>
                      ) : (
                        <>
                          <Play size={14} />
                          Run Now
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
