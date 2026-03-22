'use client'

import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { PanelLeft, Settings } from 'lucide-react'
import Link from 'next/link'

interface TopbarProps {
  onMenuClick: () => void
  role?: string
}

function getPageTitle(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length === 0) return 'Dashboard'

  if (segments[0] === 'admin') {
    if (segments.length === 1) return 'Overview'
    const map: Record<string, string> = {
      campaigns: 'Campaigns',
      creators: 'Creators',
      deals: 'Deals',
      brands: 'Brands',
      crm: 'CRM',
      analytics: 'Analytics',
      decks: 'Decks',
      portals: 'Portals',
      tasks: 'Tasks',
      settings: 'Settings',
    }
    return map[segments[1]] ?? 'Admin'
  }

  if (segments[0] === 'brand') {
    if (segments.length === 1) return 'Dashboard'
    const map: Record<string, string> = {
      campaigns: 'Campaigns',
      creators: 'Creators',
      reports: 'Reports',
    }
    return map[segments[1]] ?? 'Brand'
  }

  if (segments[0] === 'creator') {
    if (segments.length === 1) return 'Dashboard'
    const map: Record<string, string> = {
      campaigns: 'My Campaigns',
      deals: 'My Deals',
      analytics: 'Analytics',
      profile: 'Profile',
    }
    return map[segments[1]] ?? 'Creator'
  }

  if (segments[0] === 'agent') {
    const map: Record<string, string> = { crm: 'My CRM' }
    return map[segments[1]] ?? 'Agent'
  }

  return 'Dashboard'
}

export function Topbar({ onMenuClick, role }: TopbarProps) {
  const pathname = usePathname()
  const pageTitle = getPageTitle(pathname)

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border/40 bg-background/80 backdrop-blur-sm px-4 lg:px-5">
      {/* Left: sidebar toggle + separator + page title */}
      <div className="flex items-center gap-2">
        <button
          onClick={onMenuClick}
          className="flex items-center justify-center size-7 -ml-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
          aria-label="Toggle navigation"
        >
          <PanelLeft size={18} />
        </button>

        <div className="w-px h-4 bg-border mr-1" />

        <span className="text-sm font-semibold text-foreground">{pageTitle}</span>
      </div>

      {/* Right: settings (admin only) + user */}
      <div className="flex items-center gap-1">
        {role === 'ADMIN' && (
          <Link
            href="/admin/settings"
            className="flex items-center justify-center size-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
            aria-label="Settings"
          >
            <Settings size={16} />
          </Link>
        )}
        <div className="ml-1">
          <UserButton
            appearance={{
              elements: {
                avatarBox: 'w-8 h-8',
                userButtonPopoverCard: 'bg-card border border-border',
                userButtonPopoverActionButton: 'text-foreground hover:bg-muted',
                userButtonPopoverActionButtonText: 'text-foreground font-syne',
                userButtonPopoverFooter: 'hidden',
              },
            }}
          />
        </div>
      </div>
    </header>
  )
}
