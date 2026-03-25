'use client'

import { useState } from 'react'
import { CallPrepTabBar, type CallPrepTab } from './CallPrepTabBar'
import { SectionEditorShell } from '@/components/sales/SectionEditorShell'
import { MeetingNotesShell } from '@/components/sales/MeetingNotesShell'
import type { Section, MeetingNote } from '@/types/sales'

interface CallPrepDetailClientProps {
  patchUrl: string
  sections: Section[]
  research: Section[]
  meetingNotes: MeetingNote[]
  extraData: Record<string, string | null | undefined>
}

export function CallPrepDetailClient({
  patchUrl,
  sections,
  research,
  meetingNotes,
  extraData,
}: CallPrepDetailClientProps) {
  const [tab, setTab] = useState<CallPrepTab>('prep')

  return (
    <div>
      <CallPrepTabBar active={tab} onChange={setTab} />

      <div className="px-6 pt-6 pb-12">
        {tab === 'prep' && (
          <SectionEditorShell
            patchUrl={patchUrl}
            sections={sections}
            extraData={extraData}
            heading="Prep Content"
          />
        )}

        {tab === 'research' && (
          <SectionEditorShell
            patchUrl={patchUrl}
            sections={research}
            fieldName="research"
            heading="Company Research"
          />
        )}

        {tab === 'notes' && (
          <MeetingNotesShell
            patchUrl={patchUrl}
            notes={meetingNotes}
          />
        )}
      </div>
    </div>
  )
}
