import { auth } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import { getDb } from '@/lib/db'
import { PreviewBanner } from '@/components/admin/PreviewBanner'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCardGrid } from '@/components/dashboard/StatCardGrid'
import { formatCurrency } from '@/lib/utils'
import { Users, DollarSign, TrendingUp, Handshake } from 'lucide-react'
import { SalesDealStage } from '@prisma/client'

interface PageProps {
  params: Promise<{ userId: string }>
}

const STAGE_LABELS: Record<SalesDealStage, string> = {
  APPOINTMENT_SET: 'Appointment Set',
  QUALIFIED: 'Qualified',
  DECISION_MAKER: 'Decision Maker',
  PROPOSAL_SENT: 'Proposal Sent',
  CLOSED_WON: 'Closed Won',
  CLOSED_LOST: 'Closed Lost',
}

export default async function AgentPortalPreviewPage({ params }: PageProps) {
  const { userId: adminClerkId } = await auth()
  if (!adminClerkId) redirect('/sign-in')

  const db = getDb()
  const adminUser = await db.user.findUnique({ where: { clerkId: adminClerkId } })
  if (adminUser?.role !== 'ADMIN') redirect('/admin')

  const { userId } = await params

  const targetUser = await db.user.findUnique({ where: { id: userId } })
  if (!targetUser || targetUser.role !== 'AGENT') notFound()

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const [newLeads, deals] = await Promise.all([
    db.lead.count({
      where: { createdById: targetUser.id, createdAt: { gte: oneWeekAgo } },
    }),
    db.salesDeal.findMany({
      where: { createdById: targetUser.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ])

  const inNegotiation = deals.filter(d =>
    ['QUALIFIED', 'DECISION_MAKER', 'PROPOSAL_SENT'].includes(d.stage)
  ).length
  const closedWon = deals.filter(d => d.stage === 'CLOSED_WON').length
  const pipelineValue = deals
    .filter(d => d.stage !== 'CLOSED_LOST')
    .reduce((s, d) => s + (d.value ?? 0), 0)

  return (
    <>
      <PreviewBanner userName={targetUser.name} role="Agent" />
      <div className="p-6">
        <PageHeader title={targetUser.name} description="Agent portal" />
        <StatCardGrid
          stats={[
            { title: 'New Leads (7d)', value: newLeads, icon: Users },
            { title: 'In Negotiation', value: inNegotiation, icon: Handshake },
            { title: 'Closed Won', value: closedWon, icon: TrendingUp },
            { title: 'Pipeline Value', value: formatCurrency(pipelineValue), icon: DollarSign },
          ]}
        />
        <div className="mt-8 bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-base font-syne font-semibold text-white">Recent Deals</h2>
          </div>
          {deals.length === 0 ? (
            <p className="px-5 py-8 text-sm text-muted-foreground font-syne text-center">No deals yet.</p>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {deals.slice(0, 8).map(d => (
                  <tr key={d.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3 text-white font-syne">{d.title}</td>
                    <td className="px-5 py-3 text-muted-foreground font-syne hidden sm:table-cell">{STAGE_LABELS[d.stage]}</td>
                    <td className="px-5 py-3 text-right text-muted-foreground font-syne">{formatCurrency(d.value ?? 0)}</td>
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
