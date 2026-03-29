import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

function isAuthorized(req: Request): boolean {
  const secret = req.headers.get('x-ai-secret') ?? req.headers.get('x-reporter-secret')
  return !!secret && secret === process.env.OPENCLAW_REPORTER_SECRET
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { category, content, timestamp, priority } = body

    if (!category || typeof category !== 'string') {
      return NextResponse.json({ error: 'Missing category' }, { status: 400 })
    }
    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Missing content' }, { status: 400 })
    }

    const db = getDb()

    const brief = await db.dailyBrief.create({
      data: {
        category,
        content,
        priority: priority ?? 'normal',
        createdAt: timestamp ? new Date(timestamp) : new Date(),
      },
    })

    // Prune briefs older than 7 days to keep the table lean
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    await db.dailyBrief.deleteMany({ where: { createdAt: { lt: weekAgo } } })

    return NextResponse.json({ ok: true, id: brief.id })
  } catch (err) {
    console.error('[ai/brief] Error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
