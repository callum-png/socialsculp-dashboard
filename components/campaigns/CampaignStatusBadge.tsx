import { cn } from '@/lib/utils'
import { CAMPAIGN_STATUS_COLORS, CAMPAIGN_STATUS_LABELS } from '@/lib/constants'
import type { CampaignStatusValue } from '@/lib/constants'

interface Props {
  status: CampaignStatusValue
  className?: string
}

export function CampaignStatusBadge({ status, className }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-[10px] font-syne font-bold uppercase tracking-widest',
        CAMPAIGN_STATUS_COLORS[status],
        className
      )}
    >
      {CAMPAIGN_STATUS_LABELS[status]}
    </span>
  )
}
