import { auth, clerkClient } from '@clerk/nextjs/server'
import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { companyName, industry, website } = await req.json()
  if (!companyName?.trim()) {
    return NextResponse.json({ error: 'Company name is required' }, { status: 400 })
  }

  const db = getDb()
  const user = await db.user.findUnique({ where: { clerkId: userId } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // Upsert brand profile
  await db.brandProfile.upsert({
    where: { userId: user.id },
    update: {
      companyName: companyName.trim(),
      ...(industry && { industry: industry.trim() }),
      ...(website && { website: website.trim() }),
    },
    create: {
      userId: user.id,
      companyName: companyName.trim(),
      industry: industry?.trim(),
      website: website?.trim(),
    },
  })

  // Mark onboarding complete in Clerk
  const client = await clerkClient()
  await client.users.updateUser(userId, {
    publicMetadata: {
      role: 'BRAND',
      status: 'APPROVED',
      onboardingComplete: true,
    },
  })

  return NextResponse.json({ ok: true })
}
