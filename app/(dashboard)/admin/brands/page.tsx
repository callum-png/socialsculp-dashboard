import { PageHeader } from '@/components/shared/PageHeader'
import { MOCK_BRANDS, MOCK_CAMPAIGNS } from '@/lib/mock-data'
import { ExternalLink } from 'lucide-react'

export default function AdminBrandsPage() {
  return (
    <div>
      <PageHeader
        title="Brands"
        description={`${MOCK_BRANDS.length} brands in your network`}
      />

      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_BRANDS.map((brand, i) => {
            const activeCampaigns = MOCK_CAMPAIGNS.filter(
              (c) => c.brandIndex === i && c.status === 'ACTIVE'
            ).length
            const totalCampaigns = MOCK_CAMPAIGNS.filter((c) => c.brandIndex === i).length

            const initials = brand.companyName
              .split(' ')
              .map((w) => w[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)

            return (
              <div
                key={brand.companyName}
                className="bg-[#111111] border border-[#222222] p-5 hover:border-[#333333] transition-colors"
              >
                {/* Header */}
                <div className="flex items-start gap-3 mb-5">
                  <div className="w-10 h-10 bg-[#1A1A1A] border border-[#222222] flex items-center justify-center shrink-0">
                    <span className="font-syne text-sm font-bold text-[#C9FF47]">{initials}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="font-syne font-bold text-[#EDE8DE] text-sm truncate">
                      {brand.companyName}
                    </div>
                    <div className="font-fraunces text-xs text-[#6B6860]">{brand.industry}</div>
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center py-2 border-b border-[#1A1A1A]">
                    <span className="text-[10px] font-syne uppercase tracking-widest text-[#6B6860]">
                      Total Campaigns
                    </span>
                    <span className="text-sm font-syne font-bold text-[#EDE8DE]">{totalCampaigns}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-[#1A1A1A]">
                    <span className="text-[10px] font-syne uppercase tracking-widest text-[#6B6860]">
                      Active
                    </span>
                    <span
                      className={`text-sm font-syne font-bold ${
                        activeCampaigns > 0 ? 'text-[#C9FF47]' : 'text-[#6B6860]'
                      }`}
                    >
                      {activeCampaigns}
                    </span>
                  </div>
                </div>

                {/* Website */}
                <a
                  href={brand.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[10px] font-syne uppercase tracking-widest text-[#6B6860] hover:text-[#C9FF47] transition-colors"
                >
                  <ExternalLink size={11} />
                  {brand.website.replace('https://', '')}
                </a>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
