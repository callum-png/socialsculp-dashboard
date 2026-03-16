import { PageHeader } from '@/components/shared/PageHeader'
import { CreatorRoster } from '@/components/creators/CreatorRoster'
import { getDb } from '@/lib/db'

export default async function AdminCreatorsPage() {
  const db = getDb()
  const creators = await db.creatorProfile.findMany({
    include: { user: true },
    orderBy: { totalReach: 'desc' },
  })

  const displayCreators = creators.map((c) => ({
    id: c.id,
    handle: c.handle,
    name: c.user.name,
    niche: c.niche,
    tiktokFollowers: c.tiktokFollowers,
    instagramFollowers: c.instagramFollowers,
    tiktokEngRate: c.tiktokEngRate,
    location: c.location,
  }))

  return (
    <div>
      <PageHeader
        title="Creator Roster"
        description={`${creators.length} creator${creators.length === 1 ? '' : 's'} in your network`}
      />
      <CreatorRoster initialCreators={displayCreators} />
    </div>
  )
}
