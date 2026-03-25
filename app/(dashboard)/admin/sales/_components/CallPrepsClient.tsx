'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Loader2, ChevronRight } from 'lucide-react'
import { SalesDrawer } from '@/components/sales/SalesDrawer'
import type { CallPrepRow } from '@/types/sales'

type CallPrepListItem = Pick<CallPrepRow, 'id' | 'prospect' | 'company' | 'callType' | 'scheduledAt' | 'createdAt'>

interface CallPrepsClientProps {
  callPreps: CallPrepListItem[]
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function CallPrepsClient({ callPreps }: CallPrepsClientProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [prospect, setProspect] = useState('')
  const [company, setCompany] = useState('')
  const [callType, setCallType] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [saving, setSaving] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!prospect.trim() || !callType.trim()) return
    setSaving(true)
    setCreateError(null)
    try {
      const res = await fetch('/api/sales/call-preps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prospect: prospect.trim(),
          company: company.trim() || undefined,
          callType: callType.trim(),
          // datetime-local produces a local-time string — convert to ISO UTC for Zod validation
          scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
        }),
      })
      if (!res.ok) {
        setCreateError('Failed to create. Please try again.')
        return
      }
      setOpen(false)
      setProspect('')
      setCompany('')
      setCallType('')
      setScheduledAt('')
      router.refresh()
    } catch {
      setCreateError('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      {/* Header bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <p className="text-sm font-syne text-[#6B6860]">
          {callPreps.length} {callPreps.length === 1 ? 'prep' : 'preps'}
        </p>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#008cff] text-white text-sm font-syne rounded-lg hover:bg-[#0070cc] transition-colors"
        >
          <Plus size={14} />
          New Call Prep
        </button>
      </div>

      {/* Table */}
      <div className="mx-6 bg-[#111111] border border-[#222222] rounded-lg overflow-hidden">
        <div className="grid grid-cols-[2fr_1.5fr_1.5fr_1fr_auto] gap-4 px-5 py-3 border-b border-[#222222]">
          {['Prospect', 'Company', 'Call Type', 'Scheduled', ''].map(h => (
            <span key={h} className="text-[10px] font-syne font-bold uppercase tracking-widest text-[#6B6860]">
              {h}
            </span>
          ))}
        </div>

        {callPreps.length === 0 ? (
          <div className="px-5 py-12 text-center text-[#3A3A3A] font-syne text-xs uppercase tracking-widest">
            No call preps yet
          </div>
        ) : (
          callPreps.map(cp => (
            <Link
              key={cp.id}
              href={`/admin/sales/call-preps/${cp.id}`}
              className="grid grid-cols-[2fr_1.5fr_1.5fr_1fr_auto] gap-4 px-5 py-4 items-center border-b border-[#1A1A1A] last:border-b-0 hover:bg-[#161616] transition-colors"
            >
              <span className="text-sm font-syne font-bold text-[#EDE8DE] truncate">
                {cp.prospect}
              </span>
              <span className="text-xs font-syne text-[#6B6860] truncate">
                {cp.company ?? '—'}
              </span>
              <span className="text-xs font-syne text-[#6B6860] truncate">
                {cp.callType}
              </span>
              <span className="text-xs font-syne text-[#6B6860]">
                {formatDate(cp.scheduledAt)}
              </span>
              <ChevronRight size={14} className="text-[#6B6860]" />
            </Link>
          ))
        )}
      </div>

      {/* New Call Prep drawer */}
      <SalesDrawer open={open} onClose={() => { setOpen(false); setCreateError(null) }} title="New Call Prep">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-syne font-bold uppercase tracking-widest text-[#6B6860]">
              Prospect *
            </label>
            <input
              value={prospect}
              onChange={e => setProspect(e.target.value)}
              placeholder="e.g. Plutus Gaming"
              required
              className="bg-[#111111] border border-[#222222] rounded-lg px-4 py-2.5 text-sm font-syne text-[#EDE8DE] placeholder-[#3A3A3A] focus:outline-none focus:border-[#008cff] transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-syne font-bold uppercase tracking-widest text-[#6B6860]">
              Company
            </label>
            <input
              value={company}
              onChange={e => setCompany(e.target.value)}
              placeholder="e.g. plutus.gg"
              className="bg-[#111111] border border-[#222222] rounded-lg px-4 py-2.5 text-sm font-syne text-[#EDE8DE] placeholder-[#3A3A3A] focus:outline-none focus:border-[#008cff] transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-syne font-bold uppercase tracking-widest text-[#6B6860]">
              Call Type *
            </label>
            <input
              value={callType}
              onChange={e => setCallType(e.target.value)}
              placeholder="e.g. Discovery Call"
              required
              className="bg-[#111111] border border-[#222222] rounded-lg px-4 py-2.5 text-sm font-syne text-[#EDE8DE] placeholder-[#3A3A3A] focus:outline-none focus:border-[#008cff] transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-syne font-bold uppercase tracking-widest text-[#6B6860]">
              Scheduled Date
            </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={e => setScheduledAt(e.target.value)}
              className="bg-[#111111] border border-[#222222] rounded-lg px-4 py-2.5 text-sm font-syne text-[#EDE8DE] focus:outline-none focus:border-[#008cff] transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={saving || !prospect.trim() || !callType.trim()}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#008cff] text-white text-sm font-syne rounded-lg hover:bg-[#0070cc] transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-2"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            Create Call Prep
          </button>
          {createError && (
            <p className="text-sm font-syne text-red-400">{createError}</p>
          )}
        </form>
      </SalesDrawer>
    </div>
  )
}
