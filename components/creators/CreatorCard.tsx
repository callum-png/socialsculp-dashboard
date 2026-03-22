import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { formatNumber, formatPercent } from '@/lib/utils'

interface CreatorCardProps {
  creator: {
    id: string
    handle: string
    name: string
    niche: string[]
    tiktokFollowers: number | null
    instagramFollowers: number | null
    tiktokEngRate: number | null
    location?: string | null
  }
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function CreatorCard({ creator }: CreatorCardProps) {
  return (
    <Link
      href={`/admin/creators/${creator.id}`}
      className="block bg-surface border border-border rounded-xl p-5 hover:border-[#333333] transition-colors group"
    >
      {/* Header: Avatar + Name */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-surface-2 border border-border rounded-md flex items-center justify-center shrink-0">
          <span className="font-syne text-sm font-bold text-accent">
            {getInitials(creator.name)}
          </span>
        </div>
        <div className="min-w-0">
          <div className="font-syne font-bold text-text text-sm group-hover:text-accent transition-colors truncate">
            {creator.handle}
          </div>
          <div className="font-fraunces text-xs text-muted truncate">{creator.name}</div>
        </div>
      </div>

      {/* Niche tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {creator.niche.map((n) => (
          <span
            key={n}
            className="px-2 py-0.5 text-[10px] font-syne uppercase tracking-widest bg-surface-2 border border-border text-muted"
          >
            {n}
          </span>
        ))}
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-syne uppercase tracking-widest text-muted">TT</span>
          <span className="text-sm font-syne font-bold text-text">
            {creator.tiktokFollowers ? formatNumber(creator.tiktokFollowers) : '—'}
          </span>
        </div>
        <div className="w-px h-3 bg-border" />
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-syne uppercase tracking-widest text-muted">IG</span>
          <span className="text-sm font-syne font-bold text-text">
            {creator.instagramFollowers ? formatNumber(creator.instagramFollowers) : '—'}
          </span>
        </div>
      </div>

      {/* Eng rate */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-syne uppercase tracking-widest text-muted">
          Avg Eng Rate
        </span>
        <span className="text-sm font-syne font-bold text-accent">
          {creator.tiktokEngRate ? formatPercent(creator.tiktokEngRate) : '—'}
        </span>
      </div>

      {/* Location */}
      {creator.location && (
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-surface-2">
          <MapPin size={11} className="text-muted shrink-0" />
          <span className="text-[11px] font-fraunces text-muted truncate">
            {creator.location}
          </span>
        </div>
      )}
    </Link>
  )
}
