import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getDb } from '@/lib/db'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getDb()
  const creators = await db.creatorProfile.findMany({
    include: { user: true },
    orderBy: { totalReach: 'desc' },
  })
  return NextResponse.json(creators)
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getDb()
  const body = await req.json()
  const {
    handle,
    name,
    niche,
    location,
    bio,
    tiktokFollowers,
    tiktokAvgViews,
    tiktokEngRate,
    instagramFollowers,
    instagramAvgLikes,
    instagramEngRate,
  } = body

  // Create a placeholder User record for admin-added creators (no Clerk account)
  const placeholderClerkId = `managed_${Date.now()}_${Math.random().toString(36).slice(2)}`
  const placeholderEmail = `${handle.replace(/[^a-zA-Z0-9]/g, '')}__${Date.now()}@managed.socialsculp.io`

  const user = await db.user.create({
    data: {
      clerkId: placeholderClerkId,
      email: placeholderEmail,
      name: name || handle,
      role: 'CREATOR',
    },
  })

  const totalReach = (tiktokFollowers ?? 0) + (instagramFollowers ?? 0)
  const engRates = [tiktokEngRate, instagramEngRate].filter(Boolean) as number[]
  const avgEngagement = engRates.length
    ? engRates.reduce((s, r) => s + r, 0) / engRates.length
    : 0

  const creator = await db.creatorProfile.create({
    data: {
      userId: user.id,
      handle,
      bio: bio || null,
      niche: niche ?? [],
      location: location || null,
      tiktokFollowers: tiktokFollowers ? Number(tiktokFollowers) : null,
      tiktokAvgViews: tiktokAvgViews ? Number(tiktokAvgViews) : null,
      tiktokEngRate: tiktokEngRate ? Number(tiktokEngRate) : null,
      instagramFollowers: instagramFollowers ? Number(instagramFollowers) : null,
      instagramAvgLikes: instagramAvgLikes ? Number(instagramAvgLikes) : null,
      instagramEngRate: instagramEngRate ? Number(instagramEngRate) : null,
      totalReach,
      avgEngagement,
    },
    include: { user: true },
  })

  return NextResponse.json(creator, { status: 201 })
}
