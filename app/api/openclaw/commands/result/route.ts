import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function POST(req: Request) {
  const secret = req.headers.get('x-reporter-secret')
  if (!secret || secret !== process.env.OPENCLAW_REPORTER_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id, output, exitCode, duration } = await req.json()

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Missing command id' }, { status: 400 })
    }

    const db = getDb()
    await db.openClawCommand.update({
      where: { id },
      data: {
        status: exitCode === 0 ? 'completed' : 'failed',
        output: (output || '').slice(0, 10000),
        exitCode: typeof exitCode === 'number' ? exitCode : 1,
        duration: duration || 0,
        executedAt: new Date(),
      },
    })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('[openclaw/commands/result] Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
