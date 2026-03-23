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
  eyebrow?: string
}

export function PageHeader({
  title,
  description,
  children,
  breadcrumb,
  className,
  eyebrow,
}: PageHeaderProps) {
  return (
    <section className={cn('bg-background px-6 py-5', className)}>
      {breadcrumb && breadcrumb.length > 0 && (
        <nav className="flex items-center gap-1 mb-3">
          {breadcrumb.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight size={12} className="text-muted-foreground/50" />}
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="text-xs font-syne text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-xs font-syne text-muted-foreground uppercase tracking-widest">
                  {crumb.label}
                </span>
              )}
            </span>
          ))}
        </nav>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {eyebrow && (
            <p className="font-syne text-[9px] font-bold uppercase tracking-[0.12em] text-accent mb-1">
              {eyebrow}
            </p>
          )}
          <h1 className="font-fraunces text-2xl font-bold leading-none text-foreground">{title}</h1>
          {description && (
            <p className="font-fraunces text-sm italic text-muted mt-1">{description}</p>
          )}
        </div>
        {children && (
          <div className="flex items-center gap-2 shrink-0">{children}</div>
        )}
      </div>
    </section>
  )
}
