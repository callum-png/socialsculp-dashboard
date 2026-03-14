import { PageHeader } from '@/components/shared/PageHeader'
import { StatCardGrid } from '@/components/dashboard/StatCardGrid'
import { ChartContainer } from '@/components/charts/ChartContainer'
import { EngagementLineChart } from '@/components/charts/EngagementLineChart'
import { MOCK_CREATORS, generateAnalyticsData } from '@/lib/mock-data'
import { formatNumber, formatCurrency } from '@/lib/utils'
import { TrendingUp, Users, Megaphone, DollarSign, Calendar } from 'lucide-react'

const creator = MOCK_CREATORS[0] // Ashton Hall

const UPCOMING_DELIVERABLES = [
  { type: 'TikTok Video', campaign: 'Cal AI — Q1 Growth Push', due: 'Mar 20, 2026', status: 'Pending' },
  { type: 'Instagram Reel', campaign: 'Alpha Lion — Pre-Workout Launch', due: 'Mar 25, 2026', status: 'Pending' },
  { type: 'Story Set (3)', campaign: 'Sweatcoin — Summer Challenge', due: 'Mar 22, 2026', status: 'Due Soon' },
]

export default function CreatorOverviewPage() {
  const analytics = generateAnalyticsData(creator.handle, 30)

  const engData = analytics.map((d) => ({
    date: d.date,
    tiktok: parseFloat((d.engagementRate * 1.3).toFixed(2)),
    instagram: parseFloat((d.engagementRate * 0.65).toFixed(2)),
  }))

  const stats = [
    {
      title: 'TikTok Followers',
      value: formatNumber(creator.tiktokFollowers),
      icon: Users,
      delta: 3.2,
      deltaLabel: 'this month',
    },
    {
      title: 'IG Followers',
      value: formatNumber(creator.instagramFollowers),
      icon: Users,
      delta: 1.8,
      deltaLabel: 'this month',
    },
    {
      title: 'Active Campaigns',
      value: 3,
      icon: Megaphone,
    },
    {
      title: 'Total Earned',
      value: formatCurrency(18500),
      icon: DollarSign,
      delta: 22.4,
      deltaLabel: 'vs last month',
      accent: true,
    },
  ]

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${creator.name.split(' ')[0]}.`}
        description="Here's an overview of your creator activity"
      />

      <div className="p-6 space-y-6">
        {/* Stat cards */}
        <StatCardGrid stats={stats} />

        {/* Engagement chart */}
        <ChartContainer
          title="Engagement Rate — Last 30 Days"
          description="Your TikTok and Instagram engagement trends"
        >
          <EngagementLineChart data={engData} />
        </ChartContainer>

        {/* Upcoming deadlines */}
        <div className="bg-[#111111] border border-[#222222]">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-[#222222]">
            <Calendar size={14} className="text-[#6B6860]" />
            <h3 className="text-sm font-syne font-bold text-[#EDE8DE]">Upcoming Deadlines</h3>
          </div>
          <div className="divide-y divide-[#1A1A1A]">
            {UPCOMING_DELIVERABLES.map((d, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-4">
                <div>
                  <div className="text-sm font-syne font-bold text-[#EDE8DE]">{d.type}</div>
                  <div className="text-xs font-fraunces text-[#6B6860]">{d.campaign}</div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <span className="text-xs font-syne text-[#6B6860]">{d.due}</span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 text-[10px] font-syne font-bold uppercase tracking-widest border ${
                      d.status === 'Due Soon'
                        ? 'bg-[#1A1200] text-[#FFB547] border-[#3A2D00]'
                        : 'bg-[#1A1A1A] text-[#6B6860] border-[#2A2A2A]'
                    }`}
                  >
                    {d.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
