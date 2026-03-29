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
    const { metric_name, value, timestamp } = body

    if (!metric_name || typeof metric_name !== 'string') {
      return NextResponse.json({ error: 'Missing metric_name' }, { status: 400 })
    }
    if (value === undefined || typeof value !== 'number') {
      return NextResponse.json({ error: 'Missing or invalid value (must be number)' }, { status: 400 })
    }

    const db = getDb()

    const metric = await db.aiMetric.create({
      data: {
        metricName: metric_name,
        value,
        date: timestamp ? new Date(timestamp) : new Date(),
      },
    })

    return NextResponse.json({ ok: true, id: metric.id })
  } catch (err) {
    console.error('[ai/metric] Error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
