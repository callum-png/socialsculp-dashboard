export interface DeckRecord {
  slug: string
  clientName: string
  publicUrl: string
  service: string
  status: 'live' | 'draft'
  createdAt: string
  notes?: string
}

export const DECKS: DeckRecord[] = [
  {
    slug: 'plutus',
    clientName: 'Plutus Gaming',
    publicUrl: 'https://socialsculp.io/plutus',
    service: 'Creator Seeding',
    status: 'live',
    createdAt: '2026-03-21',
    notes: 'Discovery call 2026-03-24',
  },
]
