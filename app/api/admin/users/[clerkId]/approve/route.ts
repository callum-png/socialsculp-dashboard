import { auth, clerkClient } from '@clerk/nextjs/server'
import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ clerkId: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify the caller is an admin
  const db = getDb()
  const adminUser = await db.user.findUnique({ where: { clerkId: userId } })
  if (adminUser?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { clerkId } = await params
  const { role } = await req.json() as { role: 'BRAND' | 'CREATOR' | 'AGENT' }

  if (!['BRAND', 'CREATOR', 'AGENT'].includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  // Update Clerk metadata
  const client = await clerkClient()
  await client.users.updateUser(clerkId, {
    publicMetadata: {
      role,
      status: 'APPROVED',
      onboardingComplete: false,
    },
  })

  // Update DB user role
  await db.user.updateMany({
    where: { clerkId },
    data: { role },
  })

  return NextResponse.json({ ok: true })
}
