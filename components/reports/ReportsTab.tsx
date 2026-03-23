'use client'

import { useEffect, useState } from 'react'
import { LiveCampaignReport } from './LiveCampaignReport'
import { ReportSnapshot } from './ReportSnapshot'

// ─── Types ────────────────────────────────────────────────────────────────────

interface SnapshotReport {
  id: string
  title: string
  publishedAt: string
  publishedBy: { name: string }
  notes?: string | null
}

interface Props {
  campaignId: string
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function SnapshotListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="flex items-start justify-between gap-4 px-5 py-4 bg-card border border-border"
        >
          <div className="flex-1 space-y-2">
            <div className="h-3 w-48 animate-pulse bg-background rounded" />
            <div className="h-2.5 w-32 animate-pulse bg-background rounded" />
          </div>
          <div className="shrink-0 h-7 w-16 animate-pulse bg-background rounded" />
        </div>
      ))}
    </div>
  )
}

// ─── Divider ─────────────────────────────────────────────────────────────────

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="relative flex items-center gap-4 py-2">
      <div className="flex-1 h-px bg-border" />
      <span className="shrink-0 text-[10px] font-syne font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  )
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ReportsTab({ campaignId }: Props) {
  const [snapshots, setSnapshots] = useState<SnapshotReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch(`/api/campaign-reports?campaignId=${campaignId}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body?.error ?? `HTTP ${res.status}`)
        }
        return res.json() as Promise<SnapshotReport[]>
      })
      .then((data) => {
        setSnapshots(data)
        setLoading(false)
      })
      .catch((err: Error) => {
        setError(err.message ?? 'Failed to load reports')
        setLoading(false)
      })
  }, [campaignId])

  return (
    <div className="space-y-6">
      {/* Live campaign report */}
      <LiveCampaignReport campaignId={campaignId} />

      {/* Divider */}
      <SectionDivider label="Published Reports" />

      {/* Snapshots list */}
      {loading ? (
        <SnapshotListSkeleton />
      ) : error ? (
        <div className="py-10 text-center text-[#FF4747] text-sm font-syne">{error}</div>
      ) : snapshots.length === 0 ? (
        <div className="py-10 text-center text-muted-foreground text-sm font-syne">
          No reports published yet. SocialSculp will publish milestone reports here.
        </div>
      ) : (
        <div className="space-y-2">
          {snapshots.map((r) => (
            <ReportSnapshot key={r.id} report={r} />
          ))}
        </div>
      )}
    </div>
  )
}
