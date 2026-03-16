import { type LucideIcon, Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
  className?: string
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-6 text-center',
        className
      )}
    >
      <div className="mb-4 flex items-center justify-center w-14 h-14 bg-[#1A1A1A] border border-[#222222]">
        <Icon size={24} className="text-[#6B6860]" />
      </div>
      <h3 className="text-base font-syne font-bold text-[#EDE8DE] mb-1">{title}</h3>
      {description && (
        <p className="text-sm font-fraunces text-[#6B6860] max-w-xs mb-6">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 text-sm font-syne font-bold bg-[#008cff] text-[#090909] hover:bg-[#0077dd] transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
