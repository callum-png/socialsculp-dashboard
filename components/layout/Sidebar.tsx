'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import {
  LayoutDashboard,
  Megaphone,
  Users,
  Handshake,
  Building2,
  BarChart3,
  Settings,
  User,
  FileText,
  ContactRound,
  LayoutTemplate,
  Eye,
  CheckSquare,
  UserCheck,
  PhoneCall,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types'

const ICON_MAP = {
  LayoutDashboard,
  Megaphone,
  Users,
  Handshake,
  Building2,
  BarChart3,
  Settings,
  User,
  FileText,
  ContactRound,
  LayoutTemplate,
  Eye,
  CheckSquare,
  UserCheck,
  PhoneCall,
}

type NavItem = { label: string; href: string; icon: keyof typeof ICON_MAP }
type NavGroup = { label: string; items: NavItem[] }

const ROLE_NAV: Record<UserRole, NavGroup[]> = {
  ADMIN: [
    {
      label: 'Overview',
      items: [
        { label: 'Overview', href: '/admin', icon: 'LayoutDashboard' },
        { label: 'Analytics', href: '/admin/analytics', icon: 'BarChart3' },
      ],
    },
    {
      label: 'Management',
      items: [
        { label: 'Campaigns', href: '/admin/campaigns', icon: 'Megaphone' },
        { label: 'Creators', href: '/admin/creators', icon: 'Users' },
        { label: 'Brands', href: '/admin/brands', icon: 'Building2' },
        { label: 'Deals', href: '/admin/deals', icon: 'Handshake' },
      ],
    },
    {
      label: 'Operations',
      items: [
        { label: 'CRM', href: '/admin/crm', icon: 'ContactRound' },
        { label: 'Sales', href: '/admin/sales', icon: 'PhoneCall' },
        { label: 'Decks', href: '/admin/decks', icon: 'LayoutTemplate' },
        { label: 'Portals', href: '/admin/portals', icon: 'Eye' },
        { label: 'Tasks', href: '/admin/tasks', icon: 'CheckSquare' },
        { label: 'Users', href: '/admin/users', icon: 'UserCheck' },
        { label: 'Settings', href: '/admin/settings', icon: 'Settings' },
      ],
    },
  ],
  AGENT: [
    {
      label: 'Overview',
      items: [{ label: 'My CRM', href: '/agent/crm', icon: 'ContactRound' }],
    },
  ],
  CREATOR: [
    {
      label: 'Overview',
      items: [
        { label: 'Dashboard', href: '/creator', icon: 'LayoutDashboard' },
        { label: 'Analytics', href: '/creator/analytics', icon: 'BarChart3' },
      ],
    },
    {
      label: 'My Work',
      items: [
        { label: 'My Campaigns', href: '/creator/campaigns', icon: 'Megaphone' },
        { label: 'My Deals', href: '/creator/deals', icon: 'Handshake' },
        { label: 'Profile', href: '/creator/profile', icon: 'User' },
      ],
    },
  ],
  BRAND: [
    {
      label: 'Overview',
      items: [
        { label: 'Dashboard', href: '/brand', icon: 'LayoutDashboard' },
      ],
    },
    {
      label: 'Campaigns',
      items: [
        { label: 'Campaigns', href: '/brand/campaigns', icon: 'Megaphone' },
        { label: 'Creators', href: '/brand/creators', icon: 'Users' },
        { label: 'Reports', href: '/brand/reports', icon: 'FileText' },
      ],
    },
  ],
}

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Admin',
  AGENT: 'Agent',
  CREATOR: 'Creator',
  BRAND: 'Brand',
}

interface SidebarProps {
  role: UserRole
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const groups = ROLE_NAV[role]

  function isActive(href: string) {
    const roots = ['/admin', '/creator', '/brand']
    return roots.includes(href) ? pathname === href : pathname.startsWith(href)
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-card border-r border-border flex flex-col z-30 hidden md:flex">
      {/* Logo */}
      <div className="px-4 py-3 border-b border-border">
        <Link href="/" className="flex items-center gap-2 px-2 py-2.5 rounded-md hover:bg-muted transition-colors">
          <div className="flex items-baseline gap-0.5">
            <span className="font-syne text-lg font-bold text-foreground tracking-tight">
              SocialSculp
            </span>
            <span className="font-syne text-lg font-bold text-[#008cff]">.</span>
          </div>
        </Link>
      </div>

      {/* Nav Groups */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto space-y-4">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="px-2 mb-1 text-[11px] font-semibold text-muted-foreground uppercase">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = ICON_MAP[item.icon]
                const active = isActive(item.href)
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-2.5 px-2.5 h-10 text-sm font-medium rounded-md transition-colors duration-150',
                        active
                          ? 'bg-muted text-[#008cff]'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      <Icon
                        size={18}
                        className={cn(
                          'shrink-0',
                          active ? 'text-[#008cff]' : 'text-muted-foreground'
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer: user + role */}
      <div className="border-t border-border p-2">
        <div className="flex items-center gap-3 px-2 py-2.5 rounded-md hover:bg-muted transition-colors cursor-default">
          <UserButton
            appearance={{
              elements: {
                avatarBox: 'w-8 h-8 rounded-lg',
                userButtonPopoverCard: 'bg-card border border-border',
                userButtonPopoverActionButton: 'text-foreground hover:bg-muted',
                userButtonPopoverActionButtonText: 'text-foreground font-syne',
                userButtonPopoverFooter: 'hidden',
              },
            }}
          />
          <div className="flex-1 min-w-0">
            <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-syne font-bold uppercase tracking-widest border bg-[#eff6ff] text-[#008cff] border-[#bfdbfe] rounded-sm">
              {ROLE_LABELS[role]}
            </span>
          </div>
        </div>
      </div>
    </aside>
  )
}
