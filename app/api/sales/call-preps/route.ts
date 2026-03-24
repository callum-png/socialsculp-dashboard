import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getDb } from '@/lib/db'
import { CreateCallPrepSchema } from '@/lib/validations/sales'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getDb()
  const user = await db.user.findUnique({ where: { clerkId: userId } })
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = CreateCallPrepSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { prospect, company, callType, scheduledAt } = parsed.data

  const callPrep = await db.callPrep.create({
    data: {
      prospect,
      company: company ?? null,
      callType,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      sections: [],
      createdById: user.id,
    },
  })

  return NextResponse.json(callPrep, { status: 201 })
}
