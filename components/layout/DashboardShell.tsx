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
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <Sidebar role={role} />

      {/* Mobile Nav Sheet */}
      <MobileNav
        role={role}
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />

      {/* Right column: topbar + content */}
      <div className="flex-1 flex flex-col md:ml-60 min-h-screen">
        {/* Topbar — shown on both mobile and desktop */}
        <div className="sticky top-0 z-40">
          <Topbar onMenuClick={() => setMobileNavOpen(true)} role={role} />
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
