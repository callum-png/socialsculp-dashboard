import { PageHeader } from '@/components/shared/PageHeader'
import { MOCK_CAMPAIGNS } from '@/lib/mock-data'
import { formatCurrency } from '@/lib/utils'
import { DEAL_STAGE_COLORS, DEAL_STAGE_LABELS } from '@/lib/constants'
import type { DealStage } from '@/types'

const MY_DEALS = [
  {
    campaign: MOCK_CAMPAIGNS[0].name,
    stage: 'LIVE' as DealStage,
    proposedFee: 12000,
    agreedFee: 12000,
    notes: 'Deliverables due Mar 20',
  },
  {
    campaign: MOCK_CAMPAIGNS[1].name,
    stage: 'SIGNED' as DealStage,
    proposedFee: 18000,
    agreedFee: 18500,
    notes: 'Contract signed Feb 28',
  },
  {
    campaign: MOCK_CAMPAIGNS[3].name,
    stage: 'NEGOTIATING' as DealStage,
    proposedFee: 9500,
    agreedFee: undefined,
    notes: 'Awaiting brand approval',
  },
  {
    campaign: MOCK_CAMPAIGNS[2].name,
    stage: 'COMPLETED' as DealStage,
    proposedFee: 8000,
    agreedFee: 8000,
    notes: 'Payment received Jan 15',
  },
  {
    campaign: MOCK_CAMPAIGNS[4].name,
    stage: 'COMPLETED' as DealStage,
    proposedFee: 22000,
    agreedFee: 22000,
    notes: 'Campaign completed Dec 2025',
  },
]

export default function CreatorDealsPage() {
  return (
    <div>
      <PageHeader
        title="My Deals"
        description={`${MY_DEALS.length} deals`}
      />

      <div className="p-6">
        <div className="bg-[#111111] border border-[#222222] overflow-x-auto">
          <table className="w-full text-sm font-syne">
            <thead>
              <tr className="border-b border-[#222222]">
                {['Campaign', 'Stage', 'Proposed', 'Agreed', 'Notes'].map((col) => (
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
              {MY_DEALS.map((deal, i) => (
                <tr key={i} className="border-b border-[#1A1A1A] hover:bg-[#141414] transition-colors">
                  <td className="px-5 py-4 text-[#EDE8DE] font-medium max-w-[200px]">
                    <span className="block truncate">{deal.campaign}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 text-[10px] font-syne font-bold uppercase tracking-widest ${DEAL_STAGE_COLORS[deal.stage]}`}
                    >
                      {DEAL_STAGE_LABELS[deal.stage]}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-[#6B6860]">
                    {formatCurrency(deal.proposedFee)}
                  </td>
                  <td className="px-5 py-4">
                    {deal.agreedFee != null ? (
                      <span className="font-bold text-[#C9FF47]">{formatCurrency(deal.agreedFee)}</span>
                    ) : (
                      <span className="text-[#6B6860]">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-[#6B6860] font-fraunces text-xs">
                    {deal.notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
