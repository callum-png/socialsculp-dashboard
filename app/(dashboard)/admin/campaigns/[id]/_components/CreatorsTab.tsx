"use client"

import { useState } from "react"
import {
  Search,
  Plus,
  ChevronRight,
  Instagram,
  Eye,
} from "lucide-react"
import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------ */
/*  TikTok icon                                                        */
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
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface Creator {
  _id?: any
  name: string
  handle?: string
  instagramHandle?: string
  tiktokHandle?: string
  instagram?: string
  tiktok?: string
  medianViews?: number
  campaignViews?: number
  campaignLikes?: number
  campaignComments?: number
  postCount?: number
  status: string
  avatarUrl?: string
  agreedFee?: number
  color?: string
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */
const MOCK_CREATORS: Creator[] = [
  {
    _id: "1",
    name: "Olivia Carter",
    instagram: "@oliviacarter",
    tiktok: "@oliviac",
    medianViews: 124000,
    campaignViews: 38200,
    status: "confirmed",
  },
  {
    _id: "2",
    name: "Marcus Chen",
    instagram: "@marcuschen",
    tiktok: "@marcusc",
    medianViews: 89000,
    campaignViews: 21500,
    status: "confirmed",
  },
  {
    _id: "3",
    name: "Priya Sharma",
    instagram: "@priyasharma",
    medianViews: 210000,
    campaignViews: 0,
    status: "invited",
  },
  {
    _id: "4",
    name: "Jake Morrison",
    tiktok: "@jakemorrison",
    medianViews: 56000,
    campaignViews: 0,
    status: "invited",
  },
  {
    _id: "5",
    name: "Nia Williams",
    instagram: "@niawilliams",
    tiktok: "@niaw",
    medianViews: 175000,
    campaignViews: 52100,
    status: "confirmed",
  },
  {
    _id: "6",
    name: "Tom Bradley",
    instagram: "@tombradley",
    medianViews: 42000,
    campaignViews: 0,
    status: "declined",
  },
]

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString()
}

/* ------------------------------------------------------------------ */
/*  Status badge                                                       */
/* ------------------------------------------------------------------ */
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    invited: "bg-secondary text-secondary-foreground",
    confirmed: "bg-emerald-500/10 text-emerald-500",
    declined: "bg-destructive/10 text-destructive",
    completed: "bg-blue-500/10 text-blue-500",
  }
  const label = status.charAt(0).toUpperCase() + status.slice(1)

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        map[status] ?? "bg-secondary text-secondary-foreground"
      )}
    >
      {label}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
interface CreatorsTabProps {
  creators: Creator[] | null | undefined
}

export function CreatorsTab({ creators }: CreatorsTabProps) {
  const [search, setSearch] = useState("")

  const data = creators ?? MOCK_CREATORS

  const filtered = data.filter((c) =>
    [c.name, c.instagram, c.tiktok]
      .filter(Boolean)
      .some((v) => v!.toLowerCase().includes(search.toLowerCase()))
  )

  const totalCreators = data.length
  const confirmed = data.filter((c) => c.status === "confirmed").length
  const invited = data.filter((c) => c.status === "invited").length
  const totalCampaignViews = data.reduce(
    (sum, c) => sum + (c.campaignViews ?? 0),
    0
  )

  const stats = [
    { label: "Total Creators", value: totalCreators },
    { label: "Confirmed", value: confirmed },
    { label: "Invited", value: invited },
    { label: "Campaign Views", value: formatNumber(totalCampaignViews) },
  ]

  return (
    <div className="space-y-5">
      {/* ---- Stat cards ---- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-border bg-card p-4 space-y-1"
          >
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="stat-number text-2xl font-semibold tabular-nums">
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* ---- Controls ---- */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search creators..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-card pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
          <Plus className="size-4" />
          Add Creator
        </button>
      </div>

      {/* ---- Creator list ---- */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            No creators match your search.
          </div>
        )}

        {filtered.map((creator, idx) => (
          <div
            key={creator._id ?? idx}
            className="group flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 hover:border-primary/30 transition-colors cursor-pointer"
          >
            {/* Avatar */}
            <div className="size-10 rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-muted-foreground shrink-0">
              {creator.name
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 space-y-0.5">
              <p className="text-sm font-medium truncate">{creator.name}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {creator.instagram && (
                  <span className="inline-flex items-center gap-1">
                    <Instagram className="size-3" />
                    {creator.instagram}
                  </span>
                )}
                {creator.tiktok && (
                  <span className="inline-flex items-center gap-1">
                    <TikTokIcon className="size-3" />
                    {creator.tiktok}
                  </span>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="hidden sm:flex items-center gap-6 text-xs text-muted-foreground">
              <div className="text-right space-y-0.5">
                <p className="text-[10px] uppercase tracking-wide">
                  Median Views
                </p>
                <p className="stat-number text-sm font-medium text-foreground tabular-nums">
                  {formatNumber(creator.medianViews ?? 0)}
                </p>
              </div>
              <div className="text-right space-y-0.5">
                <p className="text-[10px] uppercase tracking-wide">
                  Campaign Views
                </p>
                <p className="stat-number text-sm font-medium text-foreground tabular-nums inline-flex items-center gap-1">
                  <Eye className="size-3" />
                  {formatNumber(creator.campaignViews ?? 0)}
                </p>
              </div>
            </div>

            {/* Status badge */}
            <StatusBadge status={creator.status} />

            {/* Chevron */}
            <ChevronRight className="size-4 text-muted-foreground/40 group-hover:text-foreground transition-colors" />
          </div>
        ))}
      </div>
    </div>
  )
}
