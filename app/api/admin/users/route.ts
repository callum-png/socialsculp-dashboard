import { auth, clerkClient } from '@clerk/nextjs/server'
import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getDb()
  const adminUser = await db.user.findUnique({ where: { clerkId: userId } })
  if (adminUser?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Fetch all Clerk users and filter pending
  const client = await clerkClient()
  const clerkResponse = await client.users.getUserList({ limit: 200 })

  const pending = clerkResponse.data
    .filter(u => u.publicMetadata?.status === 'PENDING')
    .map(u => ({
      clerkId: u.id,
      email: u.emailAddresses?.[0]?.emailAddress ?? '',
      name: [u.firstName, u.lastName].filter(Boolean).join(' ') || u.username || 'Unknown',
      createdAt: new Date(u.createdAt).toISOString(),
    }))

  // All active users from DB (excluding seed placeholder users)
  const active = await db.user.findMany({
    where: { clerkId: { not: { startsWith: 'seed_' } } },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({
    pending,
    active: active.map(u => ({
      ...u,
      createdAt: u.createdAt.toISOString(),
    })),
  })
}
