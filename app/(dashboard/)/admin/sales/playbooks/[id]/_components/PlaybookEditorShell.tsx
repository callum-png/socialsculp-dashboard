'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SectionViewer } from '@/components/sales/SectionViewer'
import { SectionEditor } from '@/components/sales/SectionEditor'
import type { Section } from '@/types/sales'

interface PlaybookEditorShellProps {
  id: string
  initialName: string
  initialDescription: string
  initialSections: Section[]
}

export function PlaybookEditorShell({
  id,
  initialName,
  initialDescription,
  initialSections,
}: PlaybookEditorShellProps) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(initialName)
  const [description, setDescription] = useState(initialDescription)

  const nameDescFields = editing ? (
    <div className="flex flex-col gap-4 mb-6 pb-6 border-b border-[#222222]">
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-syne font-bold uppercase tracking-widest text-[#6B6860]">
          Name
        </label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          className="bg-[#0A0A0A] border border-[#222222] rounded-lg px-4 py-2.5 text-sm font-syne text-[#EDE8DE] focus:outline-none focus:border-[#008cff] transition-colors"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-syne font-bold uppercase tracking-widest text-[#6B6860]">
          Description
        </label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={2}
          className="bg-[#0A0A0A] border border-[#222222] rounded-lg px-4 py-2.5 text-sm font-syne text-[#EDE8DE] focus:outline-none focus:border-[#008cff] transition-colors resize-none"
        />
      </div>
    </div>
  ) : undefined

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-syne text-xs font-bold uppercase tracking-widest text-[#6B6860]">
          Content
        </h2>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="px-4 py-2 text-xs font-syne font-bold uppercase tracking-widest border border-[#333333] text-[#6B6860] rounded-lg hover:border-[#008cff] hover:text-[#008cff] transition-colors"
          >
            Edit
          </button>
        )}
      </div>

      {editing ? (
        <SectionEditor
          patchUrl={`/api/sales/playbooks/${id}`}
          initialSections={initialSections}
          extraFields={nameDescFields}
          extraData={{
            ...(name !== initialName && { name }),
            ...(description !== initialDescription && { description: description || null }),
          }}
          onCancel={() => {
            setEditing(false)
            setName(initialName)
            setDescription(initialDescription)
          }}
        />
      ) : (
        <SectionViewer sections={initialSections} />
      )}
    </div>
  )
}
