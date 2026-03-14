'use client'

import { PageHeader } from '@/components/shared/PageHeader'
import { DealKanban } from '@/components/deals/DealKanban'
import { MOCK_CREATORS, MOCK_CAMPAIGNS } from '@/lib/mock-data'
import type { KanbanDeal } from '@/components/deals/DealKanbanCard'
import type { DealStage } from '@/types'

const STAGES: DealStage[] = ['OUTREACH', 'NEGOTIATING', 'SIGNED', 'LIVE', 'COMPLETED']

function generateDeals(): KanbanDeal[] {
  const deals: KanbanDeal[] = []

  const dealDefs = [
    { ci: 0, ki: 0, stage: 'LIVE', agreedFee: 12000 },
    { ci: 1, ki: 4, stage: 'LIVE', agreedFee: 18500 },
    { ci: 0, ki: 1, stage: 'SIGNED', agreedFee: 9500 },
    { ci: 2, ki: 7, stage: 'SIGNED', agreedFee: 15000 },
    { ci: 1, ki: 2, stage: 'NEGOTIATING', proposedFee: 8000 },
    { ci: 3, ki: 3, stage: 'NEGOTIATING', proposedFee: 22000 },
    { ci: 0, ki: 5, stage: 'OUTREACH', proposedFee: 6500 },
    { ci: 2, ki: 6, stage: 'OUTREACH', proposedFee: 11000 },
    { ci: 3, ki: 8, stage: 'COMPLETED', agreedFee: 25000 },
    { ci: 4, ki: 9, stage: 'COMPLETED', agreedFee: 19000 },
    { ci: 1, ki: 10, stage: 'OUTREACH', proposedFee: 7500 },
    { ci: 4, ki: 11, stage: 'NEGOTIATING', proposedFee: 14000 },
  ] as const

  dealDefs.forEach((def, i) => {
    const campaign = MOCK_CAMPAIGNS[def.ci % MOCK_CAMPAIGNS.length]
    const creator = MOCK_CREATORS[def.ki % MOCK_CREATORS.length]
    deals.push({
      id: `deal-${i + 1}`,
      title: `${creator.handle} × ${campaign.name}`,
      stage: def.stage as DealStage,
      creatorHandle: creator.handle,
      campaignName: campaign.name,
      agreedFee: 'agreedFee' in def ? def.agreedFee : undefined,
      proposedFee: 'proposedFee' in def ? def.proposedFee : undefined,
    })
  })

  return deals
}

const MOCK_DEALS = generateDeals()

export default function AdminDealsPage() {
  return (
    <div>
      <PageHeader
        title="Deal Pipeline"
        description={`${MOCK_DEALS.length} deals across all stages`}
      />
      <div className="p-6">
        <DealKanban initialDeals={MOCK_DEALS} />
      </div>
    </div>
  )
}
