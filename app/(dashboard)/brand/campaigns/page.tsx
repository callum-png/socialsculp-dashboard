import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { CampaignTable } from '@/components/campaigns/CampaignTable'
import { getDb } from '@/lib/db'

export default async function BrandCampaignsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const db = getDb()
  const user = await db.user.findUnique({
    where: { clerkId: userId },
    include: {
      brandProfile: {
        include: {
          campaigns: { orderBy: { createdAt: 'desc' } },
        },
      },
    },
  })

  const campaigns = user?.brandProfile?.campaigns ?? []
  const brandName = user?.brandProfile?.companyName ?? 'Your Brand'

  const tableData = campaigns.map((c) => ({
    id: c.id,
    name: c.name,
    brandName,
    status: c.status,
    platform: c.platform,
    totalBudget: c.totalBudget,
    spentBudget: c.spentBudget,
  }))

  return (
    <div>
      <PageHeader
        eyebrow="Brand"
        title="My Campaigns"
        description={`${campaigns.length} campaign${campaigns.length === 1 ? '' : 's'} for ${brandName}`}
      />
      <div className="p-6">
        <CampaignTable campaigns={tableData} />
      </div>
    </div>
  )
}
