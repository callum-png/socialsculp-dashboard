import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getDb } from '@/lib/db'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getDb()
  const campaigns = await db.campaign.findMany({
    include: { brand: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(campaigns)
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = getDb()

  // Resolve our internal user record from Clerk ID
  const user = await db.user.findUnique({ where: { clerkId: userId } })
  if (!user) {
    return NextResponse.json({ error: 'User not found in database' }, { status: 404 })
  }

  const body = await req.json()
  const {
    name,
    description,
    brandId,
    platform,
    contentTypes,
    totalBudget,
    startDate,
    endDate,
    targetROAS,
    targetReach,
  } = body

  const campaign = await db.campaign.create({
    data: {
      name,
      description,
      brandId,
      platform,
      contentTypes: contentTypes ?? [],
      totalBudget: Number(totalBudget),
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      targetROAS: targetROAS ? Number(targetROAS) : null,
      targetReach: targetReach ? Number(targetReach) : null,
      createdById: user.id,
      status: 'DRAFT',
    },
    include: { brand: true },
  })

  return NextResponse.json(campaign, { status: 201 })
}
