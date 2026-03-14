import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface PageHeaderProps {
  title: string
  description?: string
  children?: React.ReactNode
  breadcrumb?: BreadcrumbItem[]
  className?: string
}

export function PageHeader({
  title,
  description,
  children,
  breadcrumb,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'border-b border-[#222222] px-6 py-6 bg-[#090909]',
        className
      )}
    >
      {breadcrumb && breadcrumb.length > 0 && (
        <nav className="flex items-center gap-1 mb-3">
          {breadcrumb.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight size={12} className="text-[#6B6860]" />}
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="text-xs font-syne text-[#6B6860] hover:text-[#EDE8DE] transition-colors uppercase tracking-widest"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-xs font-syne text-[#6B6860] uppercase tracking-widest">
                  {crumb.label}
                </span>
              )}
            </span>
          ))}
        </nav>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-syne font-bold text-[#EDE8DE] tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm font-fraunces text-[#6B6860]">{description}</p>
          )}
        </div>

        {children && (
          <div className="flex items-center gap-2 shrink-0">{children}</div>
        )}
      </div>
    </div>
  )
}
