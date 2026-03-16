import { PageHeader } from '@/components/shared/PageHeader'
import { StatCardGrid } from '@/components/dashboard/StatCardGrid'
import { ChartContainer } from '@/components/charts/ChartContainer'
import { ROASAreaChart } from '@/components/charts/ROASAreaChart'
import { EngagementLineChart } from '@/components/charts/EngagementLineChart'
import { ReachBarChart } from '@/components/charts/ReachBarChart'
import { PlatformPieChart } from '@/components/charts/PlatformPieChart'
import { getDb } from '@/lib/db'
import { generateAnalyticsData } from '@/lib/mock-data'
import { formatNumber, formatCurrency } from '@/lib/utils'
import { TrendingUp, Eye, DollarSign, BarChart3 } from 'lucide-react'

export default async function AdminAnalyticsPage() {
  const db = getDb()

  // Aggregate real analytics snapshots if available
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [campaigns, snapshots] = await Promise.all([
    db.campaign.findMany({ select: { id: true, name: true } }),
    db.analyticsSnapshot.findMany({
      where: { date: { gte: thirtyDaysAgo } },
      orderBy: { date: 'asc' },
    }),
  ])

  const hasRealData = snapshots.length >= 7

  // Aggregate snapshot totals
  const totalReach = hasRealData
    ? snapshots.reduce((s: number, d: typeof snapshots[number]) => s + d.reach, 0)
    : 12_400_000
  const totalImpressions = hasRealData
    ? snapshots.reduce((s: number, d: typeof snapshots[number]) => s + d.impressions, 0)
    : 28_100_000
  const totalSpend = hasRealData
    ? snapshots.reduce((s: number, d: typeof snapshots[number]) => s + d.spend, 0)
    : 267_000
  const avgROAS = hasRealData
    ? snapshots.reduce((s: number, d: typeof snapshots[number]) => s + d.roas, 0) / snapshots.length
    : 4.3

  // Chart data — use real snapshots or fall back to mock
  const mockAnalytics = generateAnalyticsData('admin-analytics', 30)

  const roasData = hasRealData
    ? snapshots.map((d) => ({ date: d.date.toISOString(), roas: d.roas }))
    : mockAnalytics.map((d) => ({ date: d.date, roas: d.roas }))

  const engData = hasRealData
    ? snapshots.map((d) => ({
        date: d.date.toISOString(),
        tiktok: parseFloat((d.engagementRate * 1.25).toFixed(2)),
        instagram: parseFloat((d.engagementRate * 0.7).toFixed(2)),
      }))
    : mockAnalytics.map((d) => ({
        date: d.date,
        tiktok: parseFloat((d.engagementRate * 1.25).toFixed(2)),
        instagram: parseFloat((d.engagementRate * 0.7).toFixed(2)),
      }))

  // Per-campaign reach bar data
  const campaignReachData = campaigns.slice(0, 6).map((c) => {
    const cSnaps = hasRealData
      ? snapshots.filter((s) => s.campaignId === c.id)
      : generateAnalyticsData(c.id, 30)
    const total = cSnaps.reduce((s, d) => s + d.reach, 0)
    return {
      name: c.name.split('—')[0].trim().slice(0, 12),
      tiktok: Math.round(total * 0.58),
      instagram: Math.round(total * 0.42),
    }
  })

  const tiktokReach = hasRealData
    ? snapshots.filter((s) => s.platform === 'TIKTOK' || s.platform === 'BOTH').reduce((s, d) => s + d.reach, 0)
    : 7_200_000
  const igReach = hasRealData
    ? snapshots.filter((s) => s.platform === 'INSTAGRAM' || s.platform === 'BOTH').reduce((s, d) => s + d.reach, 0)
    : 5_200_000

  const platformPieData = [
    { name: 'TikTok', value: tiktokReach || totalReach * 0.58 },
    { name: 'Instagram', value: igReach || totalReach * 0.42 },
  ]

  const stats = [
    {
      title: 'Total Reach',
      value: formatNumber(totalReach),
      icon: Eye,
      delta: 18.2,
      deltaLabel: 'vs last month',
    },
    {
      title: 'Total Impressions',
      value: formatNumber(totalImpressions),
      icon: BarChart3,
      delta: 12.5,
      deltaLabel: 'vs last month',
    },
    {
      title: 'Avg ROAS',
      value: `${avgROAS.toFixed(1)}×`,
      icon: TrendingUp,
      delta: 5.4,
      deltaLabel: 'vs last month',
      accent: true,
    },
    {
      title: 'Total Spend',
      value: formatCurrency(totalSpend),
      icon: DollarSign,
      delta: -3.1,
      deltaLabel: 'vs last month',
    },
  ]

  return (
    <div>
      <PageHeader title="Analytics" description="Last 30 Days">
        <span className="inline-flex items-center px-3 py-1.5 text-[10px] font-syne font-bold uppercase tracking-widest bg-[#1A1A1A] border border-[#222222] text-[#6B6860]">
          Last 30 Days
        </span>
      </PageHeader>

      <div className="p-6 space-y-6">
        <StatCardGrid stats={stats} />

        <ChartContainer
          title="ROAS Trend — Last 30 Days"
          description="Return on ad spend across all active campaigns"
        >
          <ROASAreaChart data={roasData} />
        </ChartContainer>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <ChartContainer
              title="Engagement Rate"
              description="Daily TikTok vs Instagram engagement rate"
            >
              <EngagementLineChart data={engData} />
            </ChartContainer>
          </div>
          <div>
            <ChartContainer
              title="Platform Split"
              description="Reach by platform"
            >
              <PlatformPieChart data={platformPieData} />
            </ChartContainer>
          </div>
        </div>

        {campaignReachData.length > 0 && (
          <ChartContainer
            title="Reach by Campaign"
            description="TikTok vs Instagram reach per campaign"
          >
            <ReachBarChart data={campaignReachData} height={300} />
          </ChartContainer>
        )}
      </div>
    </div>
  )
}
