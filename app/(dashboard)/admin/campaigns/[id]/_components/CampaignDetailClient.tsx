"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { AnimatePresence, motion } from "framer-motion"
import {
  Users,
  Calendar,
  BarChart3,
  CreditCard,
  Settings,
  ChevronRight,
  Instagram,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { CampaignTabBar } from "@/components/campaigns/CampaignTabBar"
import { CampaignMobileNav } from "@/components/campaigns/CampaignMobileNav"
import {
  useCampaign,
  useCampaignCreators,
  useCampaignVideos,
  useCampaignTimeseries,
} from "@/hooks/useConvexCampaign"

import { CreatorsTab } from "./CreatorsTab"
import { TimelineTab } from "./TimelineTab"
const PerformanceTab = dynamic(
  () => import("./PerformanceTab").then((m) => ({ default: m.PerformanceTab })),
  { ssr: false }
)
import { PaymentsTab } from "./PaymentsTab"

/* ------------------------------------------------------------------ */
/*  TikTok icon (lucide doesn't ship one)                              */
/* ------------------------------------------------------------------ */
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/*  Tab definitions                                                    */
/* ------------------------------------------------------------------ */
const TABS = [
  { key: "creators", label: "Creators", icon: <Users className="size-4" /> },
  { key: "timeline", label: "Timeline", icon: <Calendar className="size-4" /> },
  {
    key: "performance",
    label: "Performance",
    icon: <BarChart3 className="size-4" />,
  },
  {
    key: "payments",
    label: "Payments",
    icon: <CreditCard className="size-4" />,
  },
]

const tabVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

/* ------------------------------------------------------------------ */
/*  Skeleton placeholder                                               */
/* ------------------------------------------------------------------ */
function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      aria-hidden
    />
  )
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
interface CampaignDetailClientProps {
  campaignId: string
}

export default function CampaignDetailClient({
  campaignId,
}: CampaignDetailClientProps) {
  const campaign = useCampaign(campaignId)
  const creators = useCampaignCreators(campaignId)
  const videos = useCampaignVideos(campaignId)
  const timeseries = useCampaignTimeseries(campaignId)

  const [activeTab, setActiveTab] = useState("creators")

  // undefined = still loading from Convex; null = non-Convex ID, use mock data
  const isLoading = campaign === undefined

  /* ---- header skeleton ---- */
  if (isLoading) {
    return (
      <div className="space-y-6 pb-24 md:pb-8">
        {/* breadcrumb skeleton */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-20" />
          <ChevronRight className="size-3.5 text-muted-foreground/40" />
          <Skeleton className="h-4 w-32" />
        </div>

        {/* header skeleton */}
        <div className="flex items-center gap-4">
          <Skeleton className="size-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        {/* tab bar skeleton */}
        <Skeleton className="h-10 w-full rounded-lg" />

        {/* content skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  const name = campaign?.name ?? "Campaign"

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      {/* ---- Breadcrumb ---- */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-sm text-muted-foreground"
      >
        <span className="hover:text-foreground transition-colors cursor-pointer">
          Campaigns
        </span>
        <ChevronRight className="size-3.5" />
        <span className="text-foreground font-medium truncate max-w-[200px]">
          {name}
        </span>
      </nav>

      {/* ---- Header ---- */}
      <div className="flex items-start sm:items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3.5">
          {/* Avatar placeholder */}
          <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg shrink-0">
            {name.charAt(0).toUpperCase()}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-semibold tracking-tight">
                {name}
              </h1>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-500">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Active
              </span>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <Instagram className="size-3.5" />
              <TikTokIcon className="size-3.5" />
            </div>
          </div>
        </div>

        <button
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground hover:bg-muted/60 transition-colors"
          aria-label="Campaign settings"
        >
          <Settings className="size-4" />
          <span className="hidden sm:inline">Settings</span>
        </button>
      </div>

      {/* ---- Tab Bar ---- */}
      <CampaignTabBar
        tabs={TABS}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* ---- Tab Content ---- */}
      <div
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
      >
        {activeTab === "creators" && (
          <CreatorsTab creators={creators} />
        )}
        {activeTab === "timeline" && (
          <TimelineTab videos={videos} />
        )}
        {activeTab === "performance" && (
          <PerformanceTab
            videos={videos}
            timeseries={timeseries}
          />
        )}
        {activeTab === "payments" && (
          <PaymentsTab creators={creators} campaign={campaign} />
        )}
      </div>

      {/* ---- Mobile Bottom Nav ---- */}
      <CampaignMobileNav
        tabs={TABS}
        activeTab={activeTab}
        onChange={setActiveTab}
      />
    </div>
  )
}
