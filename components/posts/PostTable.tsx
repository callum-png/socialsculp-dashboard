import { ExternalLink, ArrowUp, ArrowUpDown } from 'lucide-react'
import { cn, formatNumber, formatDate } from '@/lib/utils'
import type { Post } from './PostsTab'

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

interface Props {
  posts: Post[]
  sortBy: string
  onSortChange: (col: string) => void
}

function engagementColor(rate: number): string {
  if (rate > 7) return 'text-emerald-600'
  if (rate >= 5) return 'text-amber-600'
  return 'text-muted-foreground'
}

function platformBadgeStyle(platform: string): string {
  if (platform === 'TIKTOK') return 'bg-neutral-950 text-white border border-neutral-800'
  if (platform === 'INSTAGRAM') return 'bg-gradient-to-r from-violet-50 to-pink-50 text-pink-600 border border-pink-200'
  return 'bg-blue-50 text-[#008cff] border border-blue-200'
}

function platformLabel(platform: string): string {
  if (platform === 'TIKTOK') return 'TikTok'
  if (platform === 'INSTAGRAM') return 'Instagram'
  return platform
}

interface SortHeaderProps {
  label: string
  colKey: string
  sortBy: string
  onSortChange: (col: string) => void
  className?: string
}

function SortHeader({ label, colKey, sortBy, onSortChange, className }: SortHeaderProps) {
  const isActive = sortBy === colKey
  return (
    <th
      className={cn(
        'px-4 py-3 text-left text-[10px] uppercase tracking-widest font-syne font-bold cursor-pointer select-none',
        isActive ? 'text-foreground' : 'text-muted-foreground',
        'hover:text-foreground transition-colors',
        className
      )}
      onClick={() => onSortChange(colKey)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {isActive ? (
          <ArrowUp size={10} className="text-[#008cff]" />
        ) : (
          <ArrowUpDown size={10} className="opacity-40" />
        )}
      </span>
    </th>
  )
}

export function PostTable({ posts, sortBy, onSortChange }: Props) {
  return (
    <div className="bg-card border border-border overflow-x-auto">
      <table className="w-full text-sm font-syne">
        <thead>
          <tr className="border-b border-border">
            <th className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
              Creator
            </th>
            <th className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
              Platform
            </th>
            <SortHeader label="Views" colKey="views" sortBy={sortBy} onSortChange={onSortChange} />
            <th className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
              Likes
            </th>
            <SortHeader label="Eng%" colKey="engagement" sortBy={sortBy} onSortChange={onSortChange} />
            <SortHeader label="Posted" colKey="latest" sortBy={sortBy} onSortChange={onSortChange} />
            <th className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
              Link
            </th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => {
            const handle = post.deliverable?.deal?.creator?.handle ?? post.submittedBy?.name ?? '—'
            const engRate = post.engagementRate ?? 0

            return (
              <tr
                key={post.id}
                className="border-b border-border hover:bg-muted transition-colors"
              >
                <td className="px-4 py-3 text-foreground font-medium">
                  <span className="text-muted-foreground text-xs">@</span>
                  {handle}
                </td>
                <td className="px-4 py-3">
                  <span className={cn('inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-syne font-bold uppercase tracking-widest', platformBadgeStyle(post.platform))}>
                    {post.platform === 'TIKTOK' ? (
                      <TikTokIcon className="w-2.5 h-2.5" />
                    ) : post.platform === 'INSTAGRAM' ? (
                      <InstagramIcon className="w-2.5 h-2.5" />
                    ) : null}
                    {platformLabel(post.platform)}
                  </span>
                </td>
                <td className="px-4 py-3 text-foreground text-xs">
                  {formatNumber(post.views ?? 0)}
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {formatNumber(post.likes ?? 0)}
                </td>
                <td className={cn('px-4 py-3 text-xs font-bold', engagementColor(engRate))}>
                  {engRate.toFixed(1)}%
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {post.postedAt ? formatDate(post.postedAt) : '—'}
                </td>
                <td className="px-4 py-3">
                  <a
                    href={post.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest border border-border text-muted-foreground hover:border-[#008cff] hover:text-[#008cff] transition-colors"
                  >
                    View <ExternalLink size={9} />
                  </a>
                </td>
              </tr>
            )
          })}

          {posts.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-12 text-center text-foreground text-xs uppercase tracking-widest font-syne">
                No posts
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
