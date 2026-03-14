import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { formatNumber, formatPercent } from '@/lib/utils'

interface CreatorCardProps {
  creator: {
    handle: string
    name: string
    niche: readonly string[]
    tiktokFollowers: number
    instagramFollowers: number
    tiktokEngRate: number
    location?: string
  }
  index: number
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function CreatorCard({ creator, index }: CreatorCardProps) {
  return (
    <Link
      href={`/admin/creators/${index}`}
      className="block bg-[#111111] border border-[#222222] p-5 hover:border-[#333333] transition-colors group"
    >
      {/* Header: Avatar + Name */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-[#1A1A1A] border border-[#222222] flex items-center justify-center shrink-0">
          <span className="font-syne text-sm font-bold text-[#C9FF47]">
            {getInitials(creator.name)}
          </span>
        </div>
        <div className="min-w-0">
          <div className="font-syne font-bold text-[#EDE8DE] text-sm group-hover:text-[#C9FF47] transition-colors truncate">
            {creator.handle}
          </div>
          <div className="font-fraunces text-xs text-[#6B6860] truncate">{creator.name}</div>
        </div>
      </div>

      {/* Niche tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {creator.niche.map((n) => (
          <span
            key={n}
            className="px-2 py-0.5 text-[10px] font-syne uppercase tracking-widest bg-[#1A1A1A] border border-[#222222] text-[#6B6860]"
          >
            {n}
          </span>
        ))}
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-1.5">
          {/* TikTok icon (simple text label) */}
          <span className="text-[10px] font-syne uppercase tracking-widest text-[#6B6860]">TT</span>
          <span className="text-sm font-syne font-bold text-[#EDE8DE]">
            {formatNumber(creator.tiktokFollowers)}
          </span>
        </div>
        <div className="w-px h-3 bg-[#222222]" />
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-syne uppercase tracking-widest text-[#6B6860]">IG</span>
          <span className="text-sm font-syne font-bold text-[#EDE8DE]">
            {formatNumber(creator.instagramFollowers)}
          </span>
        </div>
      </div>

      {/* Eng rate */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-syne uppercase tracking-widest text-[#6B6860]">
          Avg Eng Rate
        </span>
        <span className="text-sm font-syne font-bold text-[#C9FF47]">
          {formatPercent(creator.tiktokEngRate)}
        </span>
      </div>

      {/* Location */}
      {creator.location && (
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-[#1A1A1A]">
          <MapPin size={11} className="text-[#6B6860] shrink-0" />
          <span className="text-[11px] font-fraunces text-[#6B6860] truncate">
            {creator.location}
          </span>
        </div>
      )}
    </Link>
  )
}
