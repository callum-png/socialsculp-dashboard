'use client'

import Link from 'next/link'
import { CampaignStatusBadge } from './CampaignStatusBadge'
import { formatCurrency, budgetPercent } from '@/lib/utils'
import { MOCK_BRANDS } from '@/lib/mock-data'
import { PLATFORM_LABELS } from '@/lib/constants'
import type { CampaignStatusValue, PlatformValue } from '@/lib/constants'

interface CampaignRow {
  name: string
  brandIndex: number
  status: string
  platform: string
  totalBudget: number
  spentBudget: number
}

interface Props {
  campaigns: readonly CampaignRow[]
}

export function CampaignTable({ campaigns }: Props) {
  return (
    <div className="bg-[#111111] border border-[#222222] overflow-x-auto">
      <table className="w-full text-sm font-syne">
        <thead>
          <tr className="border-b border-[#222222]">
            <th className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-[#6B6860] font-bold">
              Campaign
            </th>
            <th className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-[#6B6860] font-bold">
              Brand
            </th>
            <th className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-[#6B6860] font-bold">
              Status
            </th>
            <th className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-[#6B6860] font-bold">
              Platform
            </th>
            <th className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-[#6B6860] font-bold">
              Budget
            </th>
            <th className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-[#6B6860] font-bold min-w-[140px]">
              Spent
            </th>
            <th className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-[#6B6860] font-bold">
              &nbsp;
            </th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((campaign, i) => {
            const brand = MOCK_BRANDS[campaign.brandIndex as number]
            const pct = budgetPercent(campaign.spentBudget, campaign.totalBudget)

            return (
              <tr
                key={i}
                className="border-b border-[#1A1A1A] hover:bg-[#141414] transition-colors"
              >
                <td className="px-5 py-4 text-[#EDE8DE] font-medium max-w-[200px]">
                  <span className="block truncate">{campaign.name}</span>
                </td>
                <td className="px-5 py-4 text-[#6B6860]">
                  {brand?.companyName ?? '—'}
                </td>
                <td className="px-5 py-4">
                  <CampaignStatusBadge status={campaign.status as CampaignStatusValue} />
                </td>
                <td className="px-5 py-4 text-[#6B6860]">
                  {PLATFORM_LABELS[campaign.platform as PlatformValue] ?? campaign.platform}
                </td>
                <td className="px-5 py-4 text-[#EDE8DE]">
                  {formatCurrency(campaign.totalBudget)}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 bg-[#1A1A1A] min-w-[60px]">
                      <div
                        className="h-full bg-[#C9FF47]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[#6B6860] text-xs w-10 shrink-0 text-right">
                      {pct}%
                    </span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <Link
                    href={`/admin/campaigns/${i}`}
                    className="inline-flex items-center px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest border border-[#222222] text-[#6B6860] hover:border-[#C9FF47] hover:text-[#C9FF47] transition-colors"
                  >
                    View
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
