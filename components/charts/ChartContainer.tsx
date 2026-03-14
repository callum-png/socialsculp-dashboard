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
    <div className={cn('bg-[#111111] border border-[#222222]', className)}>
      <div className="px-5 py-4 border-b border-[#222222]">
        <h3 className="text-sm font-syne font-bold text-[#EDE8DE]">{title}</h3>
        {description && (
          <p className="mt-0.5 text-xs font-fraunces text-[#6B6860]">{description}</p>
        )}
      </div>
      <div className="p-5">
        {loading ? (
          <div className="h-[280px] flex items-center justify-center">
            <div className="animate-pulse bg-[#1A1A1A] w-full h-full" />
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  )
}
