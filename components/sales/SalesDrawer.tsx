'use client'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

interface SalesDrawerProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function SalesDrawer({ open, onClose, title, children }: SalesDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={open => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-[420px] bg-[#0D0D0D] border-l border-[#222222] p-6 flex flex-col gap-6"
      >
        <SheetHeader>
          <SheetTitle className="font-fraunces text-xl font-bold text-[#EDE8DE]">
            {title}
          </SheetTitle>
        </SheetHeader>
        {children}
      </SheetContent>
    </Sheet>
  )
}
