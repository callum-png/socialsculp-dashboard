import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  delta?: number
  deltaLabel?: string
  icon?: LucideIcon
  formatter?: (v: number) => string
  loading?: boolean
  accent?: boolean
}

export function StatCard({
  title,
  value,
  delta,
  deltaLabel,
  icon: Icon,
  formatter,
  loading,
  accent,
}: StatCardProps) {
  if (loading) {
    return (
      <div className="bg-[#111111] border border-[#222222] p-5 animate-pulse">
        <div className="flex justify-between items-start mb-4">
          <div className="h-3 w-24 bg-[#1A1A1A] rounded" />
          <div className="h-4 w-4 bg-[#1A1A1A] rounded" />
        </div>
        <div className="h-10 w-32 bg-[#1A1A1A] rounded mb-2" />
        <div className="h-3 w-16 bg-[#1A1A1A] rounded" />
      </div>
    )
  }

  const displayValue =
    typeof value === 'number' && formatter ? formatter(value) : String(value)

  const isPositiveDelta = delta !== undefined && delta >= 0
  const deltaColor = isPositiveDelta ? 'text-[#4ADE80]' : 'text-[#FF4747]'
  const deltaBg = isPositiveDelta ? 'bg-[#0A1F0A] border-[#1A4A1A]' : 'bg-[#1F0A0A] border-[#4A1A1A]'

  return (
    <div
      className={cn(
        'bg-[#111111] border border-[#222222] p-5 relative',
        accent && 'border-l-2 border-l-[#C9FF47]'
      )}
    >
      {/* Icon + Title row */}
      <div className="flex items-start justify-between mb-3">
        <span className="text-[10px] font-syne font-bold uppercase tracking-[0.15em] text-[#6B6860]">
          {title}
        </span>
        {Icon && <Icon size={15} className="text-[#6B6860] shrink-0" />}
      </div>

      {/* Value */}
      <div className="font-fraunces text-[2.5rem] font-light leading-none text-[#EDE8DE] mb-3">
        {displayValue}
      </div>

      {/* Delta pill */}
      {delta !== undefined && (
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-syne font-bold border',
              deltaBg,
              deltaColor
            )}
          >
            {isPositiveDelta ? (
              <TrendingUp size={10} />
            ) : (
              <TrendingDown size={10} />
            )}
            {isPositiveDelta ? '+' : ''}
            {delta.toFixed(1)}%
          </span>
          {deltaLabel && (
            <span className="text-[11px] font-syne text-[#6B6860]">{deltaLabel}</span>
          )}
        </div>
      )}
    </div>
  )
}
