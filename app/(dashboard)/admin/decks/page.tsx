import { ExternalLink } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { CopyButton } from '@/components/shared/CopyButton'
import { DECKS } from '@/lib/decks'

function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(year, month - 1, day))
}

export default function AdminDecksPage() {
  return (
    <div>
      <PageHeader title="Decks" description="Client sales and campaign decks" />

      <div className="p-6">
        <div className="bg-[#111111] border border-[#222222]">
          {/* Table header */}
          <div className="grid grid-cols-[2fr_1.5fr_100px_120px_1fr_auto] gap-4 px-5 py-3 border-b border-[#222222]">
            {['Client', 'Service', 'Status', 'Created', 'URL', 'Actions'].map((h) => (
              <span key={h} className="text-[10px] font-syne font-bold uppercase tracking-widest text-[#6B6860]">
                {h}
              </span>
            ))}
          </div>

          {/* Rows */}
          {DECKS.length === 0 ? (
            <div className="px-5 py-12 text-center text-[#3A3A3A] font-syne text-xs uppercase tracking-widest">
              No decks yet
            </div>
          ) : (
            DECKS.map((deck) => (
              <div
                key={deck.slug}
                className="grid grid-cols-[2fr_1.5fr_100px_120px_1fr_auto] gap-4 px-5 py-4 items-center border-b border-[#1A1A1A] last:border-b-0"
              >
                {/* Client */}
                <span className="text-sm font-syne font-bold text-[#EDE8DE] truncate">
                  {deck.clientName}
                </span>

                {/* Service */}
                <span className="text-xs font-syne text-[#6B6860] truncate">
                  {deck.service}
                </span>

                {/* Status */}
                <span
                  className={`inline-flex items-center px-2 py-0.5 text-[10px] font-syne font-bold uppercase tracking-widest w-fit ${
                    deck.status === 'live'
                      ? 'bg-[#001a33] text-[#008cff] border border-[#003366]'
                      : 'bg-[#1A1A1A] text-[#6B6860] border border-[#222222]'
                  }`}
                >
                  {deck.status}
                </span>

                {/* Created */}
                <span className="text-xs font-syne text-[#6B6860]">
                  {formatDate(deck.createdAt)}
                </span>

                {/* URL */}
                <span className="text-xs font-syne text-[#6B6860] truncate">
                  {deck.publicUrl}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <CopyButton text={deck.publicUrl} />
                  <a
                    href={deck.publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-[#6B6860] hover:text-[#008cff] transition-colors"
                    title="Open deck"
                  >
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
