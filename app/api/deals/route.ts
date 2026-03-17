import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getDb } from '@/lib/db'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getDb()
  const deals = await db.deal.findMany({
    where: { stage: { notIn: ['CANCELLED'] } },
    include: {
      creator: true,
      campaign: {
        include: { brand: true },
      },
      deliverables: true,
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(deals)
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = getDb()
  const body = await req.json()
  const { title, campaignId, creatorId, proposedFee, notes } = body

  const deal = await db.deal.create({
    data: {
      title,
      campaignId,
      creatorId,
      proposedFee: proposedFee ? Number(proposedFee) : null,
      notes: notes ?? null,
      outreachDate: new Date(),
    },
    include: {
      creator: true,
      campaign: { include: { brand: true } },
    },
  })

  return NextResponse.json(deal, { status: 201 })
}
