'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { CreatorCard } from './CreatorCard'
import { NewCreatorModal, type NewCreatorResult } from './NewCreatorModal'

interface Creator {
  id: string
  handle: string
  name: string
  avatarUrl?: string | null
  niche: string[]
  tiktokFollowers: number | null
  instagramFollowers: number | null
  tiktokEngRate: number | null
  location?: string | null
}

interface Props {
  initialCreators: Creator[]
}

export function CreatorRoster({ initialCreators }: Props) {
  const [creators, setCreators] = useState<Creator[]>(initialCreators)
  const [showModal, setShowModal] = useState(false)

  function handleCreated(c: NewCreatorResult) {
    setCreators((prev) => [c, ...prev])
  }

  return (
    <>
      <div className="p-6 space-y-5">
        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-syne uppercase tracking-widest text-muted-foreground mr-2">
              Filter:
            </span>
            <button className="px-3 py-1.5 text-[10px] font-syne font-bold uppercase tracking-widest bg-accent text-white">
              All
            </button>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white text-xs font-syne font-bold uppercase tracking-widest hover:bg-accent/90 transition-colors"
          >
            <Plus size={13} />
            New Creator
          </button>
        </div>

        {/* Grid */}
        {creators.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl px-5 py-16 text-center">
            <p className="text-muted-foreground font-syne text-xs uppercase">
              No creators yet
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {creators.map((creator) => (
              <CreatorCard key={creator.id} creator={creator} />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <NewCreatorModal
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}
    </>
  )
}
