import { PageHeader } from '@/components/shared/PageHeader'
import { NewCampaignForm } from '@/components/campaigns/NewCampaignForm'
import { getDb } from '@/lib/db'

export default async function NewCampaignPage() {
  const db = getDb()
  const brands = await db.brandProfile.findMany({
    select: { id: true, companyName: true },
    orderBy: { companyName: 'asc' },
  })

  return (
    <div>
      <PageHeader
        title="New Campaign"
        description="Create a new influencer marketing campaign"
        breadcrumb={[
          { label: 'Campaigns', href: '/admin/campaigns' },
          { label: 'New' },
        ]}
      />
      <NewCampaignForm brands={brands} />
    </div>
  )
}
