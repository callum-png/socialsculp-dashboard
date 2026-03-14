import { notFound } from 'next/navigation'
import { MapPin } from 'lucide-react'
import { MOCK_CREATORS, generateAnalyticsData } from '@/lib/mock-data'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCardGrid } from '@/components/dashboard/StatCardGrid'
import { ChartContainer } from '@/components/charts/ChartContainer'
import { EngagementLineChart } from '@/components/charts/EngagementLineChart'
import { formatNumber, formatPercent } from '@/lib/utils'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function CreatorDetailPage({ params }: PageProps) {
  const { id } = await params
  const index = parseInt(id, 10)

  if (isNaN(index) || index < 0 || index >= MOCK_CREATORS.length) {
    notFound()
  }

  const creator = MOCK_CREATORS[index]
  const analytics = generateAnalyticsData(creator.handle, 30)

  const engData = analytics.map((d) => ({
    date: d.date,
    tiktok: parseFloat((d.engagementRate * 1.3).toFixed(2)),
    instagram: parseFloat((d.engagementRate * 0.65).toFixed(2)),
  }))

  const initials = creator.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const avgEngRate = ((creator.tiktokEngRate + creator.instagramEngRate) / 2)

  const stats = [
    { title: 'TikTok Followers', value: formatNumber(creator.tiktokFollowers) },
    { title: 'IG Followers', value: formatNumber(creator.instagramFollowers) },
    { title: 'Avg Eng Rate', value: formatPercent(avgEngRate), accent: true },
    { title: 'Active Campaigns', value: 3 },
  ]

  return (
    <div>
      <PageHeader
        title={creator.handle}
        breadcrumb={[
          { label: 'Creators', href: '/admin/creators' },
          { label: creator.handle },
        ]}
      />

      <div className="p-6 space-y-6">
        {/* Creator header */}
        <div className="bg-[#111111] border border-[#222222] p-5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-[#1A1A1A] border border-[#222222] flex items-center justify-center shrink-0">
              <span className="font-syne text-lg font-bold text-[#C9FF47]">{initials}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-syne text-xl font-bold text-[#EDE8DE]">{creator.handle}</div>
              <div className="font-fraunces text-sm text-[#6B6860] mb-3">{creator.name}</div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {creator.niche.map((n) => (
                  <span
                    key={n}
                    className="px-2 py-0.5 text-[10px] font-syne uppercase tracking-widest bg-[#1A1A1A] border border-[#222222] text-[#6B6860]"
                  >
                    {n}
                  </span>
                ))}
              </div>
              {creator.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin size={11} className="text-[#6B6860]" />
                  <span className="font-fraunces text-xs text-[#6B6860]">{creator.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <StatCardGrid stats={stats} />

        {/* Platform stats grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* TikTok */}
          <div className="bg-[#111111] border border-[#222222] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-syne font-bold text-[#EDE8DE]">TikTok</h3>
              <span className="text-[10px] font-syne uppercase tracking-widest text-[#6B6860] bg-[#1A1A1A] border border-[#222222] px-2 py-0.5">
                @{creator.handle.replace('@', '')}
              </span>
            </div>
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
                      row.accent ? 'text-[#C9FF47]' : 'text-[#EDE8DE]'
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-syne font-bold text-[#EDE8DE]">Instagram</h3>
              <span className="text-[10px] font-syne uppercase tracking-widest text-[#6B6860] bg-[#1A1A1A] border border-[#222222] px-2 py-0.5">
                @{creator.handle.replace('@', '')}
              </span>
            </div>
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
                      row.accent ? 'text-[#C9FF47]' : 'text-[#EDE8DE]'
                    }`}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Engagement chart */}
        <ChartContainer
          title="Engagement Rate — Last 30 Days"
          description="TikTok vs Instagram daily engagement"
        >
          <EngagementLineChart data={engData} />
        </ChartContainer>
      </div>
    </div>
  )
}
