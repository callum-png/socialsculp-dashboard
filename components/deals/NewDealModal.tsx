'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { KanbanDeal } from './DealKanbanCard'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DealCampaignOption {
  id: string
  name: string
}

export interface DealCreatorOption {
  id: string
  handle: string
  name: string
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  campaignId: z.string().min(1, 'Please select a campaign'),
  creatorId: z.string().min(1, 'Please select a creator'),
  proposedFee: z.coerce.number().min(1, 'Fee must be at least $1').optional().or(z.literal('')),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

// ─── Field helpers ─────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[10px] font-syne font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
      {children}
    </label>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-[11px] font-syne text-danger">{message}</p>
}

function inputCls(hasError?: boolean) {
  return cn(
    'w-full px-3 py-2.5 bg-surface-2 border text-sm font-syne text-text placeholder-muted',
    'focus:outline-none transition-colors',
    hasError ? 'border-danger focus:border-danger' : 'border-border focus:border-accent'
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  campaigns: DealCampaignOption[]
  creators: DealCreatorOption[]
  onClose: () => void
  onCreated: (deal: KanbanDeal) => void
}

export function NewDealModal({ campaigns, creators, onClose, onCreated }: Props) {
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: { title: '', campaignId: '', creatorId: '', proposedFee: '', notes: '' },
  })

  // Auto-suggest title when campaign + creator are both selected
  const selectedCampaignId = watch('campaignId')
  const selectedCreatorId = watch('creatorId')
  const campaignName = campaigns.find((c) => c.id === selectedCampaignId)?.name ?? ''
  const creatorHandle = creators.find((c) => c.id === selectedCreatorId)?.handle ?? ''

  async function onSubmit(data: FormData) {
    setSubmitting(true)
    setSubmitError(null)

    try {
      const res = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          campaignId: data.campaignId,
          creatorId: data.creatorId,
          proposedFee: data.proposedFee !== '' ? data.proposedFee : undefined,
          notes: data.notes || undefined,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Failed to create deal')
      }

      const deal = await res.json()

      onCreated({
        id: deal.id,
        title: deal.title,
        stage: deal.stage,
        creatorHandle: deal.creator.handle,
        campaignName: deal.campaign.name,
        proposedFee: deal.proposedFee ?? undefined,
        agreedFee: deal.agreedFee ?? undefined,
      })

      onClose()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong')
      setSubmitting(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-background border border-border shadow-2xl rounded-md">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-syne font-bold text-text uppercase tracking-widest">
              New Deal
            </h2>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-text transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
            {/* Campaign */}
            <div>
              <Label>Campaign</Label>
              {campaigns.length === 0 ? (
                <p className="text-xs font-syne text-warning">
                  No campaigns yet. Create a campaign first.
                </p>
              ) : (
                <>
                  <select {...register('campaignId')} className={inputCls(!!errors.campaignId)}>
                    <option value="">Select a campaign…</option>
                    {campaigns.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <FieldError message={errors.campaignId?.message} />
                </>
              )}
            </div>

            {/* Creator */}
            <div>
              <Label>Creator</Label>
              {creators.length === 0 ? (
                <p className="text-xs font-syne text-warning">
                  No creators yet. Add creator accounts first.
                </p>
              ) : (
                <>
                  <select {...register('creatorId')} className={inputCls(!!errors.creatorId)}>
                    <option value="">Select a creator…</option>
                    {creators.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.handle} — {c.name}
                      </option>
                    ))}
                  </select>
                  <FieldError message={errors.creatorId?.message} />
                </>
              )}
            </div>

            {/* Title */}
            <div>
              <Label>Deal Title</Label>
              <input
                {...register('title')}
                placeholder={
                  campaignName && creatorHandle
                    ? `${creatorHandle} × ${campaignName}`
                    : 'e.g. @creator × Campaign Name'
                }
                className={inputCls(!!errors.title)}
              />
              <FieldError message={errors.title?.message} />
            </div>

            {/* Proposed Fee */}
            <div>
              <Label>Proposed Fee (USD) — optional</Label>
              <input
                type="number"
                {...register('proposedFee')}
                placeholder="e.g. 2500"
                className={inputCls(!!errors.proposedFee)}
              />
              <FieldError message={errors.proposedFee?.message as string | undefined} />
            </div>

            {/* Notes */}
            <div>
              <Label>Notes — optional</Label>
              <textarea
                {...register('notes')}
                rows={3}
                placeholder="Any context, requirements, or initial outreach notes…"
                className={cn(inputCls(!!errors.notes), 'resize-none')}
              />
            </div>

            {submitError && (
              <p className="text-xs font-syne text-danger bg-red-50 border border-red-200 px-3 py-2">
                {submitError}
              </p>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2.5 border border-border text-muted-foreground text-xs font-syne font-bold uppercase tracking-widest hover:border-text hover:text-text transition-colors disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || campaigns.length === 0 || creators.length === 0}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-bg text-xs font-syne font-bold uppercase tracking-widest hover:bg-accent/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? 'Creating…' : <><Check size={12} /> Create Deal</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
