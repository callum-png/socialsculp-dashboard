'use client'

import { useEffect, useState } from 'react'
import { Printer } from 'lucide-react'
import { formatNumber, formatCurrency, budgetPercent } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReportData {
  totalReach: number
  avgEngagementRate: number
  postsLive: number
  totalDeliverables: number
  topCreators: Array<{
    creatorId: string
    handle: string
    totalViews: number
    avgEngagementRate: number
  }>
  platformBreakdown: Record<string, number>
  targetROAS: number | null
  spentBudget: number
  totalBudget: number
  targetReach: number | null
  latestROAS: number | null
}

interface Props {
  campaignId: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function engagementColor(rate: number): string {
  if (rate >= 7) return 'text-[#22c55e]'   // green
  if (rate >= 5) return 'text-[#eab308]'   // yellow
  return 'text-muted-foreground'                  // gray
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function KpiSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-card border border-border p-4 space-y-2">
          <div className="h-2.5 w-20 animate-pulse bg-muted rounded" />
          <div className="h-6 w-16 animate-pulse bg-muted rounded" />
        </div>
      ))}
    </div>
  )
}

// ─── Component ───────────────────────────────────────────────────────────────

export function LiveCampaignReport({ campaignId }: Props) {
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch(`/api/campaigns/${campaignId}/report`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body?.error ?? `HTTP ${res.status}`)
        }
        return res.json() as Promise<ReportData>
      })
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch((err: Error) => {
        setError(err.message ?? 'Failed to load report data')
        setLoading(false)
      })
  }, [campaignId])

  return (
    <div className="space-y-6">
      <style>{`@media print { .no-print { display: none !important; } }`}</style>

      {/* Header row */}
      <div className="flex items-center justify-between">
        <h2 className="font-syne font-bold text-sm uppercase tracking-widest text-foreground">
          Live Campaign Report
        </h2>
        <button
          onClick={() => window.print()}
          className="no-print flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-syne font-bold uppercase tracking-widest text-[#008cff] border border-[#008cff] hover:bg-blue-50 transition-colors"
        >
          <Printer size={12} />
          Export PDF
        </button>
      </div>

      {/* Loading */}
      {loading && <KpiSkeleton />}

      {/* Error */}
      {!loading && error && (
        <div className="py-10 text-center text-[#FF4747] text-sm font-syne">
          {error ?? 'Failed to load report data'}
        </div>
      )}

      {/* Content */}
      {!loading && !error && data && (
        <>
          {/* KPI Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Total Reach */}
            <div className="bg-card border border-border p-4">
              <div className="text-[10px] font-syne font-bold uppercase tracking-widest text-muted-foreground mb-1">
                Total Reach
              </div>
              <div className="font-syne font-bold text-xl text-foreground">
                {formatNumber(data.totalReach)}
              </div>
              {data.targetReach !== null && (
                <div className="text-[10px] font-syne text-muted-foreground mt-0.5">
                  / {formatNumber(data.targetReach)} target
                </div>
              )}
            </div>

            {/* Avg Engagement */}
            <div className="bg-card border border-border p-4">
              <div className="text-[10px] font-syne font-bold uppercase tracking-widest text-muted-foreground mb-1">
                Avg Engagement
              </div>
              <div className="font-syne font-bold text-xl text-foreground">
                {data.avgEngagementRate.toFixed(1)}%
              </div>
            </div>

            {/* Posts Live */}
            <div className="bg-card border border-border p-4">
              <div className="text-[10px] font-syne font-bold uppercase tracking-widest text-muted-foreground mb-1">
                Posts Live
              </div>
              <div className="font-syne font-bold text-xl text-foreground">
                {data.postsLive} / {data.totalDeliverables}
              </div>
            </div>

            {/* ROAS */}
            <div className="bg-card border border-border p-4">
              <div className="text-[10px] font-syne font-bold uppercase tracking-widest text-muted-foreground mb-1">
                ROAS
              </div>
              <div className="font-syne font-bold text-xl text-foreground">
                {data.latestROAS !== null ? `${data.latestROAS.toFixed(1)}x` : '—'}
              </div>
              {data.targetROAS !== null && (
                <div className="text-[10px] font-syne text-muted-foreground mt-0.5">
                  / {data.targetROAS}x target
                </div>
              )}
            </div>
          </div>

          {/* Spend Progress */}
          {data.totalBudget > 0 && (
            <div className="bg-card border border-border p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-syne font-bold uppercase tracking-widest text-muted-foreground">
                  Budget Spend
                </span>
                <span className="text-[11px] font-syne text-muted-foreground">
                  {formatCurrency(data.spentBudget)} / {formatCurrency(data.totalBudget)}
                  <span className="ml-1.5 text-foreground">
                    ({budgetPercent(data.spentBudget, data.totalBudget)}%)
                  </span>
                </span>
              </div>
              <div className="h-2 w-full bg-card border border-border overflow-hidden">
                <div
                  className="h-full bg-[#008cff] transition-all"
                  style={{ width: `${budgetPercent(data.spentBudget, data.totalBudget)}%` }}
                />
              </div>
            </div>
          )}

          {/* Top Creators */}
          {data.topCreators.length > 0 && (
            <div className="bg-card border border-border">
              <div className="px-5 py-3 border-b border-border">
                <span className="text-[10px] font-syne font-bold uppercase tracking-widest text-muted-foreground">
                  Top Creators
                </span>
              </div>
              <div className="divide-y divide-border">
                {data.topCreators.slice(0, 5).map((creator, index) => (
                  <div
                    key={creator.creatorId}
                    className="flex items-center gap-4 px-5 py-3"
                  >
                    {/* Rank */}
                    <span className="shrink-0 w-5 text-[11px] font-syne font-bold text-muted-foreground">
                      #{index + 1}
                    </span>
                    {/* Handle */}
                    <span className="flex-1 text-sm font-syne text-foreground truncate">
                      @{creator.handle}
                    </span>
                    {/* Views */}
                    <span className="text-[11px] font-syne text-muted-foreground">
                      {formatNumber(creator.totalViews)} views
                    </span>
                    {/* Engagement rate */}
                    <span
                      className={`shrink-0 text-[11px] font-syne font-bold ${engagementColor(creator.avgEngagementRate)}`}
                    >
                      {creator.avgEngagementRate.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
