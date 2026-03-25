"use client"

import { useRef, useEffect, useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface Tab {
  key: string
  label: string
  icon?: ReactNode
  count?: number
}

interface CampaignTabBarProps {
  tabs: Tab[]
  activeTab: string
  onChange: (key: string) => void
  className?: string
}

export function CampaignTabBar({ tabs, activeTab, onChange, className }: CampaignTabBarProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map())
  const [indicator, setIndicator] = useState({ left: 0, width: 0 })

  useEffect(() => {
    const el = tabRefs.current.get(activeTab)
    if (el && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect()
      const tabRect = el.getBoundingClientRect()
      setIndicator({
        left: tabRect.left - containerRect.left,
        width: tabRect.width,
      })
    }
  }, [activeTab])

  return (
    <div className={cn("hidden md:block sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/60 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2", className)}>
      <div className="overflow-x-auto scrollbar-hide flex justify-center">
        <div
          ref={containerRef}
          role="tablist"
          aria-label="Campaign sections"
          className="relative inline-flex min-w-full rounded-lg bg-muted/50 p-1 gap-0.5"
        >
          {/* Sliding indicator */}
          <div
            aria-hidden="true"
            className="absolute top-1 bottom-1 rounded-md bg-background shadow-sm pointer-events-none"
            style={{
              left: indicator.left,
              width: indicator.width,
              transition: "left 200ms cubic-bezier(0.4, 0, 0.2, 1), width 200ms cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />

          {tabs.map((tab) => (
            <button
              key={tab.key}
              ref={(el) => {
                if (el) tabRefs.current.set(tab.key, el)
              }}
              role="tab"
              id={`tab-${tab.key}`}
              aria-selected={activeTab === tab.key}
              aria-controls={`tabpanel-${tab.key}`}
              tabIndex={activeTab === tab.key ? 0 : -1}
              onClick={() => onChange(tab.key)}
              className={cn(
                "relative z-10 shrink-0 text-sm transition-colors duration-200 px-4 py-2 rounded-md",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                activeTab === tab.key
                  ? "text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.icon && <span className="size-3.5 mr-1.5 inline-block align-middle">{tab.icon}</span>}
              {tab.label}
              {tab.count !== undefined && ` (${tab.count})`}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
