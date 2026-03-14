import { PageHeader } from '@/components/shared/PageHeader'
import { CreatorCard } from '@/components/creators/CreatorCard'
import { MOCK_CREATORS } from '@/lib/mock-data'
import { NICHES } from '@/lib/constants'

export default function AdminCreatorsPage() {
  return (
    <div>
      <PageHeader
        title="Creator Roster"
        description={`${MOCK_CREATORS.length} creators in your network`}
      />

      <div className="p-6 space-y-5">
        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-syne uppercase tracking-widest text-[#6B6860] mr-2">
            Filter:
          </span>
          <button className="px-3 py-1.5 text-[10px] font-syne font-bold uppercase tracking-widest bg-[#C9FF47] text-[#090909]">
            All
          </button>
          {NICHES.slice(0, 7).map((niche) => (
            <button
              key={niche}
              className="px-3 py-1.5 text-[10px] font-syne font-bold uppercase tracking-widest border border-[#222222] text-[#6B6860] hover:border-[#C9FF47] hover:text-[#C9FF47] transition-colors"
            >
              {niche}
            </button>
          ))}
        </div>

        {/* Creator grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_CREATORS.map((creator, i) => (
            <CreatorCard key={creator.handle} creator={creator} index={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
