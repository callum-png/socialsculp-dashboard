import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { CampaignStatusBadge } from '@/components/campaigns/CampaignStatusBadge'
import { getDb } from '@/lib/db'
import { PLATFORM_LABELS } from '@/lib/constants'
import type { CampaignStatusValue, PlatformValue } from '@/lib/constants'

export default async function CreatorCampaignsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const db = getDb()
  const user = await db.user.findUnique({
    where: { clerkId: userId },
    include: {
      creatorProfile: {
        include: {
          campaignCreators: {
            include: { campaign: { include: { brand: true } } },
            orderBy: { campaign: { createdAt: 'desc' } },
          },
          deals: {
            where: { stage: { notIn: ['CANCELLED'] } },
            include: { campaign: { include: { brand: true } } },
            orderBy: { createdAt: 'desc' },
          },
        },
      },
    },
  })

  // Combine campaigns from campaignCreators and deals (deduped by campaign ID)
  const seenIds = new Set<string>()
  const myCampaigns: {
    id: string
    name: string
    brandName: string
    status: string
    platform: string
    startDate: Date | null
    endDate: Date | null
  }[] = []

  for (const cc of user?.creatorProfile?.campaignCreators ?? []) {
    if (!seenIds.has(cc.campaign.id)) {
      seenIds.add(cc.campaign.id)
      myCampaigns.push({
        id: cc.campaign.id,
        name: cc.campaign.name,
        brandName: cc.campaign.brand.companyName,
        status: cc.campaign.status,
        platform: cc.campaign.platform,
        startDate: cc.campaign.startDate,
        endDate: cc.campaign.endDate,
      })
    }
  }
  for (const deal of user?.creatorProfile?.deals ?? []) {
    if (!seenIds.has(deal.campaign.id)) {
      seenIds.add(deal.campaign.id)
      myCampaigns.push({
        id: deal.campaign.id,
        name: deal.campaign.name,
        brandName: deal.campaign.brand.companyName,
        status: deal.campaign.status,
        platform: deal.campaign.platform,
        startDate: deal.campaign.startDate,
        endDate: deal.campaign.endDate,
      })
    }
  }

  return (
    <div>
      <PageHeader
        title="My Campaigns"
        description={`${myCampaigns.length} campaign assignment${myCampaigns.length === 1 ? '' : 's'}`}
      />

      <div className="p-6">
        <div className="bg-[#111111] border border-[#222222] divide-y divide-[#1A1A1A]">
          {myCampaigns.length === 0 ? (
            <div className="px-5 py-10 text-center text-[#3A3A3A] font-syne text-xs uppercase tracking-widest">
              No campaign assignments yet
            </div>
          ) : (
            myCampaigns.map((campaign) => (
              <div key={campaign.id} className="px-5 py-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="font-syne font-bold text-[#EDE8DE] mb-1">{campaign.name}</div>
                    <div className="font-fraunces text-sm text-[#6B6860]">{campaign.brandName}</div>
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
                  {campaign.startDate && (
                    <div>
                      <div className="text-[10px] font-syne uppercase tracking-widest text-[#6B6860] mb-0.5">Start</div>
                      <div className="text-xs font-syne text-[#EDE8DE]">
                        {new Date(campaign.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                  )}
                  {campaign.endDate && (
                    <div>
                      <div className="text-[10px] font-syne uppercase tracking-widest text-[#6B6860] mb-0.5">End</div>
                      <div className="text-xs font-syne text-[#EDE8DE]">
                        {new Date(campaign.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
