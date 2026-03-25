"use client"

import { useState, useMemo } from "react"
import {
  Search,
  Filter,
  Eye,
  Heart,
  MessageCircle,
  ExternalLink,
  UserPlus,
  RefreshCw,
  Instagram,
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"
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
interface TimeseriesPoint {
  _id?: any
  _creationTime?: number
  campaignId?: any
  date: string
  views?: number
  likes?: number
  comments?: number
  shares?: number
}

interface Video {
  _id?: any
  title?: string
  platform?: string
  liveUrl?: string
  creatorId?: any
  creatorName?: string
  creatorHandle?: string
  thumbnailUrl?: string
  thumbnailStorageId?: any
  views?: number
  likes?: number
  comments?: number
  shares?: number
  engagement?: number
  engagementRate?: number
  postedAt?: string
  lastSyncedAt?: string
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */
function generateMockTimeseries(days: number): TimeseriesPoint[] {
  const points: TimeseriesPoint[] = []
  const now = Date.now()
  for (let i = days; i >= 0; i--) {
    const d = new Date(now - i * 86_400_000)
    points.push({
      date: d.toISOString().slice(0, 10),
      views: Math.floor(800 + Math.random() * 3200),
      likes: Math.floor(40 + Math.random() * 260),
      comments: Math.floor(5 + Math.random() * 55),
    })
  }
  return points
}

const MOCK_VIDEOS: Video[] = Array.from({ length: 8 }).map((_, i) => ({
  _id: `v${i}`,
  title: `Campaign Video ${i + 1}`,
  platform: i % 2 === 0 ? "instagram" : "tiktok",
  creatorName: ["Olivia Carter", "Marcus Chen", "Priya Sharma", "Nia Williams"][
    i % 4
  ],
  creatorHandle: ["@oliviacarter", "@marcuschen", "@priyasharma", "@niaw"][
    i % 4
  ],
  views: Math.floor(5000 + Math.random() * 45000),
  likes: Math.floor(200 + Math.random() * 3800),
  comments: Math.floor(10 + Math.random() * 290),
  engagement: parseFloat((1.5 + Math.random() * 6.5).toFixed(1)),
}))

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString()
}

function formatAxisDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
}

/* ------------------------------------------------------------------ */
/*  Date range options                                                 */
/* ------------------------------------------------------------------ */
const DATE_RANGES = [
  { key: "7d", label: "7 Days", days: 7 },
  { key: "30d", label: "30 Days", days: 30 },
  { key: "90d", label: "90 Days", days: 90 },
  { key: "all", label: "All", days: 365 },
] as const

type DateRangeKey = (typeof DATE_RANGES)[number]["key"]

/* ------------------------------------------------------------------ */
/*  Metric options                                                     */
/* ------------------------------------------------------------------ */
const METRICS = [
  { key: "views", label: "Views", color: "#4F6BF6" },
  { key: "likes", label: "Likes", color: "#34C759" },
  { key: "comments", label: "Comments", color: "#9B6BF5" },
] as const

type MetricKey = (typeof METRICS)[number]["key"]

/* ------------------------------------------------------------------ */
/*  Custom tooltip                                                     */
/* ------------------------------------------------------------------ */
function ChartTooltip({
  active,
  payload,
  label,
  metric,
}: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
  metric: MetricKey
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg text-xs">
      <p className="text-muted-foreground mb-0.5">{label}</p>
      <p className="stat-number font-semibold tabular-nums">
        {formatNumber(payload[0].value)} {metric}
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
interface PerformanceTabProps {
  videos: Video[] | undefined
  timeseries: TimeseriesPoint[] | undefined
}

export function PerformanceTab({ videos, timeseries }: PerformanceTabProps) {
  const [dateRange, setDateRange] = useState<DateRangeKey>("30d")
  const [metric, setMetric] = useState<MetricKey>("views")
  const [videoSearch, setVideoSearch] = useState("")

  const rangeDays =
    DATE_RANGES.find((r) => r.key === dateRange)?.days ?? 30

  const chartData = useMemo(() => {
    const raw = timeseries ?? generateMockTimeseries(rangeDays)
    return raw.slice(-rangeDays)
  }, [timeseries, rangeDays])

  const videoData = videos ?? MOCK_VIDEOS

  const filteredVideos = videoData.filter((v) =>
    [v.title, v.creatorName, v.creatorHandle]
      .filter(Boolean)
      .some((s) => s!.toLowerCase().includes(videoSearch.toLowerCase()))
  )

  /* totals */
  const totalViews = chartData.reduce((s, p) => s + (p.views ?? 0), 0)
  const totalLikes = chartData.reduce((s, p) => s + (p.likes ?? 0), 0)
  const totalComments = chartData.reduce((s, p) => s + (p.comments ?? 0), 0)
  const avgEngagement =
    totalViews > 0
      ? (((totalLikes + totalComments) / totalViews) * 100).toFixed(1)
      : "0.0"

  const activeMetric = METRICS.find((m) => m.key === metric)!

  const stats = [
    { label: "Total Views", value: formatNumber(totalViews), icon: Eye },
    { label: "Total Likes", value: formatNumber(totalLikes), icon: Heart },
    {
      label: "Total Comments",
      value: formatNumber(totalComments),
      icon: MessageCircle,
    },
    { label: "Avg Engagement", value: `${avgEngagement}%`, icon: Eye },
  ]

  return (
    <div className="space-y-5">
      {/* ---- Date range pills ---- */}
      <div className="flex items-center gap-1 rounded-lg bg-muted/50 p-1 w-fit">
        {DATE_RANGES.map((r) => (
          <button
            key={r.key}
            onClick={() => setDateRange(r.key)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              dateRange === r.key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* ---- Stat cards ---- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-border bg-card p-4 space-y-1"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-red-500" />
              </span>
            </div>
            <p className="stat-number text-2xl font-semibold tabular-nums">
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* ---- Metric toggle + Chart ---- */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* metric toggle */}
        <div className="grid grid-cols-3 border-b border-border">
          {METRICS.map((m) => (
            <button
              key={m.key}
              onClick={() => setMetric(m.key)}
              className={cn(
                "relative flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors",
                metric === m.key
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: m.color }}
              />
              {m.label}
              {metric === m.key && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ backgroundColor: m.color }}
                />
              )}
            </button>
          ))}
        </div>

        {/* chart */}
        <div className="p-4">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient
                  id={`gradient-${metric}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor={activeMetric.color}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="100%"
                    stopColor={activeMetric.color}
                    stopOpacity={0.02}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                strokeOpacity={0.5}
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tickFormatter={formatAxisDate}
                tick={{ fontSize: 11 }}
                stroke="hsl(var(--muted-foreground))"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tickFormatter={(v: number) => formatNumber(v)}
                tick={{ fontSize: 11 }}
                stroke="hsl(var(--muted-foreground))"
                tickLine={false}
                axisLine={false}
                width={48}
              />
              <Tooltip
                content={
                  <ChartTooltip metric={metric} />
                }
              />
              <Area
                type="monotone"
                dataKey={metric}
                stroke={activeMetric.color}
                strokeWidth={2}
                fill={`url(#gradient-${metric})`}
                dot={false}
                activeDot={{
                  r: 4,
                  fill: activeMetric.color,
                  stroke: "hsl(var(--background))",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ---- Video grid controls ---- */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search videos..."
            value={videoSearch}
            onChange={(e) => setVideoSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-card pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground hover:bg-muted/60 transition-colors">
          <Filter className="size-4" />
          Filter
        </button>
      </div>

      {/* ---- Video grid ---- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredVideos.map((video, idx) => (
          <VideoCard key={video._id ?? idx} video={video} />
        ))}

        {filteredVideos.length === 0 && (
          <div className="col-span-full rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            No videos match your search.
          </div>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Video card                                                         */
/* ------------------------------------------------------------------ */
function VideoCard({ video }: { video: Video }) {
  return (
    <div className="group rounded-xl border border-border bg-card overflow-hidden hover:border-primary/30 transition-colors">
      {/* thumbnail area */}
      <div className="relative aspect-video bg-muted">
        {/* platform badge */}
        {video.platform && (
          <span
            className={cn(
              "absolute top-2 right-2 z-10 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium backdrop-blur-sm",
              video.platform === "instagram"
                ? "bg-pink-500/20 text-pink-300"
                : "bg-white/20 text-white"
            )}
          >
            {video.platform === "instagram" ? (
              <Instagram className="size-3" />
            ) : (
              <TikTokIcon className="size-3" />
            )}
            {video.platform === "instagram" ? "IG" : "TT"}
          </span>
        )}

        {/* hover overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            className="rounded-lg bg-white/20 backdrop-blur-sm p-2 hover:bg-white/30 transition-colors"
            aria-label="Open video"
          >
            <ExternalLink className="size-4 text-white" />
          </button>
          <button
            className="rounded-lg bg-white/20 backdrop-blur-sm p-2 hover:bg-white/30 transition-colors"
            aria-label="Assign creator"
          >
            <UserPlus className="size-4 text-white" />
          </button>
          <button
            className="rounded-lg bg-white/20 backdrop-blur-sm p-2 hover:bg-white/30 transition-colors"
            aria-label="Refresh stats"
          >
            <RefreshCw className="size-4 text-white" />
          </button>
        </div>
      </div>

      {/* info */}
      <div className="p-3 space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold text-muted-foreground shrink-0">
            {(video.creatorName ?? "?")
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {video.creatorName ?? "Unknown"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="space-y-0.5">
            <p className="text-muted-foreground">Views</p>
            <p className="stat-number font-medium tabular-nums">
              {formatNumber(video.views ?? 0)}
            </p>
          </div>
          <div className="space-y-0.5">
            <p className="text-muted-foreground">Engagement</p>
            <p className="stat-number font-medium tabular-nums">
              {video.engagement ?? 0}%
            </p>
          </div>
          <div className="space-y-0.5">
            <p className="text-muted-foreground">Likes</p>
            <p className="stat-number font-medium tabular-nums">
              {formatNumber(video.likes ?? 0)}
            </p>
          </div>
          <div className="space-y-0.5">
            <p className="text-muted-foreground">Comments</p>
            <p className="stat-number font-medium tabular-nums">
              {formatNumber(video.comments ?? 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
