import type { MeetingNote } from '@/types/sales'

interface MeetingNotesViewerProps {
  notes: MeetingNote[]
}

function formatNoteDate(iso: string) {
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

export function MeetingNotesViewer({ notes }: MeetingNotesViewerProps) {
  if (notes.length === 0) {
    return (
      <p className="text-sm font-syne text-[#6B6860] py-8 text-center">
        No meeting notes yet. Click Edit to add notes after your call.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {notes.map((note, i) => (
        <div
          key={i}
          className="bg-[#111111] border border-[#222222] rounded-lg p-5"
        >
          <p className="font-syne text-[10px] text-[#6B6860] mb-1">
            {formatNoteDate(note.date)}
          </p>
          <h3 className="font-syne text-xs font-bold uppercase tracking-widest text-[#6B6860] mb-3">
            {note.title}
          </h3>
          <p className="font-syne text-sm text-[#EDE8DE] whitespace-pre-wrap leading-relaxed">
            {note.body || <span className="text-[#3A3A3A] italic">Empty</span>}
          </p>
        </div>
      ))}
    </div>
  )
}
