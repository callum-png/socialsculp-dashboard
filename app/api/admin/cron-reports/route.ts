import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

const TASK_DEFINITIONS = [
  { taskId: 'morning-brief', description: '10 AM CDT daily — calendar, email triage, top priorities', schedule: 'Daily 10:00 AM', cronExpression: '0 10 * * *' },
  { taskId: 'end-of-day-review', description: '8:30 PM CDT daily — day recap, open items, tomorrow preview', schedule: 'Daily 8:30 PM', cronExpression: '30 20 * * *' },
  { taskId: 'lead-gen-outreach', description: '9 AM weekdays — Creator seeding lead gen via Apollo', schedule: 'Weekdays 9:00 AM', cronExpression: '0 9 * * 1-5' },
  { taskId: 'ai-integration-outreach', description: '9:30 AM weekdays — AI integration lead gen for traditional businesses', schedule: 'Weekdays 9:30 AM', cronExpression: '30 9 * * 1-5' },
  { taskId: 'follow-up-sequencer', description: '12 PM weekdays — tiered follow-ups on cold emails', schedule: 'Weekdays 12:00 PM', cronExpression: '0 12 * * 1-5' },
  { taskId: 'daily-competitive-intel', description: '8 AM weekdays — competitive intel sweep', schedule: 'Weekdays 8:00 AM', cronExpression: '0 8 * * 1-5' },
  { taskId: 'weekly-content-research', description: '9 AM weekdays — viral hooks, trends, algorithm changes', schedule: 'Weekdays 9:00 AM', cronExpression: '0 9 * * 1-5' },
  { taskId: 'content-scrape-and-analyze', description: 'On-demand video scraping and transcription', schedule: 'Manual', cronExpression: null },
  { taskId: 'weekly-security-audit', description: '9 PM Sundays — security audit of Mac, VPS, deployments', schedule: 'Sundays 9:00 PM', cronExpression: '0 21 * * 0' },
]

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const days = parseInt(searchParams.get('days') || '7', 10)
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const db = getDb()
    const reports = await db.cronReport.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    const latestByTask = await db.cronReport.groupBy({
      by: ['taskId'],
      _max: { createdAt: true },
    })

    const latestReports = await Promise.all(
      latestByTask.map(async (g) => {
        if (!g._max.createdAt) return null
        return db.cronReport.findFirst({
          where: { taskId: g.taskId, createdAt: g._max.createdAt },
        })
      })
    )

    const latestMap = Object.fromEntries(
      latestReports.filter(Boolean).map((r: any) => [r.taskId, r])
    )

    const tasks = TASK_DEFINITIONS.map((def) => ({
      ...def,
      lastRun: latestMap[def.taskId]?.completedAt || null,
      lastStatus: latestMap[def.taskId]?.status || null,
      lastSummary: latestMap[def.taskId]?.summary || null,
      lastDetails: latestMap[def.taskId]?.details || null,
      enabled: true,
    }))

    return NextResponse.json({ tasks, reports, generatedAt: new Date().toISOString() })
  } catch (error: any) {
    console.error('Cron reports API error:', error)
    return NextResponse.json(
      { tasks: TASK_DEFINITIONS.map(d => ({ ...d, lastRun: null, lastStatus: null, lastSummary: null, enabled: true })), reports: [], generatedAt: new Date().toISOString(), error: error.message },
      { status: 200 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { taskId, status, summary, details, startedAt, completedAt, description, schedule, leadsFound, emailsDrafted, followUpsDrafted } = body

    if (!taskId || !status || !summary) {
      return NextResponse.json({ error: 'taskId, status, and summary are required' }, { status: 400 })
    }

    const db = getDb()
    const report = await db.cronReport.create({
      data: {
        taskId,
        description: description || TASK_DEFINITIONS.find(t => t.taskId === taskId)?.description,
        schedule: schedule || TASK_DEFINITIONS.find(t => t.taskId === taskId)?.schedule,
        startedAt: startedAt ? new Date(startedAt) : new Date(),
        completedAt: completedAt ? new Date(completedAt) : new Date(),
        status,
        summary,
        details: details || null,
        leadsFound: leadsFound || null,
        emailsDrafted: emailsDrafted || null,
        followUpsDrafted: followUpsDrafted || null,
      },
    })

    return NextResponse.json({ success: true, report })
  } catch (error: any) {
    console.error('Cron report POST error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
