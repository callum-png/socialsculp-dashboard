'use client'

import { useState } from 'react'
import { CheckCircle2, XCircle, Clock, FileText, ChevronDown, ChevronRight } from 'lucide-react'
import type { CronReportData, CronReport } from './MissionControlClient'

interface TabProps {
  data: CronReportData | null
  onRefresh: () => void
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function duration(start: string, end: string): string {
  const ms = new Date(end).getTime() - new Date(start).getTime()
  if (ms < 1000) return `${ms}ms`
  const s = Math.floor(ms / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  return `${m}m ${s % 60}s`
}

function ReportCard({ report }: { report: CronReport }) {
  const [expanded, setExpanded] = useState(false)
  const isSuccess = report.status === 'success'

  return (
    <div className="rounded-lg bg-[#111111] border border-[#222222] overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-5 py-4 flex items-start gap-4 hover:bg-[#1a1a1a] transition-colors"
      >
        {/* Status icon */}
        <div className="mt-0.5 flex-shrink-0">
          {isSuccess ? (
            <CheckCircle2 size={16} className="text-emerald-400" />
          ) : (
            <XCircle size={16} className="text-red-400" />
          )}
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-syne font-semibold text-[#EDE8DE]">
              {report.taskId}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                isSuccess
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-red-500/10 text-red-400'
              }`}
            >
              {isSuccess ? 'Success' : 'Error'}
            </span>
          </div>
          {report.summary && (
            <p className="text-sm text-[#EDE8DE]/80 mt-1 line-clamp-2">{report.summary}</p>
          )}
          <div className="flex items-center gap-4 mt-2 text-xs text-[#6B6860]">
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {relativeTime(report.startedAt)}
            </span>
            <span>{formatDateTime(report.startedAt)}</span>
            <span>Ran in {duration(report.startedAt, report.completedAt)}</span>
          </div>
        </div>

        {/* Expand toggle */}
        <div className="flex-shrink-0 text-[#6B6860]">
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>
      </button>

      {/* Expanded details */}
      {expanded && report.details && (
        <div className="px-5 pb-4 border-t border-[#222222] pt-4">
          <pre className="text-xs text-[#EDE8DE]/70 font-mono whitespace-pre-wrap leading-relaxed bg-[#090909] rounded-md p-4 border border-[#222222] overflow-auto max-h-80">
            {report.details}
          </pre>
        </div>
      )}
    </div>
  )
}

export function TaskFeedTab({ data, onRefresh }: TabProps) {
  if (!data || data.reports.length === 0) {
    return (
      <div className="rounded-lg bg-[#111111] border border-[#222222] p-12 text-center">
        <FileText size={32} className="mx-auto text-[#6B6860] mb-4" />
        <p className="text-[#EDE8DE] font-syne font-semibold text-lg">No Reports Yet</p>
        <p className="text-[#6B6860] text-sm mt-1">
          Task reports will appear here once scheduled jobs start running.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-syne font-semibold text-[#6B6860] uppercase tracking-wide">
            Daily Briefs & Reports
          </h3>
          <span className="text-xs text-[#6B6860] bg-[#222222] px-2 py-0.5 rounded-full">
            {data.reports.length}
          </span>
        </div>
        <button
          onClick={onRefresh}
          className="text-xs text-[#6B6860] hover:text-[#EDE8DE] transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-3">
        {data.reports.map((report, i) => (
          <ReportCard key={`${report.taskId}-${report.startedAt}-${i}`} report={report} />
        ))}
      </div>
    </div>
  )
}
