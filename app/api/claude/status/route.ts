import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getDb } from '@/lib/db'
import { Resend } from 'resend'

// Helper: count all emails sent via Resend (paginate through the list API)
async function getResendEmailCount(): Promise<{ total: number; recentEmails: { id: string; to: string[]; subject: string; created_at: string }[] }> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey || apiKey.startsWith('re_xxx')) {
    return { total: 0, recentEmails: [] }
  }

  try {
    const resend = new Resend(apiKey)
    let total = 0
    let cursor: string | undefined
    const recentEmails: { id: string; to: string[]; subject: string; created_at: string }[] = []

    // Paginate through all emails to get total count
    // Each page returns up to 100 emails
    for (let page = 0; page < 20; page++) {
      const opts: { limit: number; after?: string } = { limit: 100 }
      if (cursor) opts.after = cursor

      const { data, error } = await resend.emails.list(opts)
      if (error || !data) break

      total += data.data.length

      // Collect first 10 recent emails for display
      if (page === 0) {
        for (const email of data.data.slice(0, 10)) {
          recentEmails.push({
            id: email.id,
            to: Array.isArray(email.to) ? email.to : [email.to],
            subject: email.subject,
            created_at: email.created_at,
          })
        }
      }

      if (!data.has_more) break
      // Use the last email ID as cursor for next page
      const lastEmail = data.data[data.data.length - 1]
      if (lastEmail) cursor = lastEmail.id
    }

    return { total, recentEmails }
  } catch (err) {
    console.error('[claude/status] Resend API error:', err)
    return { total: 0, recentEmails: [] }
  }
}

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

    // CRM stats from dashboard DB
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const [leadsTotal, leadsThisWeek, leadsThisMonth, deals, dealsByStage, resendStats] = await Promise.all([
      db.lead.count(),
      db.lead.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      db.lead.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      db.salesDeal.findMany({
        select: { stage: true, value: true, createdAt: true },
      }),
      db.salesDeal.groupBy({
        by: ['stage'],
        _count: { id: true },
        _sum: { value: true },
      }),
      getResendEmailCount(),
    ])

    const pipelineValue = deals.reduce((sum, d) => sum + (d.value || 0), 0)

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
      crm: {
        leads: {
          total: leadsTotal,
          thisWeek: leadsThisWeek,
          thisMonth: leadsThisMonth,
        },
        deals: {
          total: deals.length,
          pipelineValue,
          byStage: dealsByStage.map(s => ({
            stage: s.stage,
            count: s._count.id,
            value: s._sum.value || 0,
          })),
        },
        emails: {
          sent: resendStats.total,
          recent: resendStats.recentEmails,
        },
      },
    })
  } catch (err) {
    console.error('[claude/status] Error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
