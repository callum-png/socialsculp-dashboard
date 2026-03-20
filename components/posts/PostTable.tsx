import { ExternalLink, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import { formatNumber, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { Post } from './PostsTab'

interface Props {
  posts: Post[]
  sortBy: string
  onSortChange: (col: string) => void
}

function engagementColor(rate: number): string {
  if (rate > 7) return 'text-[#4ADE80]'
  if (rate >= 5) return 'text-[#FFB547]'
  return 'text-[#6B6860]'
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

const SORT_COLS: Record<string, string> = {
  views: 'views',
  engagement: 'engagement',
  latest: 'latest',
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
        isActive ? 'text-[#EDE8DE]' : 'text-[#6B6860]',
        'hover:text-[#EDE8DE] transition-colors',
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
    <div className="bg-[#111111] border border-[#222222] overflow-x-auto">
      <table className="w-full text-sm font-syne">
        <thead>
          <tr className="border-b border-[#222222]">
            <th className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-[#6B6860] font-bold">
              Creator
            </th>
            <th className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-[#6B6860] font-bold">
              Platform
            </th>
            <SortHeader label="Views" colKey="views" sortBy={sortBy} onSortChange={onSortChange} />
            <th className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-[#6B6860] font-bold">
              Likes
            </th>
            <SortHeader label="Eng%" colKey="engagement" sortBy={sortBy} onSortChange={onSortChange} />
            <SortHeader label="Posted" colKey="latest" sortBy={sortBy} onSortChange={onSortChange} />
            <th className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-[#6B6860] font-bold">
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
                className="border-b border-[#1A1A1A] hover:bg-[#141414] transition-colors"
              >
                <td className="px-4 py-3 text-[#EDE8DE] font-medium">
                  <span className="text-[#6B6860] text-xs">@</span>
                  {handle}
                </td>
                <td className="px-4 py-3">
                  <span className={cn('inline-flex px-1.5 py-0.5 text-[9px] font-syne font-bold uppercase tracking-widest', platformBadgeStyle(post.platform))}>
                    {platformLabel(post.platform)}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#EDE8DE] text-xs">
                  {formatNumber(post.views ?? 0)}
                </td>
                <td className="px-4 py-3 text-[#6B6860] text-xs">
                  {formatNumber(post.likes ?? 0)}
                </td>
                <td className={cn('px-4 py-3 text-xs font-bold', engagementColor(engRate))}>
                  {engRate.toFixed(1)}%
                </td>
                <td className="px-4 py-3 text-[#6B6860] text-xs">
                  {post.postedAt ? formatDate(post.postedAt) : '—'}
                </td>
                <td className="px-4 py-3">
                  <a
                    href={post.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest border border-[#222222] text-[#6B6860] hover:border-[#008cff] hover:text-[#008cff] transition-colors"
                  >
                    View <ExternalLink size={9} />
                  </a>
                </td>
              </tr>
            )
          })}

          {posts.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-12 text-center text-[#3A3A3A] text-xs uppercase tracking-widest font-syne">
                No posts
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
