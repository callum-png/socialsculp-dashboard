import Link from 'next/link'
import { Plus, Megaphone, FileText, CheckCircle, DollarSign } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCardGrid } from '@/components/dashboard/StatCardGrid'
import { CampaignTable } from '@/components/campaigns/CampaignTable'
import { MOCK_CAMPAIGNS } from '@/lib/mock-data'
import { formatCurrency } from '@/lib/utils'

export default function AdminCampaignsPage() {
  const active = MOCK_CAMPAIGNS.filter((c) => c.status === 'ACTIVE').length
  const draft = MOCK_CAMPAIGNS.filter((c) => c.status === 'DRAFT').length
  const completed = MOCK_CAMPAIGNS.filter((c) => c.status === 'COMPLETED').length
  const totalBudget = MOCK_CAMPAIGNS.reduce((sum, c) => sum + c.totalBudget, 0)

  const stats = [
    { title: 'Active', value: active, icon: Megaphone, delta: 12.5, deltaLabel: 'vs last month' },
    { title: 'Draft', value: draft, icon: FileText },
    { title: 'Completed', value: completed, icon: CheckCircle, delta: 4.2, deltaLabel: 'vs last month' },
    { title: 'Total Budget', value: formatCurrency(totalBudget), icon: DollarSign, accent: true },
  ]

  return (
    <div>
      <PageHeader
        title="Campaigns"
        description={`${MOCK_CAMPAIGNS.length} campaigns total`}
      >
        <Link
          href="/admin/campaigns/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#C9FF47] text-[#090909] text-xs font-syne font-bold uppercase tracking-widest hover:bg-[#b8ee36] transition-colors"
        >
          <Plus size={13} />
          New Campaign
        </Link>
      </PageHeader>

      <div className="p-6 space-y-6">
        <StatCardGrid stats={stats} />
        <CampaignTable campaigns={MOCK_CAMPAIGNS} />
      </div>
    </div>
  )
}
