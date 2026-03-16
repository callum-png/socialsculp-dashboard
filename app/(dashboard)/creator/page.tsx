import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCardGrid } from '@/components/dashboard/StatCardGrid'
import { ChartContainer } from '@/components/charts/ChartContainer'
import { EngagementLineChart } from '@/components/charts/EngagementLineChart'
import { getDb } from '@/lib/db'
import { generateAnalyticsData } from '@/lib/mock-data'
import { formatNumber, formatCurrency, formatPercent } from '@/lib/utils'
import { DEAL_STAGE_COLORS, DEAL_STAGE_LABELS } from '@/lib/constants'
import { TrendingUp, Users, Megaphone, DollarSign, Calendar } from 'lucide-react'
import type { DealStageValue } from '@/lib/constants'

export default async function CreatorOverviewPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const db = getDb()
  const user = await db.user.findUnique({
    where: { clerkId: userId },
    include: {
      creatorProfile: {
        include: {
          deals: {
            where: { stage: { notIn: ['CANCELLED'] } },
            include: { campaign: true, deliverables: true },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      },
    },
  })

  if (!user?.creatorProfile) {
    return (
      <div className="p-6">
        <p className="text-[#6B6860] font-syne text-sm">Creator profile not set up yet.</p>
      </div>
    )
  }

  const creator = user.creatorProfile
  const deals = creator.deals

  const activeDealCount = deals.filter((d) => d.stage === 'LIVE' || d.stage === 'SIGNED').length
  const totalEarned = deals
    .filter((d) => d.stage === 'COMPLETED' || d.stage === 'LIVE')
    .reduce((sum, d) => sum + (d.agreedFee ?? 0), 0)

  const avgEngRate = ((creator.tiktokEngRate ?? 0) + (creator.instagramEngRate ?? 0)) / 2

  const analytics = generateAnalyticsData(creator.handle, 30)
  const engData = analytics.map((d) => ({
    date: d.date,
    tiktok: parseFloat((d.engagementRate * 1.3).toFixed(2)),
    instagram: parseFloat((d.engagementRate * 0.65).toFixed(2)),
  }))

  // Upcoming deliverables
  const upcomingDeliverables = deals
    .flatMap((deal) =>
      deal.deliverables
        .filter((d) => !d.submitted)
        .map((d) => ({
          id: d.id,
          type: d.contentType.replace('_', ' '),
          campaign: deal.campaign.name,
          due: d.dueDate ? new Date(d.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD',
          isDueSoon: d.dueDate
            ? new Date(d.dueDate).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000
            : false,
        }))
    )
    .slice(0, 5)

  const stats = [
    {
      title: 'TikTok Followers',
      value: creator.tiktokFollowers ? formatNumber(creator.tiktokFollowers) : '—',
      icon: Users,
      delta: 3.2,
      deltaLabel: 'this month',
    },
    {
      title: 'IG Followers',
      value: creator.instagramFollowers ? formatNumber(creator.instagramFollowers) : '—',
      icon: Users,
      delta: 1.8,
      deltaLabel: 'this month',
    },
    {
      title: 'Active Deals',
      value: activeDealCount,
      icon: Megaphone,
    },
    {
      title: 'Total Earned',
      value: totalEarned > 0 ? formatCurrency(totalEarned) : '—',
      icon: DollarSign,
      delta: 22.4,
      deltaLabel: 'vs last month',
      accent: true,
    },
  ]

  const firstName = user.name.split(' ')[0]

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${firstName}.`}
        description="Here's an overview of your creator activity"
      />

      <div className="p-6 space-y-6">
        <StatCardGrid stats={stats} />

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
          {upcomingDeliverables.length === 0 ? (
            <div className="px-5 py-10 text-center text-[#3A3A3A] font-syne text-xs uppercase tracking-widest">
              No upcoming deadlines
            </div>
          ) : (
            <div className="divide-y divide-[#1A1A1A]">
              {upcomingDeliverables.map((d) => (
                <div key={d.id} className="flex items-center justify-between px-5 py-4">
                  <div>
                    <div className="text-sm font-syne font-bold text-[#EDE8DE]">{d.type}</div>
                    <div className="text-xs font-fraunces text-[#6B6860]">{d.campaign}</div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <span className="text-xs font-syne text-[#6B6860]">{d.due}</span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 text-[10px] font-syne font-bold uppercase tracking-widest border ${
                        d.isDueSoon
                          ? 'bg-[#1A1200] text-[#FFB547] border-[#3A2D00]'
                          : 'bg-[#1A1A1A] text-[#6B6860] border-[#2A2A2A]'
                      }`}
                    >
                      {d.isDueSoon ? 'Due Soon' : 'Pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent deals */}
        {deals.length > 0 && (
          <div className="bg-[#111111] border border-[#222222]">
            <div className="px-5 py-4 border-b border-[#222222]">
              <h3 className="text-sm font-syne font-bold text-[#EDE8DE]">My Deals</h3>
            </div>
            <div className="divide-y divide-[#1A1A1A]">
              {deals.map((deal) => (
                <div key={deal.id} className="flex items-center justify-between px-5 py-3.5">
                  <div className="min-w-0">
                    <div className="text-sm font-syne font-bold text-[#EDE8DE] truncate">
                      {deal.campaign.name}
                    </div>
                    {(deal.agreedFee ?? deal.proposedFee) && (
                      <div className="text-xs font-syne text-[#008cff]">
                        {formatCurrency(deal.agreedFee ?? deal.proposedFee ?? 0)}
                      </div>
                    )}
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-syne font-bold uppercase tracking-widest ${DEAL_STAGE_COLORS[deal.stage as DealStageValue]}`}>
                    {DEAL_STAGE_LABELS[deal.stage as DealStageValue]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
