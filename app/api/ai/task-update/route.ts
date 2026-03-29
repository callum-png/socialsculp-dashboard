import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

// Auth: shared secret (same env var as openclaw reporter, or set AI_CEO_SECRET separately)
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
    const { task_id, title, status, summary, timestamp } = body

    if (!task_id || typeof task_id !== 'string') {
      return NextResponse.json({ error: 'Missing task_id' }, { status: 400 })
    }
    if (!status || typeof status !== 'string') {
      return NextResponse.json({ error: 'Missing status' }, { status: 400 })
    }

    const db = getDb()
    const activityAt = timestamp ? new Date(timestamp) : new Date()

    const task = await db.aiTask.upsert({
      where: { taskId: task_id },
      create: {
        taskId: task_id,
        title: title ?? task_id,
        status,
        summary: summary ?? null,
        lastActivity: activityAt,
      },
      update: {
        ...(title ? { title } : {}),
        status,
        ...(summary !== undefined ? { summary } : {}),
        lastActivity: activityAt,
      },
    })

    return NextResponse.json({ ok: true, id: task.id })
  } catch (err) {
    console.error('[ai/task-update] Error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
