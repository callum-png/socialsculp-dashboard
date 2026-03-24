import { getDb } from '@/lib/db'
import type { PlaybookRow } from '@/types/sales'
import { PlaybooksClient } from './PlaybooksClient'

export async function PlaybooksTab() {
  const db = getDb()
  const rows = await db.playbook.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, description: true, sections: true, createdAt: true },
  })

  const playbooks: PlaybookRow[] = rows.map(r => ({
    ...r,
    sections: r.sections as PlaybookRow['sections'],
    createdAt: r.createdAt.toISOString(),
  }))

  return <PlaybooksClient playbooks={playbooks} />
}
