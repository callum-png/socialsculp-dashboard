import { notFound } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getDb } from '@/lib/db'
import { generateAnalyticsData } from '@/lib/mock-data'
import { PageHeader } from '@/components/shared/PageHeader'
import { CampaignStatusBadge } from '@/components/campaigns/CampaignStatusBadge'
import { StatCardGrid } from '@/components/dashboard/StatCardGrid'
import { ChartContainer } from '@/components/charts/ChartContainer'
import { EngagementLineChart } from '@/components/charts/EngagementLineChart'
import { ReachBarChart } from '@/components/charts/ReachBarChart'
import { formatCurrency, formatNumber, budgetPercent } from '@/lib/utils'
import { PLATFORM_LABELS } from '@/lib/constants'
import type { CampaignStatusValue, PlatformValue } from '@/lib/constants'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DollarSign, TrendingUp, Users, Eye } from 'lucide-react'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function BrandCampaignDetailPage({ params }: PageProps) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { id } = await params
  const db = getDb()

  const campaign = await db.campaign.findUnique({
    where: { id },
    include: {
      brand: true,
      campaignCreators: { include: { creator: true } },
    },
  })

  if (!campaign) notFound()

  // Verify this campaign belongs to the authenticated brand
  const user = await db.user.findUnique({
    where: { clerkId: userId },
    include: { brandProfile: { select: { id: true } } },
  })

  if (user?.brandProfile?.id && campaign.brandId !== user.brandProfile.id) {
    notFound()
  }

  const pct = budgetPercent(campaign.spentBudget, campaign.totalBudget)
  const analytics = generateAnalyticsData(campaign.id, 30)

  const engData = analytics.map((d) => ({
    date: d.date,
    tiktok: parseFloat((d.engagementRate * 1.2).toFixed(2)),
    instagram: parseFloat((d.engagementRate * 0.7).toFixed(2)),
  }))

  const reachData: { name: string; tiktok: number; instagram: number }[] = []
  for (let i = 0; i < analytics.length; i += 7) {
    const week = analytics.slice(i, i + 7)
    const totalReach = week.reduce((s, d) => s + d.reach, 0)
    reachData.push({
      name: `Week ${Math.floor(i / 7) + 1}`,
      tiktok: Math.round(totalReach * 0.6),
      instagram: Math.round(totalReach * 0.4),
    })
  }

  const totalImpressions = analytics.reduce((s, d) => s + d.impressions, 0)
  const totalReach = analytics.reduce((s, d) => s + d.reach, 0)
  const avgROAS = analytics.reduce((s, d) => s + d.roas, 0) / analytics.length

  const stats = [
    { title: 'Total Spend', value: formatCurrency(campaign.spentBudget), icon: DollarSign },
    { title: 'Avg ROAS', value: `${avgROAS.toFixed(1)}×`, icon: TrendingUp, accent: true },
    { title: 'Total Reach', value: formatNumber(totalReach), icon: Eye },
    { title: 'Impressions', value: formatNumber(totalImpressions), icon: Users },
  ]

  return (
    <div>
      <PageHeader
        title={campaign.name}
        breadcrumb={[
          { label: 'Campaigns', href: '/brand/campaigns' },
          { label: campaign.name },
        ]}
      >
        <CampaignStatusBadge status={campaign.status as CampaignStatusValue} />
      </PageHeader>

      <div className="p-6 space-y-6">
        {/* Meta bar */}
        <div className="bg-[#111111] border border-[#222222] p-5">
          <div className="flex flex-wrap gap-6 items-start mb-4">
            <div>
              <div className="text-[10px] font-syne uppercase tracking-widest text-[#6B6860] mb-1">Brand</div>
              <div className="text-sm font-syne font-bold text-[#EDE8DE]">{campaign.brand.companyName}</div>
            </div>
            <div>
              <div className="text-[10px] font-syne uppercase tracking-widest text-[#6B6860] mb-1">Platform</div>
              <div className="text-sm font-syne font-bold text-[#EDE8DE]">
                {PLATFORM_LABELS[campaign.platform as PlatformValue]}
              </div>
            </div>
            {campaign.targetROAS && (
              <div>
                <div className="text-[10px] font-syne uppercase tracking-widest text-[#6B6860] mb-1">Target ROAS</div>
                <div className="text-sm font-syne font-bold text-[#008cff]">{campaign.targetROAS}×</div>
              </div>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-syne uppercase tracking-widest text-[#6B6860]">
                Budget — {formatCurrency(campaign.spentBudget)} of {formatCurrency(campaign.totalBudget)}
              </span>
              <span className="text-xs font-syne font-bold text-[#EDE8DE]">{pct}%</span>
            </div>
            <div className="h-1.5 bg-[#1A1A1A] w-full">
              <div className="h-full bg-[#008cff]" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview">
          <TabsList className="bg-[#111111] border border-[#222222] p-0 h-auto rounded-none gap-0">
            {['overview', 'analytics', 'creators'].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="px-5 py-3 text-[10px] font-syne font-bold uppercase tracking-widest rounded-none text-[#6B6860] data-active:text-[#008cff] data-active:bg-[#001a33] data-active:shadow-none border-r border-[#222222] last:border-r-0"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="mt-5 space-y-5">
            <StatCardGrid stats={stats} />
            {campaign.description && (
              <div className="bg-[#111111] border border-[#222222] p-5">
                <div className="text-[10px] font-syne uppercase tracking-widest text-[#6B6860] mb-3">Description</div>
                <p className="font-fraunces text-[#EDE8DE] leading-relaxed">{campaign.description}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="mt-5 space-y-5">
            <ChartContainer title="Engagement Rate — Last 30 Days">
              <EngagementLineChart data={engData} />
            </ChartContainer>
            <ChartContainer title="Weekly Reach">
              <ReachBarChart data={reachData} />
            </ChartContainer>
          </TabsContent>

          <TabsContent value="creators" className="mt-5">
            <div className="bg-[#111111] border border-[#222222] divide-y divide-[#1A1A1A]">
              {campaign.campaignCreators.length === 0 ? (
                <div className="px-5 py-10 text-center text-[#3A3A3A] font-syne text-xs uppercase tracking-widest">
                  No creators assigned yet
                </div>
              ) : (
                campaign.campaignCreators.map((cc) => (
                  <div key={cc.id} className="flex items-center gap-3 px-5 py-4">
                    <div className="w-9 h-9 bg-[#1A1A1A] border border-[#222222] flex items-center justify-center shrink-0">
                      <span className="font-syne text-xs font-bold text-[#008cff]">
                        {cc.creator.handle.replace('@', '').slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-syne font-bold text-sm text-[#EDE8DE]">{cc.creator.handle}</div>
                      {cc.creator.niche.length > 0 && (
                        <div className="font-fraunces text-xs text-[#6B6860]">
                          {cc.creator.niche.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
