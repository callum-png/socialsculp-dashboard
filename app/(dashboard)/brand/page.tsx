import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCardGrid } from '@/components/dashboard/StatCardGrid'
import { ChartContainer } from '@/components/charts/ChartContainer'
import { ReachBarChart } from '@/components/charts/ReachBarChart'
import { CampaignStatusBadge } from '@/components/campaigns/CampaignStatusBadge'
import { getDb } from '@/lib/db'
import { generateAnalyticsData } from '@/lib/mock-data'
import { PLATFORM_LABELS } from '@/lib/constants'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { Megaphone, Eye, DollarSign, TrendingUp } from 'lucide-react'
import type { CampaignStatusValue, PlatformValue } from '@/lib/constants'

export default async function BrandOverviewPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const db = getDb()
  const user = await db.user.findUnique({
    where: { clerkId: userId },
    include: { brandProfile: { include: { campaigns: true } } },
  })

  if (!user?.brandProfile) {
    return (
      <div className="p-6">
        <p className="text-[#6B6860] font-syne text-sm">Brand profile not set up yet.</p>
      </div>
    )
  }

  const brand = user.brandProfile
  const campaigns = brand.campaigns

  const totalSpend = campaigns.reduce((sum, c) => sum + c.spentBudget, 0)
  const totalBudget = campaigns.reduce((sum, c) => sum + c.totalBudget, 0)
  const activeCampaigns = campaigns.filter((c) => c.status === 'ACTIVE').length

  const reachData = campaigns.slice(0, 6).map((c) => {
    const a = generateAnalyticsData(c.id, 30)
    const total = a.reduce((s, d) => s + d.reach, 0)
    return {
      name: c.name.split('—')[1]?.trim().slice(0, 12) ?? c.name.slice(0, 12),
      tiktok: Math.round(total * 0.55),
      instagram: Math.round(total * 0.45),
    }
  })

  // Compute rough total reach from analytics
  const allAnalytics = campaigns.flatMap((c) => generateAnalyticsData(c.id, 30))
  const totalReach = allAnalytics.reduce((s, d) => s + d.reach, 0)
  const avgROAS = allAnalytics.length
    ? allAnalytics.reduce((s, d) => s + d.roas, 0) / allAnalytics.length
    : 0

  const stats = [
    { title: 'Active Campaigns', value: activeCampaigns, icon: Megaphone },
    { title: 'Total Reach', value: formatNumber(totalReach), icon: Eye, delta: 14.3, deltaLabel: 'vs last month' },
    { title: 'Total Spend', value: formatCurrency(totalSpend), icon: DollarSign },
    { title: 'Avg ROAS', value: `${avgROAS.toFixed(1)}×`, icon: TrendingUp, delta: 3.2, deltaLabel: 'vs last month', accent: true },
  ]

  return (
    <div>
      <PageHeader
        title={`Welcome, ${brand.companyName}.`}
        description="Your campaign performance at a glance"
      />

      <div className="p-6 space-y-6">
        <StatCardGrid stats={stats} />

        {reachData.length > 0 && (
          <ChartContainer
            title="Campaign Reach"
            description="TikTok vs Instagram reach by campaign"
          >
            <ReachBarChart data={reachData} />
          </ChartContainer>
        )}

        {/* Campaign list */}
        <div className="bg-[#111111] border border-[#222222]">
          <div className="px-5 py-4 border-b border-[#222222]">
            <h3 className="text-sm font-syne font-bold text-[#EDE8DE]">Your Campaigns</h3>
          </div>
          {campaigns.length === 0 ? (
            <div className="px-5 py-10 text-center text-[#3A3A3A] font-syne text-xs uppercase tracking-widest">
              No campaigns yet
            </div>
          ) : (
            <div className="divide-y divide-[#1A1A1A]">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="flex items-center justify-between px-5 py-4">
                  <div>
                    <div className="font-syne font-bold text-sm text-[#EDE8DE] mb-0.5">{campaign.name}</div>
                    <div className="font-fraunces text-xs text-[#6B6860]">
                      {PLATFORM_LABELS[campaign.platform as PlatformValue]} · {formatCurrency(campaign.totalBudget)}
                    </div>
                  </div>
                  <CampaignStatusBadge status={campaign.status as CampaignStatusValue} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
