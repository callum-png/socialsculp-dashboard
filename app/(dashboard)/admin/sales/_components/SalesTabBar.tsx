'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

const TABS = [
  { label: 'Call Preps', value: 'call-preps' },
  { label: 'Playbooks', value: 'playbooks' },
]

export function SalesTabBar() {
  const searchParams = useSearchParams()
  const active = searchParams.get('tab') ?? 'call-preps'

  return (
    <div className="flex gap-0 border-b border-[#222222] px-6">
      {TABS.map(tab => (
        <Link
          key={tab.value}
          href={`/admin/sales?tab=${tab.value}`}
          className={`px-5 py-3 text-sm font-syne border-b-2 transition-colors -mb-px ${
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
