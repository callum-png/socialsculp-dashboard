import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getDb } from '@/lib/db'
import { Prisma, Platform } from '@prisma/client'

export async function GET(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getDb()
  const user = await db.user.findUnique({ where: { clerkId: userId } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { searchParams } = new URL(req.url)
  const campaignId = searchParams.get('campaignId')
  if (!campaignId) {
    return NextResponse.json({ error: 'campaignId query param is required' }, { status: 400 })
  }

  // Role-based access control
  if (user.role === 'BRAND') {
    // Brand users can only see posts for their own campaigns
    const brand = await db.brandProfile.findUnique({ where: { userId: user.id } })
    if (!brand) return NextResponse.json({ error: 'Brand profile not found' }, { status: 404 })

    const campaign = await db.campaign.findUnique({ where: { id: campaignId } })
    if (!campaign || campaign.brandId !== brand.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  } else if (user.role === 'CREATOR') {
    // Creator can see posts for campaigns they're assigned to
    const creator = await db.creatorProfile.findUnique({ where: { userId: user.id } })
    if (!creator) return NextResponse.json({ error: 'Creator profile not found' }, { status: 404 })

    const assignment = await db.campaignCreator.findFirst({
      where: { campaignId, creatorId: creator.id },
    })
    if (!assignment) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }
  // ADMIN and AGENT can see any
  // Creators see all posts for the campaign (shared feed, intentional)

  const posts = await db.post.findMany({
    where: { campaignId },
    include: {
      deliverable: {
        include: {
          deal: {
            include: {
              creator: true,
            },
          },
        },
      },
      submittedBy: true,
    },
    orderBy: { postedAt: 'desc' },
  })

  return NextResponse.json(posts)
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getDb()
  const user = await db.user.findUnique({ where: { clerkId: userId } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  if (user.role !== 'CREATOR' && user.role !== 'ADMIN' && user.role !== 'AGENT') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: { deliverableId: string; liveUrl: string; platform: Platform; postedAt: string; views?: number; likes?: number; comments?: number; shares?: number; engagementRate?: number }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const { deliverableId, liveUrl, platform, postedAt, views, likes, comments, shares, engagementRate } = body

  if (!deliverableId || !liveUrl || !platform || !postedAt) {
    return NextResponse.json(
      { error: 'deliverableId, liveUrl, platform, and postedAt are required' },
      { status: 400 }
    )
  }

  const parsedPostedAt = new Date(postedAt)
  if (isNaN(parsedPostedAt.getTime())) {
    return NextResponse.json({ error: 'postedAt is not a valid ISO date string' }, { status: 400 })
  }

  // Fetch deliverable with deal to verify ownership and get campaignId
  const deliverable = await db.deliverable.findUnique({
    where: { id: deliverableId },
    include: { deal: true },
  })

  if (!deliverable) {
    return NextResponse.json({ error: 'Deliverable not found' }, { status: 404 })
  }

  // Creators can only submit for their own deliverables
  if (user.role === 'CREATOR') {
    const creator = await db.creatorProfile.findUnique({ where: { userId: user.id } })
    if (!creator || deliverable.deal.creatorId !== creator.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  // Create the post and update the deliverable in a transaction
  let post: Awaited<ReturnType<typeof db.post.create>>
  try {
    ;[post] = await db.$transaction([
      db.post.create({
        data: {
          deliverableId,
          campaignId: deliverable.deal.campaignId,
          liveUrl,
          platform,
          postedAt: parsedPostedAt,
          views: views ?? 0,
          likes: likes ?? 0,
          comments: comments ?? 0,
          shares: shares ?? 0,
          engagementRate: engagementRate ?? 0,
          submittedById: user.id,
        },
        include: {
          deliverable: {
            include: {
              deal: {
                include: { creator: true },
              },
            },
          },
          submittedBy: true,
        },
      }),
      db.deliverable.update({
        where: { id: deliverableId },
        data: { submitted: true, liveUrl },
      }),
    ])
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return NextResponse.json({ error: 'A post already exists for this deliverable' }, { status: 409 })
    }
    throw e
  }

  return NextResponse.json(post, { status: 201 })
}
