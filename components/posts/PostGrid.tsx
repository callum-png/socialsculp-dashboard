'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ExternalLink } from 'lucide-react'
import { cn, formatNumber } from '@/lib/utils'
import type { Post } from './PostsTab'

// ─── Platform SVG Icons ───────────────────────────────────────────────────────

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.94a8.18 8.18 0 0 0 4.82 1.55V7.04a4.85 4.85 0 0 1-1.05-.35z" />
    </svg>
  )
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(handle: string): string {
  return handle.replace('@', '').slice(0, 2).toUpperCase()
}

const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-violet-100 text-violet-700',
  'bg-pink-100 text-pink-700',
  'bg-amber-100 text-amber-700',
  'bg-emerald-100 text-emerald-700',
  'bg-cyan-100 text-cyan-700',
]

function avatarColor(handle: string): string {
  let hash = 0
  for (const c of handle) hash = (hash * 31 + c.charCodeAt(0)) % AVATAR_COLORS.length
  return AVATAR_COLORS[hash]
}

function engagementColor(rate: number): string {
  if (rate > 7) return 'text-emerald-600'
  if (rate >= 5) return 'text-amber-600'
  return 'text-muted-foreground'
}

// ─── VideoCard ────────────────────────────────────────────────────────────────

function VideoCard({ post }: { post: Post }) {
  const [oembedThumb, setOembedThumb] = useState<string | null>(null)
  const [thumbError, setThumbError] = useState(false)
  const [avatarError, setAvatarError] = useState(false)

  const handle = post.deliverable?.deal?.creator?.handle ?? post.submittedBy?.name ?? '—'
  const creatorAvatarUrl = post.deliverable?.deal?.creator?.user?.avatarUrl ?? null
  const engRate = post.engagementRate ?? 0

  // Only fetch oembed if no stored thumbnailUrl
  useEffect(() => {
    if (!post.thumbnailUrl && post.platform === 'TIKTOK' && post.liveUrl) {
      fetch(`/api/oembed?url=${encodeURIComponent(post.liveUrl)}`)
        .then((r) => r.json())
        .then((d: { thumbnailUrl?: string | null }) => {
          if (d.thumbnailUrl) setOembedThumb(d.thumbnailUrl)
        })
        .catch(() => {})
    }
  }, [post.liveUrl, post.platform, post.thumbnailUrl])

  const resolvedThumb = post.thumbnailUrl ?? oembedThumb
  const hasThumbnail = !!resolvedThumb && !thumbError

  return (
    <div className="group bg-card border border-border overflow-hidden flex flex-col hover:border-[#008cff]/40 hover:shadow-sm transition-all duration-200 rounded-xl">
      {/* ── Thumbnail ── */}
      <div className="relative aspect-[9/16] overflow-hidden">
        {hasThumbnail ? (
          <Image
            src={resolvedThumb!}
            alt={`Post by @${handle}`}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            onError={() => setThumbError(true)}
          />
        ) : (
          <div
            className={cn(
              'absolute inset-0 flex items-center justify-center',
              post.platform === 'TIKTOK'
                ? 'bg-[#010101]'
                : post.platform === 'INSTAGRAM'
                ? 'bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045]'
                : 'bg-[#008cff]'
            )}
          >
            {post.platform === 'TIKTOK' ? (
              <TikTokIcon className="w-12 h-12 text-white opacity-25" />
            ) : post.platform === 'INSTAGRAM' ? (
              <InstagramIcon className="w-12 h-12 text-white opacity-30" />
            ) : null}
          </div>
        )}

        {/* Bottom gradient */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

        {/* Platform badge – top right */}
        <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm">
          {post.platform === 'TIKTOK' ? (
            <TikTokIcon className="w-3 h-3 text-white" />
          ) : (
            <InstagramIcon className="w-3 h-3 text-white" />
          )}
          <span className="text-[9px] font-syne font-bold text-white uppercase tracking-wide">
            {post.platform === 'TIKTOK' ? 'TikTok' : 'Instagram'}
          </span>
        </div>

        {/* Views – bottom left */}
        <span className="absolute bottom-2 left-2.5 text-[11px] font-syne font-semibold text-white/90">
          {formatNumber(post.views ?? 0)} views
        </span>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <a
            href={post.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white text-[#111827] text-[11px] font-syne font-bold uppercase tracking-wider rounded hover:bg-[#008cff] hover:text-white transition-colors"
          >
            Open <ExternalLink size={10} />
          </a>
        </div>
      </div>

      {/* ── Card body ── */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        {/* Creator avatar + handle */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 border border-border">
            {creatorAvatarUrl && !avatarError ? (
              <Image
                src={creatorAvatarUrl}
                alt={handle}
                width={28}
                height={28}
                className="object-cover w-full h-full"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <div
                className={cn(
                  'w-full h-full flex items-center justify-center text-[9px] font-syne font-bold',
                  avatarColor(handle)
                )}
              >
                {getInitials(handle)}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="text-foreground font-syne font-semibold text-xs truncate">
              @{handle}
            </div>
            <div className="text-[9px] text-muted-foreground font-syne">
              {post.deliverable?.contentType?.replace('_', ' ') ?? 'Reel'}
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-1 pt-2 border-t border-border/50">
          <div className="text-center">
            <div className="text-[11px] font-syne font-bold text-foreground leading-none">
              {formatNumber(post.likes ?? 0)}
            </div>
            <div className="text-[9px] text-muted-foreground uppercase tracking-wider mt-0.5">
              Likes
            </div>
          </div>
          <div className="text-center">
            <div className="text-[11px] font-syne font-bold text-foreground leading-none">
              {formatNumber(post.comments ?? 0)}
            </div>
            <div className="text-[9px] text-muted-foreground uppercase tracking-wider mt-0.5">
              Cmts
            </div>
          </div>
          <div className="text-center">
            <div
              className={cn(
                'text-[11px] font-syne font-bold leading-none',
                engagementColor(engRate)
              )}
            >
              {engRate.toFixed(1)}%
            </div>
            <div className="text-[9px] text-muted-foreground uppercase tracking-wider mt-0.5">
              Eng
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── PostGrid ─────────────────────────────────────────────────────────────────

interface Props {
  posts: Post[]
}

export function PostGrid({ posts }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {posts.map((post) => (
        <VideoCard key={post.id} post={post} />
      ))}
    </div>
  )
}
