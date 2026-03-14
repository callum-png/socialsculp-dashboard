import { PageHeader } from '@/components/shared/PageHeader'
import { StatCardGrid } from '@/components/dashboard/StatCardGrid'
import { ChartContainer } from '@/components/charts/ChartContainer'
import { ROASAreaChart } from '@/components/charts/ROASAreaChart'
import { EngagementLineChart } from '@/components/charts/EngagementLineChart'
import { ReachBarChart } from '@/components/charts/ReachBarChart'
import { PlatformPieChart } from '@/components/charts/PlatformPieChart'
import { generateAnalyticsData, MOCK_CAMPAIGNS } from '@/lib/mock-data'
import { TrendingUp, Eye, DollarSign, BarChart3 } from 'lucide-react'

export default function AdminAnalyticsPage() {
  const analytics = generateAnalyticsData('admin-analytics', 30)

  const roasData = analytics.map((d) => ({ date: d.date, roas: d.roas }))

  const engData = analytics.map((d) => ({
    date: d.date,
    tiktok: parseFloat((d.engagementRate * 1.25).toFixed(2)),
    instagram: parseFloat((d.engagementRate * 0.7).toFixed(2)),
  }))

  // Per-campaign reach bar data
  const campaignReachData = MOCK_CAMPAIGNS.map((c) => {
    const cAnalytics = generateAnalyticsData(c.name, 30)
    const total = cAnalytics.reduce((s, d) => s + d.reach, 0)
    return {
      name: c.name.split('—')[0].trim(),
      tiktok: Math.round(total * 0.58),
      instagram: Math.round(total * 0.42),
    }
  })

  const platformPieData = [
    { name: 'TikTok', value: 7_200_000 },
    { name: 'Instagram', value: 5_200_000 },
  ]

  const stats = [
    {
      title: 'Total Reach',
      value: '12.4M',
      icon: Eye,
      delta: 18.2,
      deltaLabel: 'vs last month',
    },
    {
      title: 'Total Impressions',
      value: '28.1M',
      icon: BarChart3,
      delta: 12.5,
      deltaLabel: 'vs last month',
    },
    {
      title: 'Avg ROAS',
      value: '4.3×',
      icon: TrendingUp,
      delta: 5.4,
      deltaLabel: 'vs last month',
      accent: true,
    },
    {
      title: 'Total Spend',
      value: '$267K',
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
        {/* Stat cards */}
        <StatCardGrid stats={stats} />

        {/* ROAS area chart — full width */}
        <ChartContainer
          title="ROAS Trend — Last 30 Days"
          description="Return on ad spend across all active campaigns"
        >
          <ROASAreaChart data={roasData} />
        </ChartContainer>

        {/* Engagement + Platform pie */}
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

        {/* Per-campaign reach */}
        <ChartContainer
          title="Reach by Campaign"
          description="TikTok vs Instagram reach per campaign"
        >
          <ReachBarChart data={campaignReachData} height={300} />
        </ChartContainer>
      </div>
    </div>
  )
}
