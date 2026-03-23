import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { getDb } from '@/lib/db'
import { formatCurrency } from '@/lib/utils'
import { DEAL_STAGE_COLORS, DEAL_STAGE_LABELS } from '@/lib/constants'
import type { DealStageValue } from '@/lib/constants'

export default async function CreatorDealsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const db = getDb()
  const user = await db.user.findUnique({
    where: { clerkId: userId },
    include: {
      creatorProfile: {
        include: {
          deals: {
            where: { stage: { notIn: ['CANCELLED'] } },
            include: { campaign: { include: { brand: true } } },
            orderBy: { createdAt: 'desc' },
          },
        },
      },
    },
  })

  const deals = user?.creatorProfile?.deals ?? []

  return (
    <div>
      <PageHeader
        eyebrow="Creator"
        title="My Deals"
        description={`${deals.length} deal${deals.length === 1 ? '' : 's'}`}
      />

      <div className="p-6">
        <div className="bg-[#111111] border border-[#222222] overflow-x-auto">
          <table className="w-full text-sm font-syne">
            <thead>
              <tr className="border-b border-[#222222]">
                {['Campaign', 'Brand', 'Stage', 'Proposed', 'Agreed', 'Notes'].map((col) => (
                  <th
                    key={col}
                    className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-[#6B6860] font-bold"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {deals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-[#3A3A3A] font-syne text-xs uppercase tracking-widest">
                    No deals yet
                  </td>
                </tr>
              ) : (
                deals.map((deal) => (
                  <tr key={deal.id} className="border-b border-[#1A1A1A] hover:bg-[#141414] transition-colors">
                    <td className="px-5 py-4 text-[#EDE8DE] font-medium max-w-[200px]">
                      <span className="block truncate">{deal.campaign.name}</span>
                    </td>
                    <td className="px-5 py-4 text-[#6B6860]">
                      {deal.campaign.brand.companyName}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-syne font-bold uppercase tracking-widest ${DEAL_STAGE_COLORS[deal.stage as DealStageValue]}`}>
                        {DEAL_STAGE_LABELS[deal.stage as DealStageValue]}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[#6B6860]">
                      {deal.proposedFee ? formatCurrency(deal.proposedFee) : '—'}
                    </td>
                    <td className="px-5 py-4">
                      {deal.agreedFee != null ? (
                        <span className="font-bold text-[#008cff]">{formatCurrency(deal.agreedFee)}</span>
                      ) : (
                        <span className="text-[#6B6860]">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-[#6B6860] font-fraunces text-xs">
                      {deal.notes ?? '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
