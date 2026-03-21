import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getDb } from '@/lib/db'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getDb()
  const user = await db.user.findUnique({ where: { clerkId: userId } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // Report is brand/admin-facing only; creators use the posts feed instead
  if (user.role !== 'ADMIN' && user.role !== 'BRAND') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id: campaignId } = await params

  const campaign = await db.campaign.findUnique({
    where: { id: campaignId },
    include: {
      analyticsSnapshots: {
        orderBy: { date: 'desc' },
        take: 1,
      },
    },
  })

  if (!campaign) {
    return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
  }

  // Brand users can only access their own campaigns
  if (user.role === 'BRAND') {
    const brand = await db.brandProfile.findUnique({ where: { userId: user.id } })
    if (!brand || campaign.brandId !== brand.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  // Fetch all posts for this campaign
  const posts = await db.post.findMany({
    where: { campaignId },
    include: {
      deliverable: {
        include: {
          deal: {
            include: { creator: true },
          },
        },
      },
    },
  })

  // Aggregate metrics
  const totalReach = posts.reduce((sum, p) => sum + p.views, 0)
  const postsLive = posts.length
  const avgEngagementRate =
    postsLive > 0
      ? posts.reduce((sum, p) => sum + p.engagementRate, 0) / postsLive
      : 0

  // Total deliverables for this campaign (across all deals)
  const totalDeliverables = await db.deliverable.count({
    where: {
      deal: { campaignId },
    },
  })

  // Top 5 creators by total views
  const creatorViewMap = new Map<
    string,
    { creatorId: string; handle: string; totalViews: number; engRateSum: number; postCount: number }
  >()

  for (const post of posts) {
    const creator = post.deliverable.deal.creator
    const existing = creatorViewMap.get(creator.id)
    if (existing) {
      existing.totalViews += post.views
      existing.engRateSum += post.engagementRate
      existing.postCount += 1
    } else {
      creatorViewMap.set(creator.id, {
        creatorId: creator.id,
        handle: creator.handle,
        totalViews: post.views,
        engRateSum: post.engagementRate,
        postCount: 1,
      })
    }
  }

  const topCreators = Array.from(creatorViewMap.values())
    .map(({ creatorId, handle, totalViews, engRateSum, postCount }) => ({
      creatorId,
      handle,
      totalViews,
      avgEngagementRate: postCount > 0 ? engRateSum / postCount : 0,
    }))
    .sort((a, b) => b.totalViews - a.totalViews)
    .slice(0, 5)

  // Platform breakdown
  const platformBreakdown: Record<string, number> = {}
  for (const post of posts) {
    platformBreakdown[post.platform] = (platformBreakdown[post.platform] ?? 0) + 1
  }

  // Latest ROAS from AnalyticsSnapshot
  const latestSnapshot = campaign.analyticsSnapshots[0] ?? null
  const latestROAS = latestSnapshot?.roas ?? null

  return NextResponse.json({
    campaignId,
    // Campaign-level fields
    targetROAS: campaign.targetROAS,
    spentBudget: campaign.spentBudget,
    totalBudget: campaign.totalBudget,
    targetReach: campaign.targetReach,
    // Aggregated from posts
    totalReach,
    avgEngagementRate,
    postsLive,
    totalDeliverables,
    topCreators,
    platformBreakdown,
    // From latest analytics snapshot
    latestROAS,
  })
}
