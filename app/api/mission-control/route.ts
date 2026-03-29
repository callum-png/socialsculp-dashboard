/**
 * /api/mission-control
 *
 * Consolidated Mission Control endpoint.
 *
 * GET  — returns tasks, briefs, and metrics (Clerk-authenticated, for the dashboard UI)
 * POST — ingests updates from Dispatch / Claude AI system (shared-secret authenticated)
 *
 * POST body shape:
 *   { type: 'task_update', task_id, title, status, summary, timestamp? }
 *   { type: 'brief',       category, content, priority?, timestamp? }
 *   { type: 'metric',      metric_name, value, timestamp? }
 *
 * Auth header for POST: x-ai-secret or x-reporter-secret = OPENCLAW_REPORTER_SECRET
 *
 * Data is stored in Postgres via Prisma (ai_tasks / daily_briefs / ai_metrics tables).
 * Run the migration at prisma/migrations/20260329000000_add-ai-mission-control before deploy.
 */

import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getDb } from '@/lib/db'

// ─── Auth helpers ─────────────────────────────────────────────────────────────

function isAgentAuthorized(req: Request): boolean {
  const secret =
    req.headers.get('x-ai-secret') ?? req.headers.get('x-reporter-secret')
  return !!secret && secret === process.env.OPENCLAW_REPORTER_SECRET
}

// ─── GET — dashboard data ─────────────────────────────────────────────────────

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const db = getDb()

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    const [tasks, briefs, metricsToday, metricsWeek] = await Promise.all([
      db.aiTask.findMany({ orderBy: { lastActivity: 'desc' }, take: 50 }),
      db.dailyBrief.findMany({ orderBy: { createdAt: 'desc' }, take: 50 }),
      db.aiMetric.findMany({ where: { date: { gte: todayStart } } }),
      db.aiMetric.findMany({ where: { date: { gte: weekAgo } } }),
    ])

    const agg = (rows: { metricName: string; value: number }[]) => {
      const out: Record<string, number> = {}
      for (const m of rows) out[m.metricName] = (out[m.metricName] ?? 0) + m.value
      return out
    }

    return NextResponse.json({
      tasks,
      briefs,
      metrics: { today: agg(metricsToday), week: agg(metricsWeek) },
    })
  } catch (err) {
    console.error('[mission-control GET]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// ─── POST — ingest updates from AI system ────────────────────────────────────

export async function POST(req: Request) {
  if (!isAgentAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { type } = body
  const db = getDb()

  try {
    if (type === 'task_update') {
      const { task_id, title, status, summary, timestamp } = body as Record<string, string>
      if (!task_id || !status) {
        return NextResponse.json({ error: 'task_update requires task_id and status' }, { status: 400 })
      }
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
    }

    if (type === 'brief') {
      const { category, content, priority, timestamp } = body as Record<string, string>
      if (!category || !content) {
        return NextResponse.json({ error: 'brief requires category and content' }, { status: 400 })
      }
      const brief = await db.dailyBrief.create({
        data: {
          category,
          content,
          priority: priority ?? 'normal',
          createdAt: timestamp ? new Date(timestamp) : new Date(),
        },
      })
      // Prune entries older than 7 days
      await db.dailyBrief.deleteMany({
        where: { createdAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      })
      return NextResponse.json({ ok: true, id: brief.id })
    }

    if (type === 'metric') {
      const { metric_name, timestamp } = body as Record<string, string>
      const value = typeof body.value === 'number' ? body.value : Number(body.value)
      if (!metric_name || isNaN(value)) {
        return NextResponse.json({ error: 'metric requires metric_name and numeric value' }, { status: 400 })
      }
      const metric = await db.aiMetric.create({
        data: {
          metricName: metric_name,
          value,
          date: timestamp ? new Date(timestamp) : new Date(),
        },
      })
      return NextResponse.json({ ok: true, id: metric.id })
    }

    return NextResponse.json(
      { error: 'Unknown type. Use task_update | brief | metric' },
      { status: 400 }
    )
  } catch (err) {
    console.error('[mission-control POST]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
