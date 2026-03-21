import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { getDb } from '@/lib/db'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCardGrid } from '@/components/dashboard/StatCardGrid'
import { ChartContainer } from '@/components/charts/ChartContainer'
import { ROASAreaChart } from '@/components/charts/ROASAreaChart'
import { formatNumber, formatCurrency } from '@/lib/utils'
import { Eye, TrendingUp, DollarSign, BarChart3, Download } from 'lucide-react'

export default async function BrandReportsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const db = getDb()

  // Resolve authenticated user → brand profile
  const user = await db.user.findUnique({
    where: { clerkId: userId },
    include: {
      brandProfile: {
        include: {
          campaigns: {
            include: {
              analyticsSnapshots: {
                orderBy: { date: 'asc' },
              },
            },
          },
        },
      },
    },
  })

  if (!user?.brandProfile) redirect('/sign-in')

  const campaigns = user.brandProfile.campaigns

  // Flatten all snapshots across all campaigns
  const allSnapshots = campaigns.flatMap((c) => c.analyticsSnapshots)

  const hasData = allSnapshots.length > 0

  // ── Aggregated stats ────────────────────────────────────────────────────────
  const totalReach = allSnapshots.reduce((s, d) => s + d.reach, 0)
  const totalImpressions = allSnapshots.reduce((s, d) => s + d.impressions, 0)
  const totalSpend = allSnapshots.reduce((s, d) => s + d.spend, 0)
  const avgROAS =
    allSnapshots.length > 0
      ? allSnapshots.reduce((s, d) => s + d.roas, 0) / allSnapshots.length
      : 0

  // Best performing campaign: highest average ROAS
  let bestCampaignName = '—'
  if (campaigns.length > 0) {
    const ranked = campaigns
      .map((c) => {
        const snaps = c.analyticsSnapshots
        const avg =
          snaps.length > 0
            ? snaps.reduce((s, d) => s + d.roas, 0) / snaps.length
            : 0
        return { name: c.name, avgROAS: avg }
      })
      .filter((c) => c.avgROAS > 0)
      .sort((a, b) => b.avgROAS - a.avgROAS)

    if (ranked.length > 0) bestCampaignName = ranked[0].name
  }

  // ── ROAS chart data: aggregate daily across all campaigns ───────────────────
  const roasByDate = new Map<string, { sum: number; count: number }>()
  for (const snap of allSnapshots) {
    const dateKey = snap.date.toISOString().slice(0, 10)
    const existing = roasByDate.get(dateKey) ?? { sum: 0, count: 0 }
    roasByDate.set(dateKey, {
      sum: existing.sum + snap.roas,
      count: existing.count + 1,
    })
  }

  const roasData = Array.from(roasByDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, { sum, count }]) => ({
      date,
      roas: parseFloat((sum / count).toFixed(2)),
    }))

  // ── Stat cards ──────────────────────────────────────────────────────────────
  const stats = [
    {
      title: 'Total Reach',
      value: hasData ? formatNumber(totalReach) : '—',
      icon: Eye,
    },
    {
      title: 'Impressions',
      value: hasData ? formatNumber(totalImpressions) : '—',
      icon: BarChart3,
    },
    {
      title: 'Avg ROAS',
      value: hasData ? `${avgROAS.toFixed(1)}×` : '—',
      icon: TrendingUp,
      accent: true,
    },
    {
      title: 'Total Spend',
      value: hasData ? formatCurrency(totalSpend) : '—',
      icon: DollarSign,
    },
  ]

  return (
    <div>
      <PageHeader
        title="Reports"
        description={`Last 30 Days — ${user.brandProfile.companyName}`}
      >
        <span className="inline-flex items-center px-3 py-1.5 text-[10px] font-syne font-bold uppercase tracking-widest bg-[#1A1A1A] border border-[#222222] text-[#6B6860]">
          Last 30 Days
        </span>
        <button className="inline-flex items-center gap-2 px-4 py-2 border border-[#222222] text-[#EDE8DE] text-xs font-syne font-bold uppercase tracking-widest hover:border-[#008cff] hover:text-[#008cff] transition-colors">
          <Download size={13} />
          Export Report
        </button>
      </PageHeader>

      <div className="p-6 space-y-6">
        <StatCardGrid stats={stats} />

        {!hasData ? (
          <div className="bg-[#111111] border border-[#222222] p-12 flex flex-col items-center justify-center text-center gap-3">
            <BarChart3 size={32} className="text-[#3A3A3A]" />
            <p className="text-sm font-syne font-bold text-[#6B6860] uppercase tracking-widest">
              No analytics data yet
            </p>
            <p className="text-xs font-fraunces text-[#3A3A3A] max-w-xs">
              Analytics snapshots will appear here once your campaigns are live and
              tracking data has been recorded.
            </p>
          </div>
        ) : (
          <>
            <ChartContainer
              title="ROAS Trend — Last 30 Days"
              description={`Return on ad spend across all campaigns · Best: ${bestCampaignName}`}
            >
              <ROASAreaChart data={roasData} />
            </ChartContainer>
          </>
        )}

        {/* Export notice */}
        <div className="bg-[#111111] border border-[#222222] p-6 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-syne font-bold text-[#EDE8DE] mb-1">
              Full Performance Report
            </h3>
            <p className="text-xs font-fraunces text-[#6B6860]">
              Download a detailed PDF report with all campaign metrics, creator
              performance, and ROAS breakdown.
            </p>
          </div>
          <button className="shrink-0 ml-6 inline-flex items-center gap-2 px-5 py-2.5 bg-[#008cff] text-[#090909] text-xs font-syne font-bold uppercase tracking-widest hover:bg-[#0077dd] transition-colors">
            <Download size={13} />
            Export PDF
          </button>
        </div>
      </div>
    </div>
  )
}
