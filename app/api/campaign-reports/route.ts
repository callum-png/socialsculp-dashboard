import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getDb } from '@/lib/db'

export async function GET(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getDb()
  const user = await db.user.findUnique({ where: { clerkId: userId } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  if (user.role !== 'ADMIN' && user.role !== 'BRAND') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const campaignId = searchParams.get('campaignId')
  if (!campaignId) {
    return NextResponse.json({ error: 'campaignId query param is required' }, { status: 400 })
  }

  // Brand users can only see reports for their own campaigns
  if (user.role === 'BRAND') {
    const brand = await db.brandProfile.findUnique({ where: { userId: user.id } })
    if (!brand) return NextResponse.json({ error: 'Brand profile not found' }, { status: 404 })

    const campaign = await db.campaign.findUnique({ where: { id: campaignId } })
    if (!campaign || campaign.brandId !== brand.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  const reports = await db.campaignReport.findMany({
    where: { campaignId },
    include: { publishedBy: true },
    orderBy: { publishedAt: 'desc' },
  })

  return NextResponse.json(reports)
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getDb()
  const user = await db.user.findUnique({ where: { clerkId: userId } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  if (user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden: ADMIN only' }, { status: 403 })
  }

  const body = await req.json()
  const { campaignId, title, notes } = body

  if (!campaignId || !title) {
    return NextResponse.json({ error: 'campaignId and title are required' }, { status: 400 })
  }

  const campaign = await db.campaign.findUnique({ where: { id: campaignId } })
  if (!campaign) {
    return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
  }

  const report = await db.campaignReport.create({
    data: {
      campaignId,
      title,
      notes: notes ?? null,
      publishedById: user.id,
    },
    include: {
      publishedBy: true,
      campaign: { include: { brand: true } },
    },
  })

  return NextResponse.json(report, { status: 201 })
}
