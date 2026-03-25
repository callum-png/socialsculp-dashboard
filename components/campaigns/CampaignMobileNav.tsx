"use client"

import { type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface Tab {
  key: string
  label: string
  icon?: ReactNode
}

interface CampaignMobileNavProps {
  tabs: Tab[]
  activeTab: string
  onChange: (key: string) => void
}

export function CampaignMobileNav({ tabs, activeTab, onChange }: CampaignMobileNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur-md border-t border-border pb-[env(safe-area-inset-bottom)]">
      <div role="tablist" aria-label="Campaign sections" className="flex items-center justify-around h-14">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              role="tab"
              id={`mobile-tab-${tab.key}`}
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.key}`}
              aria-label={tab.label}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onChange(tab.key)}
              className="relative flex flex-col items-center justify-center flex-1 h-full gap-0.5"
            >
              <span className={cn(
                "size-5",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}>
                {tab.icon}
              </span>
              <span className={cn(
                "text-[10px]",
                isActive ? "font-semibold text-foreground" : "font-normal text-muted-foreground"
              )}>
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary" />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
