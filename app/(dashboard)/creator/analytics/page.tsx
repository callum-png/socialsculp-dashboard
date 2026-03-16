import { PageHeader } from '@/components/shared/PageHeader'
import { ChartContainer } from '@/components/charts/ChartContainer'
import { EngagementLineChart } from '@/components/charts/EngagementLineChart'
import { MOCK_CREATORS, generateAnalyticsData } from '@/lib/mock-data'
import { formatNumber, formatPercent } from '@/lib/utils'
import { TrendingUp } from 'lucide-react'

const creator = MOCK_CREATORS[0]

export default function CreatorAnalyticsPage() {
  const analytics = generateAnalyticsData(creator.handle, 30)

  const engData = analytics.map((d) => ({
    date: d.date,
    tiktok: parseFloat((d.engagementRate * 1.3).toFixed(2)),
    instagram: parseFloat((d.engagementRate * 0.65).toFixed(2)),
  }))

  return (
    <div>
      <PageHeader
        title="My Analytics"
        description="Last 30 days performance overview"
      />

      <div className="p-6 space-y-6">
        {/* Follower growth note */}
        <div className="bg-[#001a33] border border-[#003366] p-4 flex items-center gap-3">
          <TrendingUp size={16} className="text-[#008cff] shrink-0" />
          <span className="text-sm font-syne font-bold text-[#008cff]">
            +12.4K followers this month
          </span>
          <span className="text-xs font-fraunces text-[#6B6860]">
            Combined TikTok + Instagram growth
          </span>
        </div>

        {/* Platform stats grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* TikTok */}
          <div className="bg-[#111111] border border-[#222222] p-5">
            <h3 className="text-sm font-syne font-bold text-[#EDE8DE] mb-4">TikTok</h3>
            <div className="space-y-3">
              {[
                { label: 'Followers', value: formatNumber(creator.tiktokFollowers) },
                { label: 'Avg Views', value: formatNumber(creator.tiktokAvgViews) },
                { label: 'Engagement Rate', value: formatPercent(creator.tiktokEngRate), accent: true },
              ].map((row) => (
                <div key={row.label} className="flex justify-between items-center py-2 border-b border-[#1A1A1A]">
                  <span className="text-[10px] font-syne uppercase tracking-widest text-[#6B6860]">
                    {row.label}
                  </span>
                  <span
                    className={`text-sm font-syne font-bold ${
                      row.accent ? 'text-[#008cff]' : 'text-[#EDE8DE]'
                    }`}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Instagram */}
          <div className="bg-[#111111] border border-[#222222] p-5">
            <h3 className="text-sm font-syne font-bold text-[#EDE8DE] mb-4">Instagram</h3>
            <div className="space-y-3">
              {[
                { label: 'Followers', value: formatNumber(creator.instagramFollowers) },
                { label: 'Avg Likes', value: formatNumber(creator.instagramAvgLikes) },
                { label: 'Engagement Rate', value: formatPercent(creator.instagramEngRate), accent: true },
              ].map((row) => (
                <div key={row.label} className="flex justify-between items-center py-2 border-b border-[#1A1A1A]">
                  <span className="text-[10px] font-syne uppercase tracking-widest text-[#6B6860]">
                    {row.label}
                  </span>
                  <span
                    className={`text-sm font-syne font-bold ${
                      row.accent ? 'text-[#008cff]' : 'text-[#EDE8DE]'
                    }`}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Engagement line chart */}
        <ChartContainer
          title="Engagement Rate — Last 30 Days"
          description="Daily TikTok and Instagram engagement"
        >
          <EngagementLineChart data={engData} />
        </ChartContainer>
      </div>
    </div>
  )
}
