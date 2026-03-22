import { StatCard } from '@/components/shared/StatCard'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  delta?: number
  deltaLabel?: string
  icon?: LucideIcon
  formatter?: (v: number) => string
  loading?: boolean
  accent?: boolean
  color?: 'default' | 'blue' | 'emerald' | 'amber' | 'purple'
}

interface StatCardGridProps {
  stats: StatCardProps[]
}

export function StatCardGrid({ stats }: StatCardGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <StatCard key={i} {...stat} />
      ))}
    </div>
  )
}
