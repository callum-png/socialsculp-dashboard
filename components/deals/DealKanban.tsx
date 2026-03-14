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
import { DealKanbanCard, type KanbanDeal } from './DealKanbanCard'
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
}

export function DealKanban({ initialDeals }: Props) {
  const [deals, setDeals] = useState<KanbanDeal[]>(initialDeals)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const activeDeal = activeId ? deals.find((d) => d.id === activeId) : null

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id))
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const draggedId = String(active.id)
    const overId = String(over.id)

    // If dropped over a column header (stage id)
    if (KANBAN_STAGES.includes(overId as DealStage)) {
      setDeals((prev) =>
        prev.map((d) =>
          d.id === draggedId ? { ...d, stage: overId as DealStage } : d
        )
      )
      return
    }

    // If dropped over another card — move to that card's stage
    const overDeal = deals.find((d) => d.id === overId)
    if (overDeal && overDeal.stage !== deals.find((d) => d.id === draggedId)?.stage) {
      setDeals((prev) =>
        prev.map((d) =>
          d.id === draggedId ? { ...d, stage: overDeal.stage } : d
        )
      )
    }
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-4 min-h-[500px]">
        {KANBAN_STAGES.map((stage) => {
          const columnDeals = deals.filter((d) => d.stage === stage)

          return (
            <div
              key={stage}
              className="flex flex-col flex-shrink-0 w-64 bg-[#0D0D0D] border border-[#222222]"
            >
              {/* Column header — also a drop target */}
              <div
                id={stage}
                className="flex items-center justify-between px-3.5 py-3 border-b border-[#222222]"
              >
                <span
                  className={`inline-flex items-center px-2 py-0.5 text-[10px] font-syne font-bold uppercase tracking-widest ${DEAL_STAGE_COLORS[stage]}`}
                >
                  {DEAL_STAGE_LABELS[stage]}
                </span>
                <span className="text-[11px] font-syne font-bold text-[#6B6860] bg-[#1A1A1A] border border-[#222222] px-1.5 py-0.5">
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
                    <span className="text-[11px] font-syne text-[#3A3A3A] uppercase tracking-widest">
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
  )
}
