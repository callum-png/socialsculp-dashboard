'use client'

import { useState } from 'react'
import { MeetingNotesViewer } from './MeetingNotesViewer'
import { MeetingNotesEditor } from './MeetingNotesEditor'
import type { MeetingNote } from '@/types/sales'

interface MeetingNotesShellProps {
  patchUrl: string
  notes: MeetingNote[]
}

export function MeetingNotesShell({ patchUrl, notes }: MeetingNotesShellProps) {
  const [editing, setEditing] = useState(false)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-syne text-xs font-bold uppercase tracking-widest text-[#6B6860]">
          Meeting Notes
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
        <MeetingNotesEditor
          patchUrl={patchUrl}
          initialNotes={notes}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <MeetingNotesViewer notes={notes} />
      )}
    </div>
  )
}
