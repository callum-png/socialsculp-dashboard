import { PageHeader } from '@/components/shared/PageHeader'
import { StatCardGrid } from '@/components/dashboard/StatCardGrid'
import { ChartContainer } from '@/components/charts/ChartContainer'
import { ReachBarChart } from '@/components/charts/ReachBarChart'
import { CampaignStatusBadge } from '@/components/campaigns/CampaignStatusBadge'
import { MOCK_CAMPAIGNS, MOCK_BRANDS, generateAnalyticsData } from '@/lib/mock-data'
import { PLATFORM_LABELS } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils'
import { Megaphone, Eye, DollarSign, TrendingUp } from 'lucide-react'
import type { CampaignStatusValue, PlatformValue } from '@/lib/constants'

// Cal AI brand = index 0
const MY_CAMPAIGNS = MOCK_CAMPAIGNS.filter((c) => c.brandIndex === 0)

export default function BrandOverviewPage() {
  const reachData = MY_CAMPAIGNS.map((c) => {
    const a = generateAnalyticsData(c.name, 30)
    const total = a.reduce((s, d) => s + d.reach, 0)
    return {
      name: c.name.split('—')[1]?.trim() ?? c.name,
      tiktok: Math.round(total * 0.55),
      instagram: Math.round(total * 0.45),
    }
  })

  const stats = [
    { title: 'Active Campaigns', value: MY_CAMPAIGNS.filter((c) => c.status === 'ACTIVE').length, icon: Megaphone, delta: 0, deltaLabel: '' },
    { title: 'Total Reach', value: '8.2M', icon: Eye, delta: 14.3, deltaLabel: 'vs last month' },
    { title: 'Total Spend', value: '$137K', icon: DollarSign, delta: 8.1, deltaLabel: 'vs last month' },
    { title: 'Avg ROAS', value: '4.1×', icon: TrendingUp, delta: 3.2, deltaLabel: 'vs last month', accent: true },
  ]

  return (
    <div>
      <PageHeader
        title="Welcome, Cal AI."
        description="Your campaign performance at a glance"
      />

      <div className="p-6 space-y-6">
        <StatCardGrid stats={stats} />

        <ChartContainer
          title="Campaign Reach"
          description="TikTok vs Instagram reach by campaign"
        >
          <ReachBarChart data={reachData} />
        </ChartContainer>

        {/* Campaign list */}
        <div className="bg-[#111111] border border-[#222222]">
          <div className="px-5 py-4 border-b border-[#222222]">
            <h3 className="text-sm font-syne font-bold text-[#EDE8DE]">Your Campaigns</h3>
          </div>
          <div className="divide-y divide-[#1A1A1A]">
            {MY_CAMPAIGNS.map((campaign, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-4">
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
        </div>
      </div>
    </div>
  )
}
