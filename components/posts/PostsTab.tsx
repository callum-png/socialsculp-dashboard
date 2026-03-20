'use client'

import { useEffect, useState } from 'react'
import { LayoutGrid, List, VideoIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EmptyState } from '@/components/shared/EmptyState'
import { PostGrid } from './PostGrid'
import { PostTable } from './PostTable'

// ─── Post type (matches GET /api/posts include clause) ────────────────────────

export type Post = {
  id: string
  liveUrl: string
  platform: string
  postedAt: string
  views: number
  likes: number
  comments: number
  shares: number
  engagementRate: number
  submittedBy: {
    id: string
    name: string | null
  } | null
  deliverable: {
    id: string
    platform: string
    contentType: string
    deal: {
      id: string
      creator: {
        id: string
        handle: string
      }
    }
  } | null
}

// ─── State types ──────────────────────────────────────────────────────────────

type ViewMode = 'grid' | 'table'
type PlatformFilter = 'all' | 'TIKTOK' | 'INSTAGRAM'
type SortBy = 'latest' | 'views' | 'engagement'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sortPosts(posts: Post[], sortBy: SortBy): Post[] {
  return [...posts].sort((a, b) => {
    if (sortBy === 'views') return (b.views ?? 0) - (a.views ?? 0)
    if (sortBy === 'engagement') return (b.engagementRate ?? 0) - (a.engagementRate ?? 0)
    // latest: sort by postedAt descending
    return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
  })
}

// ─── Skeleton grid ────────────────────────────────────────────────────────────

function PostGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-[#111111] border border-[#222222] overflow-hidden">
          <div className="h-36 animate-pulse bg-[#1A1A1A]" />
          <div className="p-3 space-y-2">
            <div className="h-3 w-24 animate-pulse bg-[#1A1A1A]" />
            <div className="h-2.5 w-16 animate-pulse bg-[#1A1A1A]" />
            <div className="h-2 w-12 animate-pulse bg-[#1A1A1A]" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Component ───────────────────────────────────────────────────────────────

interface Props {
  campaignId: string
}

export function PostsTab({ campaignId }: Props) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('all')
  const [sortBy, setSortBy] = useState<SortBy>('latest')

  // Fetch on mount
  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch(`/api/posts?campaignId=${campaignId}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body?.error ?? `HTTP ${res.status}`)
        }
        return res.json() as Promise<Post[]>
      })
      .then((data) => {
        setPosts(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message ?? 'Failed to load posts')
        setLoading(false)
      })
  }, [campaignId])

  // Client-side filter + sort
  const tiktokCount = posts.filter((p) => p.platform === 'TIKTOK').length
  const instagramCount = posts.filter((p) => p.platform === 'INSTAGRAM').length

  const filtered = platformFilter === 'all'
    ? posts
    : posts.filter((p) => p.platform === platformFilter)

  const sorted = sortPosts(filtered, sortBy)

  // Handle table sort column clicks — map column keys to SortBy values
  function handleTableSort(col: string) {
    if (col === 'views') setSortBy('views')
    else if (col === 'engagement') setSortBy('engagement')
    else if (col === 'latest') setSortBy('latest')
  }

  return (
    <div className="space-y-4">
      {/* Controls bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Filter pills */}
        <div className="flex items-center gap-1.5">
          {(
            [
              { key: 'all', label: `All (${posts.length})` },
              { key: 'TIKTOK', label: `TikTok (${tiktokCount})` },
              { key: 'INSTAGRAM', label: `Instagram (${instagramCount})` },
            ] as { key: PlatformFilter; label: string }[]
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPlatformFilter(key)}
              className={cn(
                'px-3 py-1.5 text-[10px] font-syne font-bold uppercase tracking-widest border transition-colors',
                platformFilter === key
                  ? 'border-[#008cff] text-[#008cff] bg-[#001a33]'
                  : 'border-[#222222] text-[#6B6860] bg-transparent hover:border-[#333333] hover:text-[#EDE8DE]'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Right: sort + toggle */}
        <div className="flex items-center gap-2">
          {/* Sort dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="bg-[#111111] border border-[#222222] text-[#6B6860] text-[11px] font-syne px-2.5 py-1.5 focus:outline-none focus:border-[#008cff] hover:border-[#333333] transition-colors cursor-pointer"
          >
            <option value="latest">Latest</option>
            <option value="views">Most Views</option>
            <option value="engagement">Best Engagement</option>
          </select>

          {/* View toggle */}
          <div className="flex items-center border border-[#222222]">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-1.5 transition-colors',
                viewMode === 'grid'
                  ? 'bg-[#1A1A1A] text-[#EDE8DE]'
                  : 'text-[#6B6860] hover:text-[#EDE8DE]'
              )}
              title="Grid view"
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                'p-1.5 transition-colors',
                viewMode === 'table'
                  ? 'bg-[#1A1A1A] text-[#EDE8DE]'
                  : 'text-[#6B6860] hover:text-[#EDE8DE]'
              )}
              title="Table view"
            >
              <List size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <PostGridSkeleton />
      ) : error ? (
        <div className="py-10 text-center text-[#FF4747] text-sm font-syne">{error}</div>
      ) : sorted.length === 0 ? (
        <EmptyState
          icon={VideoIcon}
          title="No posts live yet"
          description="Posts will appear here once creators go live with their content."
        />
      ) : viewMode === 'grid' ? (
        <PostGrid posts={sorted} />
      ) : (
        <PostTable posts={sorted} sortBy={sortBy} onSortChange={handleTableSort} />
      )}
    </div>
  )
}
