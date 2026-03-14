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
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

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
}

const ROLE_NAV: Record<UserRole, { label: string; href: string; icon: keyof typeof ICON_MAP }[]> = {
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

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Admin',
  CREATOR: 'Creator',
  BRAND: 'Brand',
}

interface SidebarProps {
  role: UserRole
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const navItems = ROLE_NAV[role]

  return (
    <TooltipProvider>
      <aside className="fixed left-0 top-0 h-full w-60 md:w-60 bg-[#111111] border-r border-[#222222] flex flex-col z-30 hidden md:flex">
        {/* Logo */}
        <div className="px-5 py-6 border-b border-[#222222]">
          <Link href="/" className="flex flex-col gap-0.5">
            <div className="flex items-baseline gap-0.5">
              <span className="font-syne text-xl font-bold text-[#EDE8DE] tracking-tight">
                S23
              </span>
              <span className="font-syne text-xl font-bold text-[#C9FF47]">.</span>
            </div>
            <span className="text-[10px] font-syne uppercase tracking-[0.2em] text-[#6B6860]">
              SocialSculp
            </span>
          </Link>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <ul className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = ICON_MAP[item.icon]
              const isActive =
                item.href === '/admin' || item.href === '/creator' || item.href === '/brand'
                  ? pathname === item.href
                  : pathname.startsWith(item.href)

              return (
                <li key={item.href}>
                  <Tooltip>
                    <TooltipTrigger>
                      <Link
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 text-sm font-syne font-medium transition-all relative group',
                          isActive
                            ? 'text-[#C9FF47] bg-[#1A1A1A]'
                            : 'text-[#6B6860] hover:text-[#EDE8DE] hover:bg-[#1A1A1A]'
                        )}
                      >
                        {isActive && (
                          <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#C9FF47]" />
                        )}
                        <Icon
                          size={16}
                          className={cn(
                            'shrink-0',
                            isActive ? 'text-[#C9FF47]' : 'text-[#6B6860] group-hover:text-[#EDE8DE]'
                          )}
                        />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="md:hidden">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Bottom: UserButton + Role Badge */}
        <div className="border-t border-[#222222] px-4 py-4">
          <div className="flex items-center gap-3">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'w-8 h-8',
                  userButtonPopoverCard: 'bg-[#111111] border border-[#222222]',
                  userButtonPopoverActionButton: 'text-[#EDE8DE] hover:bg-[#1A1A1A]',
                  userButtonPopoverActionButtonText: 'text-[#EDE8DE] font-syne',
                  userButtonPopoverFooter: 'hidden',
                },
              }}
            />
            <div className="flex-1 min-w-0">
              <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-syne font-bold uppercase tracking-widest border bg-[#0D1F00] text-[#C9FF47] border-[#2A4400]">
                {ROLE_LABELS[role]}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  )
}
