import type { Section } from '@/types/sales'

interface SectionViewerProps {
  sections: Section[]
}

export function SectionViewer({ sections }: SectionViewerProps) {
  if (sections.length === 0) {
    return (
      <p className="text-sm font-syne text-[#6B6860] py-8 text-center">
        No sections yet. Click Edit to add content.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {sections.map((section, i) => (
        <div
          key={i}
          className="bg-[#111111] border border-[#222222] rounded-lg p-5"
        >
          <h3 className="font-syne text-xs font-bold uppercase tracking-widest text-[#6B6860] mb-3">
            {section.title}
          </h3>
          <p className="font-syne text-sm text-[#EDE8DE] whitespace-pre-wrap leading-relaxed">
            {section.body || <span className="text-[#3A3A3A] italic">Empty</span>}
          </p>
        </div>
      ))}
    </div>
  )
}
