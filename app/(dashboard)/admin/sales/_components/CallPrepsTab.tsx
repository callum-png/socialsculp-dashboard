import { getDb } from '@/lib/db'
import type { CallPrepRow } from '@/types/sales'
import { CallPrepsClient } from './CallPrepsClient'

export async function CallPrepsTab() {
  const db = getDb()
  const rows = await db.callPrep.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      prospect: true,
      company: true,
      callType: true,
      scheduledAt: true,
      sections: true,
      createdAt: true,
    },
  })

  const callPreps: CallPrepRow[] = rows.map(r => ({
    ...r,
    scheduledAt: r.scheduledAt?.toISOString() ?? null,
    sections: r.sections as CallPrepRow['sections'],
    createdAt: r.createdAt.toISOString(),
  }))

  return <CallPrepsClient callPreps={callPreps} />
}
