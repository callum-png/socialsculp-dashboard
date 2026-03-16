import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getDb } from '@/lib/db'
import { generateAnalyticsData } from '@/lib/mock-data'
import { PageHeader } from '@/components/shared/PageHeader'
import { CampaignStatusBadge } from '@/components/campaigns/CampaignStatusBadge'
import { StatCardGrid } from '@/components/dashboard/StatCardGrid'
import { ChartContainer } from '@/components/charts/ChartContainer'
import { EngagementLineChart } from '@/components/charts/EngagementLineChart'
import { ReachBarChart } from '@/components/charts/ReachBarChart'
import { formatCurrency, formatNumber, formatPercent, budgetPercent } from '@/lib/utils'
import { PLATFORM_LABELS } from '@/lib/constants'
import type { CampaignStatusValue, PlatformValue } from '@/lib/constants'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DollarSign, TrendingUp, Users, Eye, MapPin } from 'lucide-react'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function CampaignDetailPage({ params }: PageProps) {
  const { id } = await params
  const db = getDb()

  const campaign = await db.campaign.findUnique({
    where: { id },
    include: {
      brand: true,
      deals: {
        where: { stage: { not: 'CANCELLED' } },
        include: { creator: true, deliverables: true },
        orderBy: { createdAt: 'desc' },
      },
      campaignCreators: {
        include: { creator: true },
        take: 10,
      },
      analyticsSnapshots: {
        orderBy: { date: 'desc' },
        take: 30,
      },
    },
  })

  if (!campaign) notFound()

  const pct = budgetPercent(campaign.spentBudget, campaign.totalBudget)

  // Use real analytics snapshots if available, otherwise fall back to mock
  const hasRealAnalytics = campaign.analyticsSnapshots.length >= 7
  const analyticsSource = hasRealAnalytics
    ? campaign.analyticsSnapshots
        .slice()
        .reverse()
        .map((s) => ({
          date: s.date.toISOString(),
          roas: s.roas,
          reach: s.reach,
          engagementRate: s.engagementRate,
          impressions: s.impressions,
        }))
    : generateAnalyticsData(campaign.id, 30)

  const engData = analyticsSource.map((d) => ({
    date: d.date,
    tiktok: parseFloat((d.engagementRate * 1.2).toFixed(2)),
    instagram: parseFloat((d.engagementRate * 0.7).toFixed(2)),
  }))

  const reachData: { name: string; tiktok: number; instagram: number }[] = []
  for (let i = 0; i < analyticsSource.length; i += 7) {
    const week = analyticsSource.slice(i, i + 7)
    const totalReach = week.reduce((s, d) => s + d.reach, 0)
    reachData.push({
      name: `Wk ${Math.floor(i / 7) + 1}`,
      tiktok: Math.round(totalReach * 0.6),
      instagram: Math.round(totalReach * 0.4),
    })
  }

  const totalImpressions = analyticsSource.reduce((s, d) => s + d.impressions, 0)
  const totalReach = analyticsSource.reduce((s, d) => s + d.reach, 0)
  const avgROAS =
    analyticsSource.reduce((s, d) => s + d.roas, 0) / (analyticsSource.length || 1)

  const stats = [
    { title: 'Total Spend', value: formatCurrency(campaign.spentBudget), icon: DollarSign },
    { title: 'Avg ROAS', value: `${avgROAS.toFixed(1)}×`, icon: TrendingUp, accent: true },
    { title: 'Total Reach', value: formatNumber(totalReach), icon: Eye },
    { title: 'Impressions', value: formatNumber(totalImpressions), icon: Users },
  ]

  // Assigned creators — prefer DB campaignCreators, fall back to creators from deals
  const assignedCreators =
    campaign.campaignCreators.length > 0
      ? campaign.campaignCreators.map((cc) => cc.creator)
      : campaign.deals.map((d) => d.creator).filter(Boolean)

  return (
    <div>
      <PageHeader
        title={campaign.name}
        breadcrumb={[
          { label: 'Campaigns', href: '/admin/campaigns' },
          { label: campaign.name },
        ]}
      >
        <CampaignStatusBadge status={campaign.status as CampaignStatusValue} />
      </PageHeader>

      <div className="p-6 space-y-6">
        {/* Campaign meta bar */}
        <div className="bg-[#111111] border border-[#222222] p-5">
          <div className="flex flex-wrap gap-6 items-start mb-4">
            <div>
              <div className="text-[10px] font-syne uppercase tracking-widest text-[#6B6860] mb-1">Brand</div>
              <div className="text-sm font-syne font-bold text-[#EDE8DE]">{campaign.brand.companyName}</div>
            </div>
            <div>
              <div className="text-[10px] font-syne uppercase tracking-widest text-[#6B6860] mb-1">Platform</div>
              <div className="text-sm font-syne font-bold text-[#EDE8DE]">
                {PLATFORM_LABELS[campaign.platform as PlatformValue] ?? campaign.platform}
              </div>
            </div>
            {campaign.targetROAS && (
              <div>
                <div className="text-[10px] font-syne uppercase tracking-widest text-[#6B6860] mb-1">Target ROAS</div>
                <div className="text-sm font-syne font-bold text-[#008cff]">{campaign.targetROAS}×</div>
              </div>
            )}
            {campaign.startDate && (
              <div>
                <div className="text-[10px] font-syne uppercase tracking-widest text-[#6B6860] mb-1">Dates</div>
                <div className="text-sm font-syne font-bold text-[#EDE8DE]">
                  {new Date(campaign.startDate).toLocaleDateString()} →{' '}
                  {campaign.endDate ? new Date(campaign.endDate).toLocaleDateString() : 'TBD'}
                </div>
              </div>
            )}
          </div>

          {/* Budget progress bar */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-syne uppercase tracking-widest text-[#6B6860]">
                Budget — {formatCurrency(campaign.spentBudget)} of {formatCurrency(campaign.totalBudget)}
              </span>
              <span className="text-xs font-syne font-bold text-[#EDE8DE]">{pct}%</span>
            </div>
            <div className="h-1.5 bg-[#1A1A1A] w-full">
              <div
                className="h-full bg-[#008cff] transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview">
          <TabsList className="bg-[#111111] border border-[#222222] p-0 h-auto rounded-none gap-0">
            {['overview', 'analytics', 'creators', 'deliverables'].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="px-5 py-3 text-[10px] font-syne font-bold uppercase tracking-widest rounded-none text-[#6B6860] data-active:text-[#008cff] data-active:bg-[#001a33] data-active:shadow-none border-r border-[#222222] last:border-r-0"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="mt-5 space-y-5">
            <StatCardGrid stats={stats} />
            {campaign.description && (
              <div className="bg-[#111111] border border-[#222222] p-5">
                <div className="text-[10px] font-syne uppercase tracking-widest text-[#6B6860] mb-3">
                  Description
                </div>
                <p className="font-fraunces text-[#EDE8DE] leading-relaxed">{campaign.description}</p>
              </div>
            )}
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="mt-5 space-y-5">
            <ChartContainer title="Engagement Rate — Last 30 Days" description="TikTok vs Instagram">
              <EngagementLineChart data={engData} />
            </ChartContainer>
            <ChartContainer title="Weekly Reach" description="TikTok vs Instagram reach per week">
              <ReachBarChart data={reachData} />
            </ChartContainer>
          </TabsContent>

          {/* Creators */}
          <TabsContent value="creators" className="mt-5">
            <div className="bg-[#111111] border border-[#222222] divide-y divide-[#1A1A1A]">
              {assignedCreators.length === 0 ? (
                <div className="px-5 py-10 text-center text-[#3A3A3A] font-syne text-xs uppercase tracking-widest">
                  No creators assigned yet
                </div>
              ) : (
                assignedCreators.map((creator) => (
                  <div key={creator.id} className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-[#1A1A1A] border border-[#222222] flex items-center justify-center shrink-0">
                        <span className="font-syne text-xs font-bold text-[#008cff]">
                          {creator.handle.replace('@', '').slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-syne font-bold text-sm text-[#EDE8DE]">{creator.handle}</div>
                        {creator.location && (
                          <div className="flex items-center gap-1 text-xs text-[#6B6860]">
                            <MapPin size={10} />
                            <span className="font-fraunces">{creator.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {creator.tiktokFollowers && (
                        <div className="hidden sm:block text-right">
                          <div className="text-[10px] font-syne uppercase tracking-widest text-[#6B6860]">TikTok</div>
                          <div className="text-sm font-syne font-bold text-[#EDE8DE]">
                            {formatNumber(creator.tiktokFollowers)}
                          </div>
                        </div>
                      )}
                      <Link
                        href={`/admin/creators/${creator.id}`}
                        className="inline-flex items-center px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest border border-[#222222] text-[#6B6860] hover:border-[#008cff] hover:text-[#008cff] transition-colors"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* Deliverables */}
          <TabsContent value="deliverables" className="mt-5">
            <div className="bg-[#111111] border border-[#222222]">
              <div className="px-5 py-4 border-b border-[#222222]">
                <h3 className="text-sm font-syne font-bold text-[#EDE8DE]">Content Deliverables</h3>
              </div>
              {campaign.deals.length === 0 ? (
                <div className="px-5 py-10 text-center text-[#3A3A3A] font-syne text-xs uppercase tracking-widest">
                  No deliverables yet
                </div>
              ) : (
                <div className="divide-y divide-[#1A1A1A]">
                  {campaign.deals.flatMap((deal) =>
                    deal.deliverables.map((d) => ({
                      id: d.id,
                      type: `${d.contentType.replace('_', ' ')}`,
                      creator: deal.creator.handle,
                      due: d.dueDate ? new Date(d.dueDate).toLocaleDateString() : '—',
                      submitted: d.submitted,
                    }))
                  ).map((d) => (
                    <div key={d.id} className="flex items-center justify-between px-5 py-3.5">
                      <div>
                        <div className="text-sm font-syne font-bold text-[#EDE8DE]">{d.type}</div>
                        <div className="text-xs font-fraunces text-[#6B6860]">{d.creator}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-xs font-syne text-[#6B6860]">Due {d.due}</div>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 text-[10px] font-syne font-bold uppercase tracking-widest border ${
                            d.submitted
                              ? 'bg-[#0A1F0A] text-[#4ADE80] border-[#1A4A1A]'
                              : 'bg-[#1A1A1A] text-[#6B6860] border-[#2A2A2A]'
                          }`}
                        >
                          {d.submitted ? 'Submitted' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
