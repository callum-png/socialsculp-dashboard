import { auth, clerkClient } from '@clerk/nextjs/server'
import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { handle, bio, niche, tiktokHandle, instagramHandle } = await req.json()
  if (!handle?.trim()) {
    return NextResponse.json({ error: 'Handle is required' }, { status: 400 })
  }

  const db = getDb()
  const user = await db.user.findUnique({ where: { clerkId: userId } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // Upsert creator profile
  await db.creatorProfile.upsert({
    where: { userId: user.id },
    update: {
      handle: handle.trim().startsWith('@') ? handle.trim() : `@${handle.trim()}`,
      ...(bio && { bio: bio.trim() }),
      ...(Array.isArray(niche) && niche.length > 0 && { niche }),
    },
    create: {
      userId: user.id,
      handle: handle.trim().startsWith('@') ? handle.trim() : `@${handle.trim()}`,
      bio: bio?.trim(),
      niche: Array.isArray(niche) ? niche : [],
    },
  })

  // Mark onboarding complete in Clerk
  const client = await clerkClient()
  await client.users.updateUser(userId, {
    publicMetadata: {
      role: 'CREATOR',
      status: 'APPROVED',
      onboardingComplete: true,
      ...(tiktokHandle && { tiktokHandle }),
      ...(instagramHandle && { instagramHandle }),
    },
  })

  return NextResponse.json({ ok: true })
}
