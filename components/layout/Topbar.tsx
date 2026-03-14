'use client'

import { UserButton } from '@clerk/nextjs'
import { Menu } from 'lucide-react'

interface TopbarProps {
  onMenuClick: () => void
}

export function Topbar({ onMenuClick }: TopbarProps) {
  return (
    <header className="h-14 bg-[#111111] border-b border-[#222222] flex items-center justify-between px-4">
      <button
        onClick={onMenuClick}
        className="flex items-center justify-center w-9 h-9 text-[#6B6860] hover:text-[#EDE8DE] transition-colors"
        aria-label="Open navigation"
      >
        <Menu size={20} />
      </button>

      <div className="flex items-baseline gap-0.5">
        <span className="font-syne text-lg font-bold text-[#EDE8DE] tracking-tight">S23</span>
        <span className="font-syne text-lg font-bold text-[#C9FF47]">.</span>
      </div>

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
    </header>
  )
}
