import { cn } from '@/lib/utils'

interface ChartContainerProps {
  title: string
  description?: string
  children: React.ReactNode
  loading?: boolean
  className?: string
}

export function ChartContainer({
  title,
  description,
  children,
  loading,
  className,
}: ChartContainerProps) {
  return (
    <div className={cn('rounded-xl bg-card border border-border shadow-xs', className)}>
      <div className="flex items-center justify-between flex-wrap px-5 min-h-14 gap-2.5 border-b border-border">
        <div>
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      <div className="p-5">
        {loading ? (
          <div className="h-[280px] flex items-center justify-center">
            <div className="animate-pulse bg-muted w-full h-full rounded-lg" />
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  )
}
