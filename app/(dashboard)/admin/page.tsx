import Link from 'next/link'
import { Megaphone, Users, DollarSign, TrendingUp, ArrowRight, Plus } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCardGrid } from '@/components/dashboard/StatCardGrid'
import { ChartContainer } from '@/components/charts/ChartContainer'
import { ROASAreaChart } from '@/components/charts/ROASAreaChart'
import { getDb } from '@/lib/db'
import { generateAnalyticsData } from '@/lib/mock-data'
import { DEAL_STAGE_COLORS, DEAL_STAGE_LABELS } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils'
import type { DealStageValue } from '@/lib/constants'

export default async function AdminOverviewPage() {
  const db = getDb()

  const [campaigns, creators, deals] = await Promise.all([
    db.campaign.findMany({
      include: { brand: true },
      orderBy: { createdAt: 'desc' },
    }),
    db.creatorProfile.findMany({ select: { id: true } }),
    db.deal.findMany({
      where: { stage: { notIn: ['CANCELLED'] } },
      include: {
        creator: { select: { handle: true } },
        campaign: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ])

  const activeCampaigns = campaigns.filter((c) => c.status === 'ACTIVE').length
  const totalCreators = creators.length
  const totalSpend = campaigns.reduce((sum, c) => sum + c.spentBudget, 0)

  // Analytics data — use real snapshots if available, else mock
  const analyticsData = generateAnalyticsData('admin-overview', 30)
  const chartData = analyticsData.map((d) => ({ date: d.date, roas: d.roas }))
  const avgROAS =
    analyticsData.reduce((s, d) => s + d.roas, 0) / (analyticsData.length || 1)

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const stats = [
    {
      title: 'Active Campaigns',
      value: activeCampaigns,
      icon: Megaphone,
      delta: 12.5,
      deltaLabel: 'vs last month',
    },
    {
      title: 'Total Creators',
      value: totalCreators,
      icon: Users,
      delta: 8.2,
      deltaLabel: 'vs last month',
    },
    {
      title: 'Monthly Spend',
      value: formatCurrency(totalSpend),
      icon: DollarSign,
      delta: -3.1,
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
  ]

  return (
    <div>
      <PageHeader title="Overview" description={today}>
        <Link
          href="/admin/campaigns/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#008cff] text-[#090909] text-xs font-syne font-bold uppercase tracking-widest hover:bg-[#0077dd] transition-colors"
        >
          <Plus size={13} />
          New Campaign
        </Link>
      </PageHeader>

      <div className="p-6 space-y-6">
        {/* Stat cards */}
        <StatCardGrid stats={stats} />

        {/* ROAS Chart */}
        <ChartContainer
          title="ROAS — Last 30 Days"
          description="Return on ad spend across all active campaigns"
        >
          <ROASAreaChart data={chartData} />
        </ChartContainer>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Deals */}
          <div className="lg:col-span-2 bg-[#111111] border border-[#222222]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#222222]">
              <h3 className="text-sm font-syne font-bold text-[#EDE8DE]">Recent Deals</h3>
              <Link
                href="/admin/deals"
                className="flex items-center gap-1 text-[10px] font-syne uppercase tracking-widest text-[#6B6860] hover:text-[#008cff] transition-colors"
              >
                View all <ArrowRight size={11} />
              </Link>
            </div>
            <div className="divide-y divide-[#1A1A1A]">
              {deals.length === 0 ? (
                <div className="px-5 py-8 text-center text-[#3A3A3A] font-syne text-xs uppercase tracking-widest">
                  No deals yet
                </div>
              ) : (
                deals.map((deal) => {
                  const fee = deal.agreedFee ?? deal.proposedFee
                  return (
                    <div key={deal.id} className="flex items-center justify-between px-5 py-3.5">
                      <div className="min-w-0">
                        <div className="text-sm font-syne font-bold text-[#EDE8DE] truncate">
                          {deal.creator.handle}
                        </div>
                        <div className="text-xs font-fraunces text-[#6B6860] truncate">
                          {deal.campaign.name}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-4">
                        {fee && (
                          <span className="text-sm font-syne font-bold text-[#008cff]">
                            {formatCurrency(fee)}
                          </span>
                        )}
                        <span
                          className={`inline-flex items-center px-2 py-0.5 text-[10px] font-syne font-bold uppercase tracking-widest ${DEAL_STAGE_COLORS[deal.stage as DealStageValue]}`}
                        >
                          {DEAL_STAGE_LABELS[deal.stage as DealStageValue]}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-[#111111] border border-[#222222]">
            <div className="px-5 py-4 border-b border-[#222222]">
              <h3 className="text-sm font-syne font-bold text-[#EDE8DE]">Quick Actions</h3>
            </div>
            <div className="p-5 flex flex-col gap-3">
              <Link
                href="/admin/campaigns/new"
                className="flex items-center justify-between w-full px-4 py-3 bg-[#008cff] text-[#090909] text-xs font-syne font-bold uppercase tracking-widest hover:bg-[#0077dd] transition-colors"
              >
                <span>New Campaign</span>
                <Plus size={13} />
              </Link>
              <Link
                href="/admin/creators"
                className="flex items-center justify-between w-full px-4 py-3 border border-[#222222] text-[#EDE8DE] text-xs font-syne font-bold uppercase tracking-widest hover:border-[#008cff] hover:text-[#008cff] transition-colors"
              >
                <span>View Creators</span>
                <ArrowRight size={13} />
              </Link>
              <Link
                href="/admin/deals"
                className="flex items-center justify-between w-full px-4 py-3 border border-[#222222] text-[#EDE8DE] text-xs font-syne font-bold uppercase tracking-widest hover:border-[#008cff] hover:text-[#008cff] transition-colors"
              >
                <span>Deal Pipeline</span>
                <ArrowRight size={13} />
              </Link>
              <Link
                href="/admin/analytics"
                className="flex items-center justify-between w-full px-4 py-3 border border-[#222222] text-[#EDE8DE] text-xs font-syne font-bold uppercase tracking-widest hover:border-[#008cff] hover:text-[#008cff] transition-colors"
              >
                <span>Analytics</span>
                <ArrowRight size={13} />
              </Link>

              <div className="pt-3 border-t border-[#1A1A1A]">
                <div className="text-[10px] font-syne uppercase tracking-widest text-[#6B6860] mb-2">
                  At a Glance
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs font-syne text-[#6B6860]">Total Creators</span>
                    <span className="text-xs font-syne font-bold text-[#EDE8DE]">{totalCreators}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs font-syne text-[#6B6860]">Active Campaigns</span>
                    <span className="text-xs font-syne font-bold text-[#EDE8DE]">{activeCampaigns}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs font-syne text-[#6B6860]">Total Spend</span>
                    <span className="text-xs font-syne font-bold text-[#EDE8DE]">
                      {formatCurrency(totalSpend)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
