import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getDb } from '@/lib/db'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const db = getDb()

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    const [tasks, briefs, metricsToday, metricsWeek] = await Promise.all([
      db.aiTask.findMany({
        orderBy: { lastActivity: 'desc' },
        take: 50,
      }),
      db.dailyBrief.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      db.aiMetric.findMany({
        where: { date: { gte: todayStart } },
        orderBy: { date: 'desc' },
      }),
      db.aiMetric.findMany({
        where: { date: { gte: weekAgo } },
        orderBy: { date: 'desc' },
      }),
    ])

    // Sum metric values grouped by name
    const aggregateMetrics = (rows: { metricName: string; value: number }[]) => {
      const agg: Record<string, number> = {}
      for (const m of rows) {
        agg[m.metricName] = (agg[m.metricName] ?? 0) + m.value
      }
      return agg
    }

    return NextResponse.json({
      tasks,
      briefs,
      metrics: {
        today: aggregateMetrics(metricsToday),
        week: aggregateMetrics(metricsWeek),
      },
    })
  } catch (err) {
    console.error('[ai/dashboard] Error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
