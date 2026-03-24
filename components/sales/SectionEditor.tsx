'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import type { Section } from '@/types/sales'

type EditingSection = { _key: string; title: string; body: string }

interface SectionEditorProps {
  patchUrl: string
  initialSections: Section[]
  extraFields?: React.ReactNode
  extraData?: Record<string, string | null | undefined>
  onCancel: () => void
}

export function SectionEditor({
  patchUrl,
  initialSections,
  extraFields,
  extraData,
  onCancel,
}: SectionEditorProps) {
  const router = useRouter()
  const [sections, setSections] = useState<EditingSection[]>(
    (initialSections.length > 0 ? initialSections : [{ title: '', body: '' }]).map(s => ({
      ...s,
      _key: crypto.randomUUID(),
    }))
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function updateSection(index: number, field: keyof Section, value: string) {
    setSections(prev =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    )
  }

  function addSection() {
    setSections(prev => [...prev, { title: '', body: '', _key: crypto.randomUUID() }])
  }

  function removeSection(index: number) {
    setSections(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const payload = sections.map(({ _key: _, ...rest }) => rest)
      const res = await fetch(patchUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections: payload, ...extraData }),
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

  return (
    <div className="flex flex-col gap-4">
      {extraFields}

      {sections.map((section, i) => (
        <div
          key={section._key}
          className="bg-[#111111] border border-[#222222] rounded-lg p-5 flex flex-col gap-3"
        >
          <div className="flex items-center justify-between gap-3">
            <input
              value={section.title}
              onChange={e => updateSection(i, 'title', e.target.value)}
              placeholder="Section title"
              className="flex-1 bg-transparent border-b border-[#333333] pb-1 text-xs font-syne font-bold uppercase tracking-widest text-[#6B6860] placeholder-[#3A3A3A] focus:outline-none focus:border-[#008cff] transition-colors"
            />
            <button
              onClick={() => removeSection(i)}
              className="text-[#6B6860] hover:text-red-400 transition-colors"
              title="Remove section"
            >
              <Trash2 size={14} />
            </button>
          </div>
          <textarea
            value={section.body}
            onChange={e => updateSection(i, 'body', e.target.value)}
            placeholder="Write section content…"
            rows={5}
            className="bg-[#0A0A0A] border border-[#222222] rounded-md px-4 py-3 text-sm font-syne text-[#EDE8DE] placeholder-[#3A3A3A] focus:outline-none focus:border-[#008cff] transition-colors resize-none leading-relaxed"
          />
        </div>
      ))}

      <button
        onClick={addSection}
        className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-[#333333] rounded-lg text-sm font-syne text-[#6B6860] hover:border-[#008cff] hover:text-[#008cff] transition-colors w-fit"
      >
        <Plus size={14} />
        Add section
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
