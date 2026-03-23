import { ExternalLink, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import { cn, formatNumber, formatDate } from '@/lib/utils'
import type { Post } from './PostsTab'

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
  if (platform === 'TIKTOK') return 'bg-violet-50 text-violet-600 border border-violet-200'
  if (platform === 'INSTAGRAM') return 'bg-[#3a0020] text-[#ff7ab8] border border-[#880040]'
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
                  <span className={cn('inline-flex px-1.5 py-0.5 text-[9px] font-syne font-bold uppercase tracking-widest', platformBadgeStyle(post.platform))}>
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
