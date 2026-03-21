'use client'

interface SnapshotReport {
  id: string
  title: string
  publishedAt: string
  publishedBy: { name: string }
  notes?: string | null
}

interface ReportSnapshotProps {
  report: SnapshotReport
}

function isWithin7Days(dateStr: string): boolean {
  const published = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - published.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  return diffDays >= 0 && diffDays < 7
}

function formatPublishedDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function ReportSnapshot({ report }: ReportSnapshotProps) {
  const isNew = isWithin7Days(report.publishedAt)
  const truncatedNotes =
    report.notes && report.notes.length > 100
      ? `${report.notes.slice(0, 100)}…`
      : report.notes

  return (
    <div className="flex items-start justify-between gap-4 px-5 py-4 bg-[#111111] border border-[#222222]">
      <div className="min-w-0 flex-1">
        {/* Title + NEW badge */}
        <div className="flex items-center gap-2 mb-1">
          <span className="font-syne font-bold text-sm text-[#EDE8DE] truncate">
            {report.title}
          </span>
          {isNew && (
            <span className="shrink-0 px-1.5 py-0.5 text-[10px] font-syne font-bold uppercase tracking-widest bg-[#001a33] border border-[#008cff] text-[#008cff]">
              NEW
            </span>
          )}
        </div>

        {/* Published by + date */}
        <div className="text-[11px] font-syne text-[#6B6860] mb-1">
          Published by {report.publishedBy.name} · {formatPublishedDate(report.publishedAt)}
        </div>

        {/* Notes preview */}
        {truncatedNotes && (
          <div className="font-fraunces text-xs text-[#6B6860] leading-relaxed">
            {truncatedNotes}
          </div>
        )}
      </div>

      {/* View button */}
      <button
        onClick={() => console.log('View report:', report.id)}
        className="shrink-0 px-3 py-1.5 text-[10px] font-syne font-bold uppercase tracking-widest text-[#008cff] border border-[#008cff] hover:bg-[#001a33] transition-colors"
      >
        View →
      </button>
    </div>
  )
}
