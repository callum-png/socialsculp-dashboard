import { PageHeader } from '@/components/shared/PageHeader'
import { DECKS } from '@/lib/decks'
import type { DeckRecord } from '@/lib/decks'
import { ExternalLink } from 'lucide-react'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function AdminDecksPage() {
  return (
    <div>
      <PageHeader
        title="Decks"
        description="Client-facing campaign decks and sales presentations"
      />

      <div className="bg-[#111111] border border-[#222222] rounded-xl overflow-hidden">
        {DECKS.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-[#6B6860] font-syne">
            No decks yet. Add entries to <code className="text-[#EDE8DE]">lib/decks.ts</code>.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#222222]">
                <th className="px-5 py-3.5 text-left text-xs font-syne font-semibold uppercase tracking-widest text-[#6B6860]">
                  Client
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-syne font-semibold uppercase tracking-widest text-[#6B6860] hidden sm:table-cell">
                  Service
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-syne font-semibold uppercase tracking-widest text-[#6B6860]">
                  Status
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-syne font-semibold uppercase tracking-widest text-[#6B6860] hidden md:table-cell">
                  Created
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-syne font-semibold uppercase tracking-widest text-[#6B6860] hidden lg:table-cell">
                  URL
                </th>
                <th className="px-5 py-3.5 text-right text-xs font-syne font-semibold uppercase tracking-widest text-[#6B6860]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {DECKS.map((deck: DeckRecord) => (
                <tr
                  key={deck.slug}
                  className="border-b border-[#1a1a1a] last:border-0 hover:bg-[#161616] transition-colors"
                >
                  <td className="px-5 py-4 text-white font-syne font-medium">
                    {deck.clientName}
                  </td>
                  <td className="px-5 py-4 text-[#6B6860] font-syne hidden sm:table-cell">
                    {deck.service}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 text-xs font-syne font-semibold rounded-full ${
                        deck.status === 'live'
                          ? 'bg-[#001a33] text-[#008cff] border border-[#003366]'
                          : 'bg-[#1a1a1a] text-[#6B6860] border border-[#222222]'
                      }`}
                    >
                      {deck.status === 'live' ? 'Live' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-[#6B6860] font-syne hidden md:table-cell">
                    {formatDate(deck.createdAt)}
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell">
                    <CopyUrlButton url={deck.publicUrl} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <a
                      href={deck.publicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-syne text-[#008cff] border border-[#222222] rounded-md hover:border-[#008cff] hover:bg-[#001a33] transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open Deck
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function CopyUrlButton({ url }: { url: string }) {
  // Client-side copy — needs 'use client' wrapper. Render as a simple text link for now.
  return (
    <span className="text-[#6B6860] font-syne text-xs truncate max-w-[200px] block">
      {url}
    </span>
  )
}
