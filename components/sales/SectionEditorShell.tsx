'use client'

import { useState } from 'react'
import { SectionViewer } from './SectionViewer'
import { SectionEditor } from './SectionEditor'
import type { Section } from '@/types/sales'

interface SectionEditorShellProps {
  patchUrl: string
  sections: Section[]
  extraFields?: React.ReactNode
  extraData?: Record<string, string>
}

export function SectionEditorShell({
  patchUrl,
  sections,
  extraFields,
  extraData,
}: SectionEditorShellProps) {
  const [editing, setEditing] = useState(false)

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
          patchUrl={patchUrl}
          initialSections={sections}
          extraFields={extraFields}
          extraData={extraData}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <SectionViewer sections={sections} />
      )}
    </div>
  )
}
