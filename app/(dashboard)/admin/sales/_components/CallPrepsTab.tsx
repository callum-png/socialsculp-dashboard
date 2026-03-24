import { getDb } from '@/lib/db'
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
      createdAt: true,
    },
  })

  const callPreps = rows.map(r => ({
    ...r,
    scheduledAt: r.scheduledAt?.toISOString() ?? null,
    createdAt: r.createdAt.toISOString(),
  }))

  return <CallPrepsClient callPreps={callPreps} />
}
