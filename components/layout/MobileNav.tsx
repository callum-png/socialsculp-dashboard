'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
} from 'lucide-react'
import { Sheet, SheetContent } from '@/components/ui/sheet'
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
}

const ROLE_NAV: Record<UserRole, { label: string; href: string; icon: keyof typeof ICON_MAP }[]> = {
  AGENT: [
    { label: 'My CRM', href: '/agent/crm', icon: 'ContactRound' },
  ],
  ADMIN: [
    { label: 'Overview', href: '/admin', icon: 'LayoutDashboard' },
    { label: 'Campaigns', href: '/admin/campaigns', icon: 'Megaphone' },
    { label: 'Creators', href: '/admin/creators', icon: 'Users' },
    { label: 'Deals', href: '/admin/deals', icon: 'Handshake' },
    { label: 'Brands', href: '/admin/brands', icon: 'Building2' },
    { label: 'Analytics', href: '/admin/analytics', icon: 'BarChart3' },
    { label: 'Settings', href: '/admin/settings', icon: 'Settings' },
  ],
  CREATOR: [
    { label: 'Dashboard', href: '/creator', icon: 'LayoutDashboard' },
    { label: 'My Campaigns', href: '/creator/campaigns', icon: 'Megaphone' },
    { label: 'My Deals', href: '/creator/deals', icon: 'Handshake' },
    { label: 'Analytics', href: '/creator/analytics', icon: 'BarChart3' },
    { label: 'Profile', href: '/creator/profile', icon: 'User' },
  ],
  BRAND: [
    { label: 'Dashboard', href: '/brand', icon: 'LayoutDashboard' },
    { label: 'Campaigns', href: '/brand/campaigns', icon: 'Megaphone' },
    { label: 'Creators', href: '/brand/creators', icon: 'Users' },
    { label: 'Reports', href: '/brand/reports', icon: 'FileText' },
  ],
}

interface MobileNavProps {
  role: UserRole
  open: boolean
  onClose: () => void
}

export function MobileNav({ role, open, onClose }: MobileNavProps) {
  const pathname = usePathname()
  const navItems = ROLE_NAV[role]

  return (
    <Sheet open={open} onOpenChange={(val) => !val && onClose()}>
      <SheetContent
        side="left"
        className="w-72 bg-[#111111] border-r border-[#222222] p-0"
      >
        <div className="px-5 py-6 border-b border-[#222222]">
          <div className="flex items-baseline gap-0.5">
            <span className="font-syne text-xl font-bold text-[#EDE8DE] tracking-tight">SocialSculp</span>
            <span className="font-syne text-xl font-bold text-[#008cff]">.</span>
          </div>
          <span className="text-[10px] font-syne uppercase tracking-[0.2em] text-[#6B6860]">
            Campaign Intelligence
          </span>
        </div>

        <nav className="px-3 py-4">
          <ul className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = ICON_MAP[item.icon]
              const isActive =
                item.href === '/admin' || item.href === '/creator' || item.href === '/brand'
                  ? pathname === item.href
                  : pathname.startsWith(item.href)

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-3 px-3 py-3 text-sm font-syne font-medium transition-all relative',
                      isActive
                        ? 'text-[#008cff] bg-[#1A1A1A]'
                        : 'text-[#6B6860] hover:text-[#EDE8DE] hover:bg-[#1A1A1A]'
                    )}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#008cff]" />
                    )}
                    <Icon
                      size={16}
                      className={cn(
                        'shrink-0',
                        isActive ? 'text-[#008cff]' : 'text-[#6B6860]'
                      )}
                    />
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
