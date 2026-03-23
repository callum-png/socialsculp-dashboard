'use client'

import { useState, useEffect } from 'react'
import { Plus, ExternalLink } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { NewBrandModal, type NewBrandResult } from '@/components/brands/NewBrandModal'

interface Brand {
  id: string
  companyName: string
  industry: string | null
  website: string | null
  campaigns: { id: string; status: string }[]
}

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetch('/api/brands').then(r => r.json()).then(data => { setBrands(data); setLoading(false) })
  }, [])

  function handleCreated(brand: NewBrandResult) {
    setBrands(prev => [...prev, { ...brand, campaigns: [] }])
  }

  return (
    <div>
      <PageHeader
        eyebrow="Admin"
        title="Brands"
        description={`${brands.length} brand${brands.length === 1 ? '' : 's'} in your network`}
      >
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#008cff] text-white text-xs font-syne font-bold uppercase tracking-widest hover:bg-[#0077dd] transition-colors"
        >
          <Plus size={13} /> New Brand
        </button>
      </PageHeader>

      <div className="p-6">
        {loading ? (
          <div className="text-center py-16 text-foreground font-syne text-xs uppercase tracking-widest">Loading…</div>
        ) : brands.length === 0 ? (
          <div className="bg-card border border-border px-5 py-16 text-center">
            <p className="text-foreground font-syne text-xs uppercase tracking-widest mb-4">No brands yet</p>
            <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-[#008cff] text-white text-xs font-syne font-bold uppercase tracking-widest hover:bg-[#0077dd] transition-colors">
              <Plus size={13} /> Add First Brand
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {brands.map((brand) => {
              const activeCampaigns = brand.campaigns.filter(c => c.status === 'ACTIVE').length
              const initials = brand.companyName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
              return (
                <div key={brand.id} className="bg-card border border-border p-5 hover:border-[#333333] transition-colors">
                  <div className="flex items-start gap-3 mb-5">
                    <div className="w-10 h-10 bg-background border border-border flex items-center justify-center shrink-0">
                      <span className="font-syne text-sm font-bold text-[#008cff]">{initials}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="font-syne font-bold text-foreground text-sm truncate">{brand.companyName}</div>
                      {brand.industry && <div className="font-syne text-xs text-muted-foreground">{brand.industry}</div>}
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-[10px] font-syne uppercase tracking-widest text-muted-foreground">Total Campaigns</span>
                      <span className="text-sm font-syne font-bold text-foreground">{brand.campaigns.length}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-[10px] font-syne uppercase tracking-widest text-muted-foreground">Active</span>
                      <span className={`text-sm font-syne font-bold ${activeCampaigns > 0 ? 'text-[#008cff]' : 'text-muted-foreground'}`}>{activeCampaigns}</span>
                    </div>
                  </div>
                  {brand.website && (
                    <a href={brand.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[10px] font-syne uppercase tracking-widest text-muted-foreground hover:text-[#008cff] transition-colors">
                      <ExternalLink size={11} /> {brand.website.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showModal && <NewBrandModal onClose={() => setShowModal(false)} onCreated={handleCreated} />}
    </div>
  )
}
