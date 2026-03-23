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
      <PageHeader eyebrow="Admin" title="Decks" description="Client sales and campaign decks" />

      <div className="p-6">
        <div className="bg-card border border-border">
          {/* Table header */}
          <div className="grid grid-cols-[2fr_1.5fr_100px_120px_1fr_auto] gap-4 px-5 py-3 border-b border-border">
            {['Client', 'Service', 'Status', 'Created', 'URL', 'Actions'].map((h) => (
              <span key={h} className="text-[10px] font-syne font-bold uppercase tracking-widest text-muted-foreground">
                {h}
              </span>
            ))}
          </div>

          {/* Rows */}
          {DECKS.length === 0 ? (
            <div className="px-5 py-12 text-center text-foreground font-syne text-xs uppercase tracking-widest">
              No decks yet
            </div>
          ) : (
            DECKS.map((deck) => (
              <div
                key={deck.slug}
                className="grid grid-cols-[2fr_1.5fr_100px_120px_1fr_auto] gap-4 px-5 py-4 items-center border-b border-border last:border-b-0"
              >
                {/* Client */}
                <span className="text-sm font-syne font-bold text-foreground truncate">
                  {deck.clientName}
                </span>

                {/* Service */}
                <span className="text-xs font-syne text-muted-foreground truncate">
                  {deck.service}
                </span>

                {/* Status */}
                <span
                  className={`inline-flex items-center px-2 py-0.5 text-[10px] font-syne font-bold uppercase tracking-widest w-fit ${
                    deck.status === 'live'
                      ? 'bg-blue-50 text-[#008cff] border border-blue-200'
                      : 'bg-background text-muted-foreground border border-border'
                  }`}
                >
                  {deck.status}
                </span>

                {/* Created */}
                <span className="text-xs font-syne text-muted-foreground">
                  {formatDate(deck.createdAt)}
                </span>

                {/* URL */}
                <span className="text-xs font-syne text-muted-foreground truncate">
                  {deck.publicUrl}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <CopyButton text={deck.publicUrl} />
                  <a
                    href={deck.publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-muted-foreground hover:text-[#008cff] transition-colors"
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
