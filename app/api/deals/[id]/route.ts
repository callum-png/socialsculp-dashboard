import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getDb } from '@/lib/db'
import type { DealStage } from '@/types'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const db = getDb()
  const deal = await db.deal.findUnique({
    where: { id },
    include: {
      creator: true,
      campaign: { include: { brand: true } },
      deliverables: true,
      stageHistory: { orderBy: { createdAt: 'asc' } },
    },
  })

  if (!deal) {
    return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
  }

  return NextResponse.json(deal)
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()
  const db = getDb()

  const user = await db.user.findUnique({ where: { clerkId: userId } })
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // If stage is being updated, log the transition
  if (body.stage) {
    const current = await db.deal.findUnique({ where: { id }, select: { stage: true } })

    const stageTimestampFields: Partial<Record<DealStage, string>> = {
      SIGNED: 'signedDate',
      LIVE: 'liveDate',
      COMPLETED: 'completedDate',
    }

    const timestampField = stageTimestampFields[body.stage as DealStage]

    const [deal] = await db.$transaction([
      db.deal.update({
        where: { id },
        data: {
          stage: body.stage,
          ...(body.agreedFee !== undefined && { agreedFee: Number(body.agreedFee) }),
          ...(body.notes !== undefined && { notes: body.notes }),
          ...(timestampField && { [timestampField]: new Date() }),
        },
      }),
      db.dealStageEvent.create({
        data: {
          dealId: id,
          fromStage: current?.stage ?? null,
          toStage: body.stage,
          changedById: user.id,
        },
      }),
    ])

    return NextResponse.json(deal)
  }

  // Generic field update (notes, agreedFee, etc.)
  const deal = await db.deal.update({
    where: { id },
    data: body,
  })

  return NextResponse.json(deal)
}
