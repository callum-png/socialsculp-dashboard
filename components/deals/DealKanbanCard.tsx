'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { DealStage } from '@/types'

export interface KanbanDeal {
  id: string
  title: string
  stage: DealStage
  creatorHandle: string
  campaignName: string
  agreedFee?: number
  proposedFee?: number
}

interface Props {
  deal: KanbanDeal
}

export function DealKanbanCard({ deal }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const displayFee = deal.agreedFee ?? deal.proposedFee

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-surface border border-border rounded-md p-3.5 relative select-none"
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-3 right-3 cursor-grab active:cursor-grabbing text-muted/40 hover:text-muted transition-colors"
      >
        <GripVertical size={14} />
      </div>

      <div className="pr-5">
        {/* Creator handle */}
        <div className="font-syne font-bold text-sm text-text mb-1 truncate">
          {deal.creatorHandle}
        </div>

        {/* Campaign name */}
        <div className="font-fraunces text-xs text-muted truncate mb-3">
          {deal.campaignName}
        </div>

        {/* Fee */}
        {displayFee != null && (
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-syne uppercase tracking-widest text-muted">
              {deal.agreedFee != null ? 'Agreed' : 'Proposed'}
            </span>
            <span
              className={`text-xs font-syne font-bold ${
                deal.agreedFee != null ? 'text-accent' : 'text-muted'
              }`}
            >
              {formatCurrency(displayFee)}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
