import { PageHeader } from '@/components/shared/PageHeader'
import { CampaignStatusBadge } from '@/components/campaigns/CampaignStatusBadge'
import { MOCK_CAMPAIGNS, MOCK_BRANDS } from '@/lib/mock-data'
import { PLATFORM_LABELS } from '@/lib/constants'
import type { CampaignStatusValue, PlatformValue } from '@/lib/constants'

// Creator's assigned campaigns (indices 0, 1, 3)
const MY_CAMPAIGN_INDICES = [0, 1, 3] as const

export default function CreatorCampaignsPage() {
  const myCampaigns = MY_CAMPAIGN_INDICES.map((i) => ({
    ...MOCK_CAMPAIGNS[i],
    index: i,
  }))

  return (
    <div>
      <PageHeader
        title="My Campaigns"
        description={`${myCampaigns.length} active campaign assignments`}
      />

      <div className="p-6">
        <div className="bg-[#111111] border border-[#222222] divide-y divide-[#1A1A1A]">
          {myCampaigns.map((campaign) => {
            const brand = MOCK_BRANDS[campaign.brandIndex]

            const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString(
              'en-US', { month: 'short', day: 'numeric', year: 'numeric' }
            )
            const endDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toLocaleDateString(
              'en-US', { month: 'short', day: 'numeric', year: 'numeric' }
            )

            return (
              <div key={campaign.index} className="px-5 py-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="font-syne font-bold text-[#EDE8DE] mb-1">{campaign.name}</div>
                    <div className="font-fraunces text-sm text-[#6B6860]">{brand.companyName}</div>
                  </div>
                  <CampaignStatusBadge status={campaign.status as CampaignStatusValue} />
                </div>

                <div className="flex flex-wrap gap-4">
                  <div>
                    <div className="text-[10px] font-syne uppercase tracking-widest text-[#6B6860] mb-0.5">Platform</div>
                    <div className="text-xs font-syne text-[#EDE8DE]">
                      {PLATFORM_LABELS[campaign.platform as PlatformValue]}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-syne uppercase tracking-widest text-[#6B6860] mb-0.5">Start</div>
                    <div className="text-xs font-syne text-[#EDE8DE]">{startDate}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-syne uppercase tracking-widest text-[#6B6860] mb-0.5">End</div>
                    <div className="text-xs font-syne text-[#EDE8DE]">{endDate}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
