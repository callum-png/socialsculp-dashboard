'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

const TABS = [
  { label: 'Status', value: 'overview' },
  { label: 'Tasks', value: 'tasks' },
  { label: 'Cron Jobs', value: 'crons' },
  { label: 'Token Burn', value: 'tokens' },
  { label: 'Revenue', value: 'revenue' },
  { label: 'Workflows', value: 'workflows' },
  { label: 'Terminal', value: 'terminal' },
]

export function MissionControlTabBar() {
  const searchParams = useSearchParams()
  const active = searchParams.get('tab') ?? 'overview'

  return (
    <div className="flex gap-0 border-b border-[#222222] px-6 overflow-x-auto">
      {TABS.map(tab => (
        <Link
          key={tab.value}
          href={`/admin/mission-control?tab=${tab.value}`}
          className={`px-5 py-3 text-sm font-syne border-b-2 transition-colors -mb-px whitespace-nowrap ${
            active === tab.value
              ? 'border-[#008cff] text-[#008cff]'
              : 'border-transparent text-[#6B6860] hover:text-[#EDE8DE]'
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  )
}
