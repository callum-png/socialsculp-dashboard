import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getDb } from '@/lib/db'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const db = getDb()
  const campaign = await db.campaign.findUnique({
    where: { id },
    include: {
      brand: true,
      deals: {
        include: { creator: true },
        orderBy: { createdAt: 'desc' },
      },
      campaignCreators: {
        include: { creator: true },
      },
      analyticsSnapshots: {
        orderBy: { date: 'desc' },
        take: 30,
      },
    },
  })

  if (!campaign) {
    return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
  }

  return NextResponse.json(campaign)
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

  const campaign = await db.campaign.update({
    where: { id },
    data: body,
    include: { brand: true },
  })

  return NextResponse.json(campaign)
}
