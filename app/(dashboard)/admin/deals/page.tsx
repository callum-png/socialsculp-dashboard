import { PageHeader } from '@/components/shared/PageHeader'
import { DealKanban } from '@/components/deals/DealKanban'
import { getDb } from '@/lib/db'
import type { KanbanDeal } from '@/components/deals/DealKanbanCard'
import type { DealStage } from '@/types'

export default async function AdminDealsPage() {
  const db = getDb()
  const [deals, campaigns, creators] = await Promise.all([
    db.deal.findMany({
      where: { stage: { notIn: ['CANCELLED'] } },
      include: { creator: true, campaign: true },
      orderBy: { createdAt: 'desc' },
    }),
    db.campaign.findMany({
      where: { status: { notIn: ['CANCELLED', 'COMPLETED'] } },
      select: { id: true, name: true },
      orderBy: { createdAt: 'desc' },
    }),
    db.creatorProfile.findMany({
      include: { user: { select: { name: true } } },
      orderBy: { handle: 'asc' },
    }),
  ])

  const kanbanDeals: KanbanDeal[] = deals.map((d) => ({
    id: d.id,
    title: d.title,
    stage: d.stage as DealStage,
    creatorHandle: d.creator.handle,
    campaignName: d.campaign.name,
    agreedFee: d.agreedFee ?? undefined,
    proposedFee: d.proposedFee ?? undefined,
  }))

  const campaignOptions = campaigns.map((c) => ({ id: c.id, name: c.name }))
  const creatorOptions = creators.map((c) => ({
    id: c.id,
    handle: c.handle,
    name: c.user.name,
  }))

  return (
    <div>
      <PageHeader
        title="Deal Pipeline"
        description={`${deals.length} deal${deals.length === 1 ? '' : 's'} across all stages`}
      />
      <div className="p-6">
        <DealKanban
          initialDeals={kanbanDeals}
          campaigns={campaignOptions}
          creators={creatorOptions}
        />
      </div>
    </div>
  )
}
