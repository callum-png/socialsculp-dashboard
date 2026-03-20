import { ExternalLink, Play, Image as ImageIcon } from 'lucide-react'
import { cn, formatNumber, formatDate } from '@/lib/utils'
import type { Post } from './PostsTab'

interface Props {
  posts: Post[]
}

function engagementColor(rate: number): string {
  if (rate > 7) return 'text-[#4ADE80]'
  if (rate >= 5) return 'text-[#FFB547]'
  return 'text-[#6B6860]'
}

function platformGradient(platform: string): string {
  if (platform === 'TIKTOK') return 'from-[#1a0030] to-[#4a0080]'
  if (platform === 'INSTAGRAM') return 'from-[#3a0020] to-[#880040]'
  return 'from-[#001a33] to-[#003366]'
}

function platformBadgeStyle(platform: string): string {
  if (platform === 'TIKTOK') return 'bg-[#1a0030] text-[#c47aff] border border-[#4a0080]'
  if (platform === 'INSTAGRAM') return 'bg-[#3a0020] text-[#ff7ab8] border border-[#880040]'
  return 'bg-[#001a33] text-[#008cff] border border-[#003366]'
}

function platformLabel(platform: string): string {
  if (platform === 'TIKTOK') return 'TikTok'
  if (platform === 'INSTAGRAM') return 'Instagram'
  return platform
}

export function PostGrid({ posts }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
      {posts.map((post) => {
        const handle = post.deliverable?.deal?.creator?.handle ?? post.submittedBy?.name ?? '—'
        const engRate = post.engagementRate ?? 0

        return (
          <div
            key={post.id}
            className="bg-[#111111] border border-[#222222] overflow-hidden flex flex-col hover:border-[#333333] transition-colors"
          >
            {/* Thumbnail */}
            <div className={cn('relative h-36 bg-gradient-to-br flex items-center justify-center', platformGradient(post.platform))}>
              {/* "Live" = published on platform — not a live stream indicator */}
              {/* LIVE badge */}
              <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-syne font-bold uppercase tracking-widest bg-[#0A1F0A] text-[#4ADE80] border border-[#1A4A1A]">
                <span className="w-1.5 h-1.5 bg-[#4ADE80] rounded-full animate-pulse" />
                Live
              </span>

              {/* Platform badge */}
              <span className={cn('absolute top-2 right-2 px-1.5 py-0.5 text-[9px] font-syne font-bold uppercase tracking-widest', platformBadgeStyle(post.platform))}>
                {platformLabel(post.platform)}
              </span>

              {/* Play / Image icon */}
              {post.platform === 'TIKTOK' || post.platform === 'INSTAGRAM' ? (
                <Play size={28} className="text-white/30" />
              ) : (
                <ImageIcon size={28} className="text-white/30" />
              )}
            </div>

            {/* Content */}
            <div className="p-3 flex flex-col gap-1.5 flex-1">
              <div className="flex items-start justify-between gap-1">
                <span className="text-[#EDE8DE] font-syne font-bold text-xs truncate">@{handle}</span>
                <a
                  href={post.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-[#6B6860] hover:text-[#008cff] transition-colors"
                >
                  <ExternalLink size={12} />
                </a>
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#6B6860]">{formatNumber(post.views ?? 0)} views</span>
                <span className={cn('font-syne font-bold', engagementColor(engRate))}>
                  {engRate.toFixed(1)}%
                </span>
              </div>

              <div className="text-[10px] text-[#3A3A3A] font-syne uppercase tracking-wider">
                {post.postedAt ? formatDate(post.postedAt) : '—'}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
