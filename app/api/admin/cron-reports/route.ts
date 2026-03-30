import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import fs from 'fs'
import path from 'path'

// ─── Task Definitions ────────────────────────────────────────────────────────

interface TaskDef {
  taskId: string
  description: string
  schedule: string
  cronExpression: string
}

const TASK_DEFINITIONS: TaskDef[] = [
  {
    taskId: 'morning-brief',
    description: 'Morning briefing — calendar, emails & priority tasks',
    schedule: 'Daily at 7:00 AM',
    cronExpression: '0 7 * * *',
  },
  {
    taskId: 'lead-scraper',
    description: 'Scrape & ingest new brand/creator leads from target sources',
    schedule: 'Every 6 hours',
    cronExpression: '0 */6 * * *',
  },
  {
    taskId: 'email-drafter',
    description: 'Draft outreach emails for new uncontacted leads',
    schedule: 'Daily at 9:00 AM',
    cronExpression: '0 9 * * 1-5',
  },
  {
    taskId: 'follow-up-drafter',
    description: 'Draft follow-up emails for stale deals (>3 days no reply)',
    schedule: 'Daily at 10:00 AM',
    cronExpression: '0 10 * * 1-5',
  },
  {
    taskId: 'deal-tracker',
    description: 'Review and update deal stages based on latest activity',
    schedule: 'Daily at 8:00 AM',
    cronExpression: '0 8 * * 1-5',
  },
  {
    taskId: 'analytics-sync',
    description: 'Sync platform analytics for active campaigns',
    schedule: 'Every 4 hours',
    cronExpression: '0 */4 * * *',
  },
  {
    taskId: 'lead-qualifier',
    description: 'Score and qualify new leads using AI enrichment',
    schedule: 'Daily at 11:00 AM',
    cronExpression: '0 11 * * 1-5',
  },
  {
    taskId: 'content-monitor',
    description: 'Monitor live content performance and flag underperformers',
    schedule: 'Every 2 hours',
    cronExpression: '0 */2 * * *',
  },
  {
    taskId: 'weekly-report',
    description: 'Weekly executive summary — pipeline, deals & revenue',
    schedule: 'Mondays at 8:00 AM',
    cronExpression: '0 8 * * 1',
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Attempt to read a local JSON file from public/cron-reports/<taskId>.json as fallback. */
function readLocalReport(taskId: string): Record<string, unknown> | null {
  try {
    const filePath = path.join(process.cwd(), 'public', 'cron-reports', `${taskId}.json`)
    if (!fs.existsSync(filePath)) return null
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  } catch {
    return null
  }
}

/** Write a cron report to local filesystem as a fallback / cache. */
function writeLocalReport(taskId: string, data: Record<string, unknown>): void {
  try {
    const dir = path.join(process.cwd(), 'public', 'cron-reports')
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(
      path.join(dir, `${taskId}.json`),
      JSON.stringify(data, null, 2),
      'utf-8'
    )
  } catch {
    // Non-fatal — serverless filesystems are read-only at runtime
  }
}

// ─── GET /api/admin/cron-reports ──────────────────────────────────────────────

export async function GET() {
  try {
    const db = getDb()

    // Fetch latest report for each task + last 24h history
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000)

    const [latestByTask, recentReports] = await Promise.all([
      // One query per task would be N+1 — fetch all recent and group in JS instead
      db.cronReport.findMany({
        where: { createdAt: { gte: since } },
        orderBy: { createdAt: 'desc' },
      }),
      db.cronReport.findMany({
        where: { createdAt: { gte: since } },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
    ])

    // Build map: taskId → latest report
    const latestMap = new Map<string, typeof latestByTask[number]>()
    for (const report of latestByTask) {
      if (!latestMap.has(report.taskId)) {
        latestMap.set(report.taskId, report)
      }
    }

    // Determine overall status from most recent report across all tasks
    const mostRecentReport = latestByTask[0]
    const lastHeartbeat = mostRecentReport?.completedAt ?? null
    let status: 'online' | 'stale' | 'offline' = 'offline'
    if (lastHeartbeat) {
      const ageMs = Date.now() - new Date(lastHeartbeat).getTime()
      if (ageMs < 6 * 60 * 60 * 1000) status = 'online'
      else if (ageMs < 24 * 60 * 60 * 1000) status = 'stale'
    }

    // Build cron job list (task defs + latest report attached)
    const crons = TASK_DEFINITIONS.map((task) => {
      const report = latestMap.get(task.taskId)
        ?? (readLocalReport(task.taskId) as any)
        ?? null

      return {
        id: task.taskId,
        name: task.taskId,
        description: task.description,
        schedule: task.cronExpression,
        scheduleLabel: task.schedule,
        enabled: true,
        lastRun: report?.completedAt ?? report?.completedAt ?? null,
        nextRun: null, // Could compute from cron expression if needed
        lastStatus: report?.status ?? null,
        lastSummary: report?.summary ?? null,
        runCount: latestByTask.filter((r) => r.taskId === task.taskId).length,
      }
    })

    // Build AgentData-compatible response
    const responseData = {
      status,
      latest: {
        timestamp: lastHeartbeat?.toISOString() ?? null,
        crons,
        // Provide empty stubs so StatusOverviewTab renders without errors
        system: null,
        agents: [],
        sessions: [],
        recentTasks: recentReports.map((r) => ({
          id: r.id,
          agent: r.taskId,
          description: r.summary,
          status: r.status === 'success' ? 'completed' : 'failed',
          startedAt: r.startedAt.toISOString(),
          duration: r.completedAt.getTime() - r.startedAt.getTime(),
        })),
      },
      history: recentReports.slice(0, 20).map((r) => ({
        receivedAt: r.createdAt.toISOString(),
        data: { taskId: r.taskId, status: r.status, summary: r.summary },
      })),
      recentCommands: [],
    }

    return NextResponse.json(responseData)
  } catch (err: any) {
    console.error('[cron-reports GET]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// ─── POST /api/admin/cron-reports ─────────────────────────────────────────────

export async function POST(req: Request) {
  let body: Record<string, any>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // ── Terminal command passthrough (used by CommandTerminalTab) ──────────────
  if ('command' in body) {
    return NextResponse.json(
      { output: 'Terminal commands are not available in cloud mode.', exitCode: 1 },
      { status: 200 }
    )
  }

  // ── Save cron report ───────────────────────────────────────────────────────
  const { taskId, status, summary, details, startedAt, completedAt, leadsFound, emailsDrafted, followUpsDrafted } = body

  if (!taskId || !status || !summary || !startedAt || !completedAt) {
    return NextResponse.json(
      { error: 'taskId, status, summary, startedAt, and completedAt are required' },
      { status: 400 }
    )
  }

  const taskDef = TASK_DEFINITIONS.find((t) => t.taskId === taskId)

  try {
    const db = getDb()

    const report = await db.cronReport.create({
      data: {
        taskId,
        description: taskDef?.description ?? null,
        schedule: taskDef?.cronExpression ?? null,
        startedAt: new Date(startedAt),
        completedAt: new Date(completedAt),
        status,
        summary,
        details: details ?? null,
        leadsFound: leadsFound ?? null,
        emailsDrafted: emailsDrafted ?? null,
        followUpsDrafted: followUpsDrafted ?? null,
      },
    })

    // Also write to local filesystem as a fallback cache
    writeLocalReport(taskId, {
      ...report,
      startedAt: report.startedAt.toISOString(),
      completedAt: report.completedAt.toISOString(),
      createdAt: report.createdAt.toISOString(),
    })

    return NextResponse.json(report, { status: 201 })
  } catch (err: any) {
    console.error('[cron-reports POST]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
