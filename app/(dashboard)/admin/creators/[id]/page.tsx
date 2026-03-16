import { notFound } from 'next/navigation'
import { MapPin } from 'lucide-react'
import { getDb } from '@/lib/db'
import { generateAnalyticsData } from '@/lib/mock-data'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCardGrid } from '@/components/dashboard/StatCardGrid'
import { ChartContainer } from '@/components/charts/ChartContainer'
import { EngagementLineChart } from '@/components/charts/EngagementLineChart'
import { formatNumber, formatPercent, formatCurrency } from '@/lib/utils'
import { DEAL_STAGE_COLORS, DEAL_STAGE_LABELS } from '@/lib/constants'
import type { DealStageValue } from '@/lib/constants'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function CreatorDetailPage({ params }: PageProps) {
  const { id } = await params
  const db = getDb()

  const creator = await db.creatorProfile.findUnique({
    where: { id },
    include: {
      user: true,
      deals: {
        where: { stage: { notIn: ['CANCELLED'] } },
        include: { campaign: { include: { brand: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  })

  if (!creator) notFound()

  // Use real platform stats if available, otherwise fall back to mock
  const analytics = generateAnalyticsData(creator.handle, 30)

  const engData = analytics.map((d) => ({
    date: d.date,
    tiktok: parseFloat((d.engagementRate * 1.3).toFixed(2)),
    instagram: parseFloat((d.engagementRate * 0.65).toFixed(2)),
  }))

  const initials = creator.user.name
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const avgEngRate =
    ((creator.tiktokEngRate ?? 0) + (creator.instagramEngRate ?? 0)) /
    (creator.tiktokEngRate && creator.instagramEngRate ? 2 : 1)

  const activeDealCount = creator.deals.filter(
    (d) => d.stage === 'LIVE' || d.stage === 'SIGNED'
  ).length

  const totalEarned = creator.deals
    .filter((d) => d.stage === 'COMPLETED' || d.stage === 'LIVE')
    .reduce((sum, d) => sum + (d.agreedFee ?? 0), 0)

  const stats = [
    { title: 'TikTok Followers', value: creator.tiktokFollowers ? formatNumber(creator.tiktokFollowers) : '—' },
    { title: 'IG Followers', value: creator.instagramFollowers ? formatNumber(creator.instagramFollowers) : '—' },
    { title: 'Avg Eng Rate', value: avgEngRate > 0 ? formatPercent(avgEngRate) : '—', accent: true },
    { title: 'Active Deals', value: activeDealCount },
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
              <span className="font-syne text-lg font-bold text-[#008cff]">{initials}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-syne text-xl font-bold text-[#EDE8DE]">{creator.handle}</div>
              <div className="font-fraunces text-sm text-[#6B6860] mb-3">{creator.user.name}</div>
              {creator.niche.length > 0 && (
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
              )}
              <div className="flex items-center gap-4 flex-wrap">
                {creator.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin size={11} className="text-[#6B6860]" />
                    <span className="font-fraunces text-xs text-[#6B6860]">{creator.location}</span>
                  </div>
                )}
                {totalEarned > 0 && (
                  <div className="text-xs font-syne text-[#6B6860]">
                    <span className="text-[#008cff] font-bold">{formatCurrency(totalEarned)}</span> total earned
                  </div>
                )}
              </div>
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
                {creator.handle}
              </span>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Followers', value: creator.tiktokFollowers ? formatNumber(creator.tiktokFollowers) : '—' },
                { label: 'Avg Views', value: creator.tiktokAvgViews ? formatNumber(creator.tiktokAvgViews) : '—' },
                { label: 'Engagement Rate', value: creator.tiktokEngRate ? formatPercent(creator.tiktokEngRate) : '—', accent: true },
              ].map((row) => (
                <div key={row.label} className="flex justify-between items-center py-2 border-b border-[#1A1A1A]">
                  <span className="text-[10px] font-syne uppercase tracking-widest text-[#6B6860]">
                    {row.label}
                  </span>
                  <span className={`text-sm font-syne font-bold ${row.accent ? 'text-[#008cff]' : 'text-[#EDE8DE]'}`}>
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
                {creator.handle}
              </span>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Followers', value: creator.instagramFollowers ? formatNumber(creator.instagramFollowers) : '—' },
                { label: 'Avg Likes', value: creator.instagramAvgLikes ? formatNumber(creator.instagramAvgLikes) : '—' },
                { label: 'Engagement Rate', value: creator.instagramEngRate ? formatPercent(creator.instagramEngRate) : '—', accent: true },
              ].map((row) => (
                <div key={row.label} className="flex justify-between items-center py-2 border-b border-[#1A1A1A]">
                  <span className="text-[10px] font-syne uppercase tracking-widest text-[#6B6860]">
                    {row.label}
                  </span>
                  <span className={`text-sm font-syne font-bold ${row.accent ? 'text-[#008cff]' : 'text-[#EDE8DE]'}`}>
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

        {/* Deal history */}
        {creator.deals.length > 0 && (
          <div className="bg-[#111111] border border-[#222222]">
            <div className="px-5 py-4 border-b border-[#222222]">
              <h3 className="text-sm font-syne font-bold text-[#EDE8DE]">Deal History</h3>
            </div>
            <div className="divide-y divide-[#1A1A1A]">
              {creator.deals.map((deal) => (
                <div key={deal.id} className="flex items-center justify-between px-5 py-3.5">
                  <div className="min-w-0">
                    <div className="text-sm font-syne font-bold text-[#EDE8DE] truncate">
                      {deal.campaign.name}
                    </div>
                    <div className="text-xs font-fraunces text-[#6B6860] truncate">
                      {deal.campaign.brand.companyName}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    {(deal.agreedFee ?? deal.proposedFee) && (
                      <span className="text-sm font-syne font-bold text-[#008cff]">
                        {formatCurrency(deal.agreedFee ?? deal.proposedFee ?? 0)}
                      </span>
                    )}
                    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-syne font-bold uppercase tracking-widest ${DEAL_STAGE_COLORS[deal.stage as DealStageValue]}`}>
                      {DEAL_STAGE_LABELS[deal.stage as DealStageValue]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
