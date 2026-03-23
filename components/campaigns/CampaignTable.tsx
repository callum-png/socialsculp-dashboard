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
    <div className="bg-surface border border-border rounded-xl shadow-xs overflow-x-auto">
      <table className="w-full text-sm font-syne">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-muted font-bold">
              Campaign
            </th>
            <th className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-muted font-bold">
              Brand
            </th>
            <th className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-muted font-bold">
              Status
            </th>
            <th className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-muted font-bold">
              Platform
            </th>
            <th className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-muted font-bold">
              Budget
            </th>
            <th className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-muted font-bold min-w-[140px]">
              Spent
            </th>
            <th className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-muted font-bold">
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
                className="border-b border-surface-2 hover:bg-surface/50 transition-colors"
              >
                <td className="px-5 py-4 text-text font-medium max-w-[200px]">
                  <span className="block truncate">{campaign.name}</span>
                </td>
                <td className="px-5 py-4 font-syne italic text-muted">
                  {campaign.brandName}
                </td>
                <td className="px-5 py-4">
                  <CampaignStatusBadge status={campaign.status as CampaignStatusValue} />
                </td>
                <td className="px-5 py-4 font-syne italic text-muted">
                  {PLATFORM_LABELS[campaign.platform as PlatformValue] ?? campaign.platform}
                </td>
                <td className="px-5 py-4 text-text">
                  {formatCurrency(campaign.totalBudget)}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 bg-surface-2 min-w-[60px]">
                      <div
                        className="h-full bg-accent"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-muted text-xs w-10 shrink-0 text-right">
                      {pct}%
                    </span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <Link
                    href={`/admin/campaigns/${campaign.id}`}
                    className="inline-flex items-center px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest border border-border text-muted hover:border-accent hover:text-accent transition-colors"
                  >
                    View
                  </Link>
                </td>
              </tr>
            )
          })}
          {campaigns.length === 0 && (
            <tr>
              <td colSpan={7} className="px-5 py-12 text-center text-muted/50 font-syne text-xs uppercase tracking-widest">
                No campaigns yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
