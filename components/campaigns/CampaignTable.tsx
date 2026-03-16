'use client'

import Link from 'next/link'
import { CampaignStatusBadge } from './CampaignStatusBadge'
import { formatCurrency, budgetPercent } from '@/lib/utils'
import { PLATFORM_LABELS } from '@/lib/constants'
import type { CampaignStatusValue, PlatformValue } from '@/lib/constants'

interface CampaignRow {
  id: string
  name: string
  brandName: string
  status: string
  platform: string
  totalBudget: number
  spentBudget: number
}

interface Props {
  campaigns: CampaignRow[]
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
          {campaigns.map((campaign) => {
            const pct = budgetPercent(campaign.spentBudget, campaign.totalBudget)

            return (
              <tr
                key={campaign.id}
                className="border-b border-[#1A1A1A] hover:bg-[#141414] transition-colors"
              >
                <td className="px-5 py-4 text-[#EDE8DE] font-medium max-w-[200px]">
                  <span className="block truncate">{campaign.name}</span>
                </td>
                <td className="px-5 py-4 text-[#6B6860]">
                  {campaign.brandName}
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
                        className="h-full bg-[#008cff]"
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
                    href={`/admin/campaigns/${campaign.id}`}
                    className="inline-flex items-center px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest border border-[#222222] text-[#6B6860] hover:border-[#008cff] hover:text-[#008cff] transition-colors"
                  >
                    View
                  </Link>
                </td>
              </tr>
            )
          })}
          {campaigns.length === 0 && (
            <tr>
              <td colSpan={7} className="px-5 py-12 text-center text-[#3A3A3A] font-syne text-xs uppercase tracking-widest">
                No campaigns yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
