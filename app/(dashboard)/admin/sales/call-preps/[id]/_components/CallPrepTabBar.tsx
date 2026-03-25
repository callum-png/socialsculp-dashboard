'use client'

const TABS = [
  { label: 'Prep', value: 'prep' as const },
  { label: 'Research', value: 'research' as const },
  { label: 'Notes', value: 'notes' as const },
]

export type CallPrepTab = (typeof TABS)[number]['value']

interface CallPrepTabBarProps {
  active: CallPrepTab
  onChange: (tab: CallPrepTab) => void
}

export function CallPrepTabBar({ active, onChange }: CallPrepTabBarProps) {
  return (
    <div className="flex gap-0 border-b border-[#222222] px-6">
      {TABS.map(tab => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`px-5 py-3 text-sm font-syne border-b-2 transition-colors -mb-px ${
            active === tab.value
              ? 'border-[#008cff] text-[#008cff]'
              : 'border-transparent text-[#6B6860] hover:text-[#EDE8DE]'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
