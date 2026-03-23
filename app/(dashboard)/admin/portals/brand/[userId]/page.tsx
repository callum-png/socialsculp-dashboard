import { auth } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { getDb } from '@/lib/db'
import { PreviewBanner } from '@/components/admin/PreviewBanner'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCardGrid } from '@/components/dashboard/StatCardGrid'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { Eye, TrendingUp, DollarSign, Megaphone } from 'lucide-react'
import { CampaignStatusBadge } from '@/components/campaigns/CampaignStatusBadge'
import type { CampaignStatusValue } from '@/lib/constants'

interface PageProps {
  params: Promise<{ userId: string }>
}

export default async function BrandPortalPreviewPage({ params }: PageProps) {
  const { userId: adminClerkId } = await auth()
  if (!adminClerkId) redirect('/sign-in')

  const db = getDb()
  const adminUser = await db.user.findUnique({ where: { clerkId: adminClerkId } })
  if (adminUser?.role !== 'ADMIN') redirect('/admin')

  const { userId } = await params

  const targetUser = await db.user.findUnique({
    where: { id: userId },
    include: {
      brandProfile: {
        include: {
          campaigns: {
            include: { analyticsSnapshots: { orderBy: { date: 'desc' }, take: 1 } },
            orderBy: { createdAt: 'desc' },
          },
        },
      },
    },
  })

  if (!targetUser || targetUser.role !== 'BRAND') notFound()

  const brand = targetUser.brandProfile
  const campaigns = brand?.campaigns ?? []

  const totalReach = campaigns.reduce((s, c) => s + (c.analyticsSnapshots[0]?.reach ?? 0), 0)
  const totalSpend = campaigns.reduce((s, c) => s + (c.analyticsSnapshots[0]?.spend ?? 0), 0)
  const activeCampaigns = campaigns.filter(c => c.status === 'ACTIVE').length
  const avgROAS = campaigns.length > 0
    ? campaigns.reduce((s, c) => s + (c.analyticsSnapshots[0]?.roas ?? 0), 0) / campaigns.length
    : 0

  return (
    <>
      <PreviewBanner userName={targetUser.name} role="Brand" />
      <div className="p-6">
        <PageHeader
          title={brand?.companyName ?? targetUser.name}
          description="Brand dashboard"
        />
        <StatCardGrid
          stats={[
            { title: 'Active Campaigns', value: activeCampaigns, icon: Megaphone },
            { title: 'Total Reach', value: formatNumber(totalReach), icon: Eye },
            { title: 'Total Spend', value: formatCurrency(totalSpend), icon: DollarSign },
            { title: 'Avg ROAS', value: `${avgROAS.toFixed(1)}x`, icon: TrendingUp },
          ]}
        />
        <div className="mt-8 bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-base font-syne font-semibold text-white">Campaigns</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-5 py-3 text-left text-xs text-muted-foreground font-syne uppercase">Campaign</th>
                <th className="px-5 py-3 text-left text-xs text-muted-foreground font-syne uppercase hidden sm:table-cell">Status</th>
                <th className="px-5 py-3 text-right text-xs text-muted-foreground font-syne uppercase">Budget</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map(c => (
                <tr key={c.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 text-white font-syne">{c.name}</td>
                  <td className="px-5 py-3 hidden sm:table-cell">
                    <CampaignStatusBadge status={c.status as CampaignStatusValue} />
                  </td>
                  <td className="px-5 py-3 text-right text-muted-foreground font-syne">{formatCurrency(c.totalBudget)}</td>
                </tr>
              ))}
              {/* Demo campaign — always visible as a placeholder */}
              <tr className="border-b border-border last:border-0 group">
                <td className="px-5 py-3">
                  <Link
                    href={`/admin/portals/brand/${userId}/campaign/demo`}
                    className="text-white font-syne hover:text-[#008cff] transition-colors flex items-center gap-2"
                  >
                    X Campaign
                    <span className="text-[10px] font-syne font-bold uppercase tracking-widest px-1.5 py-0.5 bg-muted text-muted-foreground border border-border">
                      Demo
                    </span>
                  </Link>
                </td>
                <td className="px-5 py-3 hidden sm:table-cell">
                  <CampaignStatusBadge status="ACTIVE" />
                </td>
                <td className="px-5 py-3 text-right text-muted-foreground font-syne">$12,500</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
