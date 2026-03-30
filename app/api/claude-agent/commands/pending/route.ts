import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET(req: Request) {
  const secret = req.headers.get('x-reporter-secret')
  if (!secret || secret !== process.env.CLAUDE_REPORTER_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = getDb()

  // Fetch pending commands and mark them as running
  const pending = await db.claudeCommand.findMany({
    where: { status: 'pending' },
    orderBy: { createdAt: 'asc' },
    take: 10,
  })

  if (pending.length > 0) {
    await db.claudeCommand.updateMany({
      where: { id: { in: pending.map(c => c.id) } },
      data: { status: 'running' },
    })
  }

  return NextResponse.json({ commands: pending })
}
