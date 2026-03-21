import Link from 'next/link'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { SalesDealStage, DealStage } from '@prisma/client'
import {
  Users,
  DollarSign,
  TrendingUp,
  Handshake,
  ArrowRight,
  ChevronRight,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCardGrid } from '@/components/dashboard/StatCardGrid'
import { getDb } from '@/lib/db'
import { formatCurrency, timeAgo } from '@/lib/utils'

// Labels for SalesDealStage values
const SALES_STAGE_LABELS: Record<SalesDealStage, string> = {
  APPOINTMENT_SET: 'Appointment Set',
  QUALIFIED: 'Qualified',
  DECISION_MAKER: 'Decision Maker',
  PROPOSAL_SENT: 'Proposal Sent',
  CLOSED_WON: 'Closed Won',
  CLOSED_LOST: 'Closed Lost',
}

// Labels for DealStage values (used in DealStageEvent activity feed)
const DEAL_STAGE_ACTIVITY_LABELS: Record<DealStage, string> = {
  OUTREACH: 'Outreach',
  NEGOTIATING: 'Negotiating',
  SIGNED: 'Signed',
  LIVE: 'Live',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

const PIPELINE_STAGES: SalesDealStage[] = [
  SalesDealStage.APPOINTMENT_SET,
  SalesDealStage.QUALIFIED,
  SalesDealStage.DECISION_MAKER,
  SalesDealStage.PROPOSAL_SENT,
  SalesDealStage.CLOSED_WON,
]

export default async function AgentHomePage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const client = await clerkClient()
  const clerkUser = await client.users.getUser(userId)

  const db = getDb()

  // Look up internal User record by clerkId
  const user = await db.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, name: true },
  })

  if (!user) redirect('/sign-in')

  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  // Fetch all data in parallel
  const [newLeadsCount, salesDeals, recentActivity] = await Promise.all([
    // New leads this week
    db.lead.count({
      where: {
        createdById: user.id,
        createdAt: { gte: sevenDaysAgo },
      },
    }),

    // All active SalesDeal records for this agent
    db.salesDeal.findMany({
      where: { createdById: user.id },
      select: { stage: true, value: true, createdAt: true },
    }),

    // Last 5 DealStageEvents where this agent was the changer
    db.dealStageEvent.findMany({
      where: { changedById: user.id },
      include: {
        deal: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ])

  // Compute SalesDeal metrics
  const negotiatingCount = salesDeals.filter(
    (d) => d.stage === SalesDealStage.PROPOSAL_SENT,
  ).length

  const closedWonThisMonth = salesDeals.filter(
    (d) => d.stage === SalesDealStage.CLOSED_WON && d.createdAt >= thirtyDaysAgo,
  ).length

  const pipelineValue = salesDeals
    .filter(
      (d) =>
        d.stage !== SalesDealStage.CLOSED_LOST &&
        d.stage !== SalesDealStage.CLOSED_WON,
    )
    .reduce((sum, d) => sum + (d.value ?? 0), 0)

  // Compute pipeline stage breakdown
  const stageCountMap: Record<SalesDealStage, number> = {
    APPOINTMENT_SET: 0,
    QUALIFIED: 0,
    DECISION_MAKER: 0,
    PROPOSAL_SENT: 0,
    CLOSED_WON: 0,
    CLOSED_LOST: 0,
  }
  for (const deal of salesDeals) {
    stageCountMap[deal.stage] = (stageCountMap[deal.stage] ?? 0) + 1
  }
  const totalPipelineDeals = PIPELINE_STAGES.reduce(
    (sum, s) => sum + stageCountMap[s],
    0,
  )

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const stats = [
    {
      title: 'New Leads This Week',
      value: newLeadsCount,
      icon: Users,
    },
    {
      title: 'In Negotiation',
      value: negotiatingCount,
      icon: Handshake,
    },
    {
      title: 'Closed Won (30d)',
      value: closedWonThisMonth,
      icon: TrendingUp,
      accent: true,
    },
    {
      title: 'Pipeline Value',
      value: formatCurrency(pipelineValue),
      icon: DollarSign,
    },
  ]

  return (
    <div>
      <PageHeader
        title={`Welcome back${clerkUser.firstName ? `, ${clerkUser.firstName}` : ''}`}
        description={today}
      />

      <div className="p-6 space-y-6">
        {/* Stat cards */}
        <StatCardGrid stats={stats} />

        {/* Pipeline stage bar */}
        <div className="bg-[#111111] border border-[#222222]">
          <div className="px-5 py-4 border-b border-[#222222]">
            <h3 className="text-sm font-syne font-bold text-[#EDE8DE]">
              Pipeline Stages
            </h3>
            <p className="text-xs font-fraunces text-[#6B6860] mt-0.5">
              {totalPipelineDeals} active deal{totalPipelineDeals !== 1 ? 's' : ''} across stages
            </p>
          </div>
          <div className="px-5 py-5">
            <div className="flex items-center gap-0">
              {PIPELINE_STAGES.map((stage, idx) => {
                const count = stageCountMap[stage]
                const isLast = idx === PIPELINE_STAGES.length - 1
                const isWon = stage === SalesDealStage.CLOSED_WON
                return (
                  <div key={stage} className="flex items-center flex-1 min-w-0">
                    <div
                      className={`flex-1 min-w-0 px-3 py-3 border ${
                        isWon
                          ? 'bg-[#0A1F0A] border-[#1A4A1A]'
                          : count > 0
                          ? 'bg-[#0D1820] border-[#1A3040]'
                          : 'bg-[#0D0D0D] border-[#1A1A1A]'
                      }`}
                    >
                      <div className="text-[10px] font-syne uppercase tracking-widest text-[#6B6860] truncate">
                        {SALES_STAGE_LABELS[stage]}
                      </div>
                      <div
                        className={`text-xl font-syne font-bold mt-1 ${
                          isWon
                            ? 'text-[#4ADE80]'
                            : count > 0
                            ? 'text-[#008cff]'
                            : 'text-[#3A3A3A]'
                        }`}
                      >
                        {count}
                      </div>
                    </div>
                    {!isLast && (
                      <ChevronRight size={14} className="text-[#2A2A2A] shrink-0" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-[#111111] border border-[#222222]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#222222]">
              <h3 className="text-sm font-syne font-bold text-[#EDE8DE]">
                Recent Activity
              </h3>
              <Link
                href="/agent/crm"
                className="flex items-center gap-1 text-[10px] font-syne uppercase tracking-widest text-[#6B6860] hover:text-[#008cff] transition-colors"
              >
                View CRM <ArrowRight size={11} />
              </Link>
            </div>
            <div className="divide-y divide-[#1A1A1A]">
              {recentActivity.length === 0 ? (
                <div className="px-5 py-8 text-center text-[#3A3A3A] font-syne text-xs uppercase tracking-widest">
                  No activity yet
                </div>
              ) : (
                recentActivity.map((event) => (
                  <div key={event.id} className="flex items-start justify-between px-5 py-3.5 gap-4">
                    <div className="min-w-0">
                      <div className="text-sm font-syne font-bold text-[#EDE8DE] truncate">
                        {event.deal.title}
                      </div>
                      <div className="text-xs font-fraunces text-[#6B6860] mt-0.5">
                        moved from{' '}
                        <span className="text-[#FFB547]">
                          {event.fromStage
                            ? DEAL_STAGE_ACTIVITY_LABELS[event.fromStage]
                            : '—'}
                        </span>{' '}
                        to{' '}
                        <span className="text-[#47AAFF]">
                          {DEAL_STAGE_ACTIVITY_LABELS[event.toStage]}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0 text-[11px] font-syne text-[#3A3A3A] whitespace-nowrap mt-0.5">
                      {timeAgo(event.createdAt)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Nav */}
          <div className="bg-[#111111] border border-[#222222]">
            <div className="px-5 py-4 border-b border-[#222222]">
              <h3 className="text-sm font-syne font-bold text-[#EDE8DE]">Quick Nav</h3>
            </div>
            <div className="p-5 flex flex-col gap-3">
              <Link
                href="/agent/crm"
                className="flex items-center justify-between w-full px-4 py-3 bg-[#008cff] text-[#090909] text-xs font-syne font-bold uppercase tracking-widest hover:bg-[#0077dd] transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Handshake size={13} />
                  CRM
                </span>
                <ArrowRight size={13} />
              </Link>
              <Link
                href="/admin/campaigns"
                className="flex items-center justify-between w-full px-4 py-3 border border-[#222222] text-[#EDE8DE] text-xs font-syne font-bold uppercase tracking-widest hover:border-[#008cff] hover:text-[#008cff] transition-colors"
              >
                <span className="flex items-center gap-2">
                  <TrendingUp size={13} />
                  Campaigns
                </span>
                <ArrowRight size={13} />
              </Link>
              <Link
                href="/admin/creators"
                className="flex items-center justify-between w-full px-4 py-3 border border-[#222222] text-[#EDE8DE] text-xs font-syne font-bold uppercase tracking-widest hover:border-[#008cff] hover:text-[#008cff] transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Users size={13} />
                  Creators
                </span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
