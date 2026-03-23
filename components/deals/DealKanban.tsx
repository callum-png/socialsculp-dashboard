'use client'

import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { DealKanbanCard, type KanbanDeal } from './DealKanbanCard'
import { NewDealModal, type DealCampaignOption, type DealCreatorOption } from './NewDealModal'
import { DEAL_STAGE_LABELS, DEAL_STAGE_COLORS } from '@/lib/constants'
import type { DealStage } from '@/types'

const KANBAN_STAGES: DealStage[] = [
  'OUTREACH',
  'NEGOTIATING',
  'SIGNED',
  'LIVE',
  'COMPLETED',
]

interface Props {
  initialDeals: KanbanDeal[]
  campaigns: DealCampaignOption[]
  creators: DealCreatorOption[]
}

export function DealKanban({ initialDeals, campaigns, creators }: Props) {
  const [deals, setDeals] = useState<KanbanDeal[]>(initialDeals)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [showNewDeal, setShowNewDeal] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const activeDeal = activeId ? deals.find((d) => d.id === activeId) : null

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id))
  }

  async function persistStageChange(dealId: string, newStage: DealStage) {
    try {
      await fetch(`/api/deals/${dealId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      })
    } catch (err) {
      console.error('[DealKanban] Failed to persist stage change:', err)
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const draggedId = String(active.id)
    const overId = String(over.id)
    const currentDeal = deals.find((d) => d.id === draggedId)

    // Dropped over a column header (stage id)
    if (KANBAN_STAGES.includes(overId as DealStage)) {
      const newStage = overId as DealStage
      if (currentDeal?.stage === newStage) return
      setDeals((prev) =>
        prev.map((d) => (d.id === draggedId ? { ...d, stage: newStage } : d))
      )
      persistStageChange(draggedId, newStage)
      return
    }

    // Dropped over another card — move to that card's stage
    const overDeal = deals.find((d) => d.id === overId)
    if (overDeal && overDeal.stage !== currentDeal?.stage) {
      setDeals((prev) =>
        prev.map((d) => (d.id === draggedId ? { ...d, stage: overDeal.stage } : d))
      )
      persistStageChange(draggedId, overDeal.stage)
    }
  }

  return (
    <>
      {/* New Deal button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowNewDeal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-bg text-xs font-syne font-bold uppercase tracking-widest hover:bg-accent/90 transition-colors"
        >
          <Plus size={13} />
          New Deal
        </button>
      </div>

    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-4 min-h-[500px]">
        {KANBAN_STAGES.map((stage) => {
          const columnDeals = deals.filter((d) => d.stage === stage)

          return (
            <div
              key={stage}
              className="flex flex-col flex-shrink-0 w-64 bg-background border border-border rounded-md"
            >
              {/* Column header — also a drop target */}
              <div
                id={stage}
                className="flex items-center justify-between px-3.5 py-3 border-b border-border"
              >
                <span
                  className={`inline-flex items-center px-2 py-0.5 text-[10px] font-syne font-bold uppercase tracking-widest ${DEAL_STAGE_COLORS[stage]}`}
                >
                  {DEAL_STAGE_LABELS[stage]}
                </span>
                <span className="text-[11px] font-syne font-bold text-muted bg-surface-2 border border-border px-1.5 py-0.5">
                  {columnDeals.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex-1 p-2 flex flex-col gap-2 overflow-y-auto">
                <SortableContext
                  items={columnDeals.map((d) => d.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {columnDeals.map((deal) => (
                    <DealKanbanCard key={deal.id} deal={deal} />
                  ))}
                </SortableContext>

                {columnDeals.length === 0 && (
                  <div className="flex-1 flex items-center justify-center py-8">
                    <span className="text-[11px] font-syne text-muted/40 uppercase tracking-widest">
                      Drop here
                    </span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <DragOverlay>
        {activeDeal && (
          <div className="rotate-2 opacity-90 shadow-xl">
            <DealKanbanCard deal={activeDeal} />
          </div>
        )}
      </DragOverlay>
    </DndContext>

      {showNewDeal && (
        <NewDealModal
          campaigns={campaigns}
          creators={creators}
          onClose={() => setShowNewDeal(false)}
          onCreated={(deal) => setDeals((prev) => [deal, ...prev])}
        />
      )}
    </>
  )
}
