import Link from 'next/link'
import { Plus, Megaphone, FileText, CheckCircle, DollarSign } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCardGrid } from '@/components/dashboard/StatCardGrid'
import { CampaignTable } from '@/components/campaigns/CampaignTable'
import { getDb } from '@/lib/db'
import { formatCurrency } from '@/lib/utils'

export default async function AdminCampaignsPage() {
  const db = getDb()
  const campaigns = await db.campaign.findMany({
    include: { brand: true },
    orderBy: { createdAt: 'desc' },
  })

  const active = campaigns.filter((c) => c.status === 'ACTIVE').length
  const draft = campaigns.filter((c) => c.status === 'DRAFT').length
  const completed = campaigns.filter((c) => c.status === 'COMPLETED').length
  const totalBudget = campaigns.reduce((sum, c) => sum + c.totalBudget, 0)

  const stats = [
    { title: 'Active', value: active, icon: Megaphone, delta: 12.5, deltaLabel: 'vs last month' },
    { title: 'Draft', value: draft, icon: FileText },
    { title: 'Completed', value: completed, icon: CheckCircle, delta: 4.2, deltaLabel: 'vs last month' },
    { title: 'Total Budget', value: formatCurrency(totalBudget), icon: DollarSign, accent: true },
  ]

  const tableData = campaigns.map((c) => ({
    id: c.id,
    name: c.name,
    brandName: c.brand.companyName,
    status: c.status,
    platform: c.platform,
    totalBudget: c.totalBudget,
    spentBudget: c.spentBudget,
  }))

  return (
    <div>
      <PageHeader
        title="Campaigns"
        description={`${campaigns.length} campaigns total`}
      >
        <Link
          href="/admin/campaigns/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-bg text-xs font-syne font-bold uppercase tracking-widest hover:bg-accent/90 transition-colors"
        >
          <Plus size={13} />
          New Campaign
        </Link>
      </PageHeader>

      <div className="p-6 space-y-6">
        <StatCardGrid stats={stats} />
        <CampaignTable campaigns={tableData} />
      </div>
    </div>
  )
}
