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
  color?: 'default' | 'blue' | 'emerald' | 'amber' | 'purple'
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
  color = 'default',
}: StatCardProps) {
  if (loading) {
    return (
      <div className="rounded-xl bg-card border border-border shadow-xs p-4 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-muted shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-20 bg-muted rounded" />
            <div className="h-3 w-28 bg-muted rounded" />
          </div>
        </div>
      </div>
    )
  }

  const displayValue =
    typeof value === 'number' && formatter ? formatter(value) : String(value)

  const isPositiveDelta = delta !== undefined && delta >= 0

  const iconBg = accent || color === 'blue'
    ? 'bg-[#008cff]/10'
    : color === 'emerald'
    ? 'bg-emerald-500/10'
    : color === 'amber'
    ? 'bg-amber-500/10'
    : color === 'purple'
    ? 'bg-purple-500/10'
    : 'bg-muted'

  const iconColor = accent || color === 'blue'
    ? 'text-[#008cff]'
    : color === 'emerald'
    ? 'text-emerald-500'
    : color === 'amber'
    ? 'text-amber-500'
    : color === 'purple'
    ? 'text-purple-400'
    : 'text-muted-foreground'

  return (
    <div className="rounded-xl bg-card border border-border shadow-xs p-3 sm:p-4">
      <div className="flex items-center gap-2 sm:gap-3">
        {Icon && (
          <div className={cn('flex size-10 items-center justify-center rounded-xl shrink-0', iconBg)}>
            <Icon size={20} className={iconColor} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <p className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              {displayValue}
            </p>
            {delta !== undefined && (
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 text-[11px] font-syne font-semibold',
                  isPositiveDelta ? 'text-emerald-500' : 'text-destructive'
                )}
              >
                {isPositiveDelta ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {isPositiveDelta ? '+' : ''}{delta.toFixed(1)}%
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{title}</p>
          {deltaLabel && delta !== undefined && (
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">{deltaLabel}</p>
          )}
        </div>
      </div>
    </div>
  )
}
