"use client"

import { Calendar, Eye, Instagram } from "lucide-react"
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
interface Video {
  _id?: any
  _creationTime?: number
  platform?: string
  liveUrl?: string
  creatorId?: any
  creatorHandle?: string
  title?: string
  thumbnailUrl?: string
  thumbnailStorageId?: any
  views?: number
  likes?: number
  comments?: number
  shares?: number
  engagementRate?: number
  postedAt?: string
  publishedAt?: string
  lastSyncedAt?: string
  campaignId?: any
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString()
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

/* ------------------------------------------------------------------ */
/*  Platform badge                                                     */
/* ------------------------------------------------------------------ */
function PlatformBadge({
  platform,
}: {
  platform: string
}) {
  if (platform === "instagram") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-pink-500/10 px-2 py-0.5 text-[10px] font-medium text-pink-500">
        <Instagram className="size-3" />
        Instagram
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-foreground/10 px-2 py-0.5 text-[10px] font-medium text-foreground">
      <TikTokIcon className="size-3" />
      TikTok
    </span>
  )
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
interface TimelineTabProps {
  videos: Video[] | null | undefined
}

export function TimelineTab({ videos }: TimelineTabProps) {
  const entries = (videos ?? [])
    .filter((v) => v.publishedAt)
    .sort(
      (a, b) =>
        new Date(b.publishedAt!).getTime() -
        new Date(a.publishedAt!).getTime()
    )

  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center space-y-3">
        <Calendar className="mx-auto size-10 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          No timeline events yet
        </p>
        <p className="text-xs text-muted-foreground/60">
          Posts will appear here once creators publish content.
        </p>
      </div>
    )
  }

  return (
    <div className="relative space-y-0">
      {/* vertical line */}
      <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border" />

      {entries.map((entry, idx) => (
        <div
          key={entry._id ?? idx}
          className="relative flex items-start gap-4 py-3 group"
        >
          {/* dot */}
          <div className="relative z-10 mt-1.5 size-2.5 rounded-full bg-primary ring-4 ring-background shrink-0 ml-[13px]" />

          {/* content card */}
          <div className="flex-1 rounded-lg border border-border bg-card p-3 space-y-1.5 group-hover:border-primary/30 transition-colors">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground">
                {formatDate(entry.publishedAt!)}
              </span>
              {entry.platform && (
                <PlatformBadge platform={entry.platform} />
              )}
            </div>

            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium">
                {entry.creatorHandle ?? "Unknown"}
              </p>
              {entry.views !== undefined && (
                <span className="stat-number inline-flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
                  <Eye className="size-3" />
                  {formatNumber(entry.views)}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
