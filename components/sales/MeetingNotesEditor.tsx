'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import type { MeetingNote } from '@/types/sales'

type EditingNote = MeetingNote & { _key: string }

interface MeetingNotesEditorProps {
  patchUrl: string
  initialNotes: MeetingNote[]
  onCancel: () => void
}

export function MeetingNotesEditor({
  patchUrl,
  initialNotes,
  onCancel,
}: MeetingNotesEditorProps) {
  const router = useRouter()
  const [notes, setNotes] = useState<EditingNote[]>(
    initialNotes.map(n => ({ ...n, _key: crypto.randomUUID() }))
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function updateNote(index: number, field: 'title' | 'body', value: string) {
    setNotes(prev =>
      prev.map((n, i) => (i === index ? { ...n, [field]: value } : n))
    )
  }

  function addNote() {
    setNotes(prev => [
      ...prev,
      {
        title: '',
        body: '',
        date: new Date().toISOString(),
        _key: crypto.randomUUID(),
      },
    ])
  }

  function removeNote(index: number) {
    setNotes(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const payload = notes.map(({ _key: _, ...rest }) => rest)
      const res = await fetch(patchUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetingNotes: payload }),
      })
      if (res.ok) {
        router.refresh()
        onCancel()
      } else {
        setError('Failed to save. Please try again.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  function formatDate(iso: string) {
    const d = new Date(iso)
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }) + ', ' + d.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {notes.map((note, i) => (
        <div
          key={note._key}
          className="bg-[#111111] border border-[#222222] rounded-lg p-5 flex flex-col gap-3"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <span className="text-[10px] font-syne text-[#6B6860] shrink-0">
                {formatDate(note.date)}
              </span>
              <input
                value={note.title}
                onChange={e => updateNote(i, 'title', e.target.value)}
                placeholder="Note title"
                className="flex-1 bg-transparent border-b border-[#333333] pb-1 text-xs font-syne font-bold uppercase tracking-widest text-[#6B6860] placeholder-[#3A3A3A] focus:outline-none focus:border-[#008cff] transition-colors"
              />
            </div>
            <button
              onClick={() => removeNote(i)}
              className="text-[#6B6860] hover:text-red-400 transition-colors"
              title="Remove note"
            >
              <Trash2 size={14} />
            </button>
          </div>
          <textarea
            value={note.body}
            onChange={e => updateNote(i, 'body', e.target.value)}
            placeholder="Write meeting notes..."
            rows={6}
            className="bg-[#0A0A0A] border border-[#222222] rounded-md px-4 py-3 text-sm font-syne text-[#EDE8DE] placeholder-[#3A3A3A] focus:outline-none focus:border-[#008cff] transition-colors resize-none leading-relaxed"
          />
        </div>
      ))}

      <button
        onClick={addNote}
        className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-[#333333] rounded-lg text-sm font-syne text-[#6B6860] hover:border-[#008cff] hover:text-[#008cff] transition-colors w-fit"
      >
        <Plus size={14} />
        Add note
      </button>

      <div className="flex flex-col gap-3 pt-2">
        {error && (
          <p className="text-sm font-syne text-red-400">{error}</p>
        )}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#008cff] text-white text-sm font-syne rounded-lg hover:bg-[#0070cc] transition-colors disabled:opacity-40"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            Save
          </button>
          <button
            onClick={onCancel}
            disabled={saving}
            className="px-5 py-2.5 text-sm font-syne text-[#6B6860] hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
