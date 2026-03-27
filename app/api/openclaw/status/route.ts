import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getDb } from '@/lib/db'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const db = getDb()

    // Get latest heartbeat
    const latest = await db.openClawHeartbeat.findFirst({
      orderBy: { receivedAt: 'desc' },
    })

    // Get heartbeat history for charts (last 24h, one per 5 min)
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const history = await db.openClawHeartbeat.findMany({
      where: { receivedAt: { gte: dayAgo } },
      orderBy: { receivedAt: 'asc' },
      select: { receivedAt: true, data: true },
    })

    // Get recent commands
    const commands = await db.openClawCommand.findMany({
      orderBy: { executedAt: 'desc' },
      take: 20,
    })

    const isOnline = latest
      ? Date.now() - new Date(latest.receivedAt).getTime() < 2 * 60 * 1000
      : false

    const isStale = latest
      ? Date.now() - new Date(latest.receivedAt).getTime() < 5 * 60 * 1000 && !isOnline
      : false

    return NextResponse.json({
      status: isOnline ? 'online' : isStale ? 'stale' : 'offline',
      latest: latest ? { ...(latest.data as Record<string, unknown>), receivedAt: latest.receivedAt } : null,
      history: history.map(h => ({ receivedAt: h.receivedAt, data: h.data })),
      recentCommands: commands,
    })
  } catch (err) {
    console.error('[openclaw/status] Error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
