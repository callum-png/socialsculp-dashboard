import { auth } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import { getDb } from '@/lib/db'
import { PreviewBanner } from '@/components/admin/PreviewBanner'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCardGrid } from '@/components/dashboard/StatCardGrid'
import { formatNumber, formatPercent } from '@/lib/utils'
import { Users, TrendingUp, Megaphone, Star } from 'lucide-react'
import { CampaignStatusBadge } from '@/components/campaigns/CampaignStatusBadge'
import type { CampaignStatusValue } from '@/lib/constants'

interface PageProps {
  params: Promise<{ userId: string }>
}

export default async function CreatorPortalPreviewPage({ params }: PageProps) {
  const { userId: adminClerkId } = await auth()
  if (!adminClerkId) redirect('/sign-in')

  const db = getDb()
  const adminUser = await db.user.findUnique({ where: { clerkId: adminClerkId } })
  if (adminUser?.role !== 'ADMIN') redirect('/admin')

  const { userId } = await params

  const targetUser = await db.user.findUnique({
    where: { id: userId },
    include: {
      creatorProfile: {
        include: {
          campaignCreators: {
            include: { campaign: { include: { brand: true } } },
            orderBy: { campaign: { createdAt: 'desc' } },
            take: 5,
          },
          deals: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
      },
    },
  })

  if (!targetUser || targetUser.role !== 'CREATOR') notFound()

  const creator = targetUser.creatorProfile
  const tiktokFollowers = creator?.tiktokFollowers ?? 0
  const instagramFollowers = creator?.instagramFollowers ?? 0
  const totalFollowers = tiktokFollowers + instagramFollowers
  const avgEng = (((creator?.tiktokEngRate ?? 0) + (creator?.instagramEngRate ?? 0)) / 2)

  return (
    <>
      <PreviewBanner userName={targetUser.name} role="Creator" />
      <div className="p-6">
        <PageHeader
          title={creator?.handle ? `@${creator.handle}` : targetUser.name}
          description="Creator portal"
        />
        <StatCardGrid
          stats={[
            { title: 'Total Followers', value: formatNumber(totalFollowers), icon: Users },
            { title: 'TikTok', value: formatNumber(tiktokFollowers), icon: Star },
            { title: 'Instagram', value: formatNumber(instagramFollowers), icon: Star },
            { title: 'Avg Eng Rate', value: formatPercent(avgEng), icon: TrendingUp },
          ]}
        />
        <div className="mt-8 bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-base font-syne font-semibold text-white">Active Campaigns</h2>
          </div>
          {(creator?.campaignCreators?.length ?? 0) === 0 ? (
            <p className="px-5 py-8 text-sm text-muted-foreground font-syne text-center">No campaigns assigned.</p>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {(creator?.campaignCreators ?? []).map(cc => (
                  <tr key={cc.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3 text-white font-syne">{cc.campaign.name}</td>
                    <td className="px-5 py-3 text-muted-foreground font-syne hidden sm:table-cell">{cc.campaign.brand.companyName}</td>
                    <td className="px-5 py-3">
                      <CampaignStatusBadge status={cc.campaign.status as CampaignStatusValue} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  )
}
