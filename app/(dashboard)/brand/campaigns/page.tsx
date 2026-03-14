import { PageHeader } from '@/components/shared/PageHeader'
import { CampaignTable } from '@/components/campaigns/CampaignTable'
import { MOCK_CAMPAIGNS } from '@/lib/mock-data'

// Cal AI brand = index 0
const MY_CAMPAIGNS = MOCK_CAMPAIGNS.filter((c) => c.brandIndex === 0)

export default function BrandCampaignsPage() {
  return (
    <div>
      <PageHeader
        title="My Campaigns"
        description={`${MY_CAMPAIGNS.length} campaigns for Cal AI`}
      />
      <div className="p-6">
        <CampaignTable campaigns={MY_CAMPAIGNS} />
      </div>
    </div>
  )
}
