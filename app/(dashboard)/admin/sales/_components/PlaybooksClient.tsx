'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Loader2, BookOpen } from 'lucide-react'
import { SalesDrawer } from '@/components/sales/SalesDrawer'
import type { PlaybookRow } from '@/types/sales'

interface PlaybooksClientProps {
  playbooks: PlaybookRow[]
}

export function PlaybooksClient({ playbooks }: PlaybooksClientProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    await fetch('/api/sales/playbooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        description: description.trim() || undefined,
      }),
    })
    setSaving(false)
    setOpen(false)
    setName('')
    setDescription('')
    router.refresh()
  }

  return (
    <div>
      {/* Header bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <p className="text-sm font-syne text-[#6B6860]">
          {playbooks.length} {playbooks.length === 1 ? 'playbook' : 'playbooks'}
        </p>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#008cff] text-white text-sm font-syne rounded-lg hover:bg-[#0070cc] transition-colors"
        >
          <Plus size={14} />
          New Playbook
        </button>
      </div>

      {/* Card grid */}
      {playbooks.length === 0 ? (
        <div className="mx-6 py-12 text-center text-[#3A3A3A] font-syne text-xs uppercase tracking-widest">
          No playbooks yet
        </div>
      ) : (
        <div className="mx-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {playbooks.map(pb => (
            <Link
              key={pb.id}
              href={`/admin/sales/playbooks/${pb.id}`}
              className="bg-[#111111] border border-[#222222] rounded-lg p-5 hover:border-[#333333] hover:bg-[#161616] transition-colors flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-3">
                <BookOpen size={16} className="text-[#008cff] mt-0.5 shrink-0" />
                <span className="text-[10px] font-syne text-[#3A3A3A]">
                  {pb.sections.length} section{pb.sections.length !== 1 ? 's' : ''}
                </span>
              </div>
              <h3 className="font-fraunces text-base font-bold text-[#EDE8DE]">
                {pb.name}
              </h3>
              {pb.description && (
                <p className="text-xs font-syne text-[#6B6860] line-clamp-2">
                  {pb.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}

      {/* New Playbook drawer */}
      <SalesDrawer open={open} onClose={() => setOpen(false)} title="New Playbook">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-syne font-bold uppercase tracking-widest text-[#6B6860]">
              Name *
            </label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Discovery Call"
              required
              className="bg-[#111111] border border-[#222222] rounded-lg px-4 py-2.5 text-sm font-syne text-[#EDE8DE] placeholder-[#3A3A3A] focus:outline-none focus:border-[#008cff] transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-syne font-bold uppercase tracking-widest text-[#6B6860]">
              Description
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Brief summary of when to use this playbook…"
              rows={3}
              className="bg-[#111111] border border-[#222222] rounded-lg px-4 py-2.5 text-sm font-syne text-[#EDE8DE] placeholder-[#3A3A3A] focus:outline-none focus:border-[#008cff] transition-colors resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#008cff] text-white text-sm font-syne rounded-lg hover:bg-[#0070cc] transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-2"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            Create Playbook
          </button>
        </form>
      </SalesDrawer>
    </div>
  )
}
