'use client'

import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { MobileNav } from './MobileNav'
import type { UserRole } from '@/types'

interface DashboardShellProps {
  role: UserRole
  children: React.ReactNode
}

export function DashboardShell({ role, children }: DashboardShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-[#090909]">
      {/* Desktop Sidebar */}
      <Sidebar role={role} />

      {/* Mobile Topbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40">
        <Topbar onMenuClick={() => setMobileNavOpen(true)} />
      </div>

      {/* Mobile Nav Sheet */}
      <MobileNav
        role={role}
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />

      {/* Main content */}
      <main className="flex-1 md:ml-60 overflow-y-auto min-h-screen pt-14 md:pt-0">
        {children}
      </main>
    </div>
  )
}
