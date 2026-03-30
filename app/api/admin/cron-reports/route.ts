import { NextRequest, NextResponse } from 'next/server'
import { readdir, readFile } from 'fs/promises'
import path from 'path'

export interface TaskDefinition {
  id: string
  name: string
  description: string
  schedule: string
  scheduleHuman: string
  lastRun: string | null
  lastStatus: 'success' | 'error' | null
  nextRun: string | null
  runCount: number
  lastSummary: string | null
  lastDetails: string | null
}

export interface CronReport {
  taskId: string
  description: string
  startedAt: string
  completedAt: string
  status: 'success' | 'error'
  summary: string
  details: string
}

const REPORTS_DIR = path.join(process.cwd(), 'public', 'cron-reports')
const LATEST_STATUS_PATH = path.join(REPORTS_DIR, 'latest-status.json')

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const days = Math.max(1, Math.min(30, parseInt(searchParams.get('days') ?? '1', 10)))
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000

  // Load task definitions from latest-status.json
  let tasks: TaskDefinition[] = []
  try {
    const raw = await readFile(LATEST_STATUS_PATH, 'utf8')
    const parsed = JSON.parse(raw)
    tasks = parsed.tasks ?? []
  } catch {
    // File not found or invalid — return empty
  }

  // Load individual report files
  const reports: CronReport[] = []
  try {
    const files = await readdir(REPORTS_DIR)
    const reportFiles = files.filter(
      (f) => f.endsWith('.json') && f !== 'latest-status.json'
    )

    for (const file of reportFiles) {
      try {
        const raw = await readFile(path.join(REPORTS_DIR, file), 'utf8')
        const report: CronReport & { startedAt: string } = JSON.parse(raw)
        const ts = new Date(report.startedAt).getTime()
        if (!isNaN(ts) && ts >= cutoff) {
          reports.push(report)
        }
      } catch {
        // skip malformed files
      }
    }
  } catch {
    // directory read failed
  }

  // Sort reports newest-first
  reports.sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
  )

  // Merge report data onto task definitions so UI gets last run info inline
  const taskMap = new Map(tasks.map((t) => [t.id, { ...t }]))
  for (const report of reports) {
    const task = taskMap.get(report.taskId)
    if (!task) continue
    // Only update if this report is newer than what's already stored
    if (!task.lastRun || new Date(report.completedAt) > new Date(task.lastRun)) {
      task.lastRun = report.completedAt
      task.lastStatus = report.status
      task.lastSummary = report.summary
      task.lastDetails = report.details
    }
  }

  return NextResponse.json({
    tasks: Array.from(taskMap.values()),
    reports,
    generatedAt: new Date().toISOString(),
  })
}
