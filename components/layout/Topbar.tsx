'use client'

import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { Menu } from 'lucide-react'

interface TopbarProps {
  onMenuClick: () => void
}

function getPageTitle(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length === 0) return 'Dashboard'

  // Admin routes
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

  // Brand routes
  if (segments[0] === 'brand') {
    if (segments.length === 1) return 'Dashboard'
    const map: Record<string, string> = {
      campaigns: 'Campaigns',
      creators: 'Creators',
      reports: 'Reports',
    }
    return map[segments[1]] ?? 'Brand'
  }

  // Creator routes
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

  // Agent routes
  if (segments[0] === 'agent') {
    const map: Record<string, string> = { crm: 'My CRM' }
    return map[segments[1]] ?? 'Agent'
  }

  return 'Dashboard'
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const pathname = usePathname()
  const pageTitle = getPageTitle(pathname)

  return (
    <header className="h-14 bg-card border-b border-border flex items-center justify-between px-4">
      {/* Left: hamburger (mobile) + page title (desktop) */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="flex items-center justify-center w-9 h-9 text-muted-foreground hover:text-foreground transition-colors md:hidden"
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>

        {/* Mobile: logo */}
        <div className="flex items-baseline gap-0.5 md:hidden">
          <span className="font-syne text-lg font-bold text-foreground tracking-tight">SocialSculp</span>
          <span className="font-syne text-lg font-bold text-[#008cff]">.</span>
        </div>

        {/* Desktop: sidebar toggle + page title */}
        <button
          onClick={onMenuClick}
          className="hidden md:flex items-center justify-center w-9 h-9 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Toggle navigation"
        >
          <Menu size={18} />
        </button>
        <span className="hidden md:block text-sm font-syne font-semibold text-foreground">
          {pageTitle}
        </span>
      </div>

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
    </header>
  )
}
