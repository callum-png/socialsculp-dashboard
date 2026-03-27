import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function POST(req: Request) {
  // Authenticate with shared secret (not Clerk — this comes from VPS)
  const secret = req.headers.get('x-reporter-secret')
  if (!secret || secret !== process.env.OPENCLAW_REPORTER_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await req.json()
    const db = getDb()

    const heartbeat = await db.openClawHeartbeat.create({
      data: { data },
    })

    // Keep only last 1440 heartbeats (24 hours at 1/min)
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000)
    await db.openClawHeartbeat.deleteMany({
      where: { receivedAt: { lt: cutoff } },
    })

    return NextResponse.json({ ok: true, id: heartbeat.id })
  } catch (err) {
    console.error('[openclaw/heartbeat] Error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
