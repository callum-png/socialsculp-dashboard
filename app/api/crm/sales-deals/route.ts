import { NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { getDb } from '@/lib/db'

async function getDbUser(clerkUserId: string) {
  return getDb().user.findUnique({ where: { clerkId: clerkUserId } })
}

export async function GET(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getDb()
  const client = await clerkClient()
  const clerkUser = await client.users.getUser(userId)
  const role = clerkUser.publicMetadata?.role as string

  const dbUser = await getDbUser(userId)
  if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const deals = await db.salesDeal.findMany({
    where: role === 'ADMIN' ? {} : { createdById: dbUser.id },
    include: {
      lead: true,
      createdBy: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(deals)
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const dbUser = await getDbUser(userId)
  if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const db = getDb()
  const body = await req.json()
  const { title, value, notes, leadId } = body

  const deal = await db.salesDeal.create({
    data: { title, value: value ? Number(value) : null, notes: notes || null, leadId: leadId || null, createdById: dbUser.id },
    include: { lead: true, createdBy: { select: { id: true, name: true } } },
  })
  return NextResponse.json(deal, { status: 201 })
}

export async function PATCH(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getDb()
  const { id, stage } = await req.json()
  const deal = await db.salesDeal.update({
    where: { id },
    data: { stage, updatedAt: new Date() },
    include: { lead: true },
  })
  return NextResponse.json(deal)
}
