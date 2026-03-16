import { NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { getDb } from '@/lib/db'

async function getDbUser(clerkUserId: string) {
  const db = getDb()
  return db.user.findUnique({ where: { clerkId: clerkUserId } })
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

  // ADMIN sees all leads with agent info; AGENT sees only their own
  const leads = await db.lead.findMany({
    where: role === 'ADMIN' ? {} : { createdById: dbUser.id },
    include: { createdBy: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(leads)
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const dbUser = await getDbUser(userId)
  if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const db = getDb()
  const body = await req.json()

  // Bulk import support
  if (Array.isArray(body)) {
    const leads = await db.lead.createMany({
      data: body.map((row: Record<string, string>) => ({
        type: (row.type?.toUpperCase() === 'CREATOR' ? 'CREATOR' : 'BRAND') as 'BRAND' | 'CREATOR',
        name: row.name || 'Unknown',
        company: row.company || null,
        email: row.email || null,
        phone: row.phone || null,
        notes: row.notes || null,
        source: row.source || 'csv_import',
        createdById: dbUser.id,
      })),
      skipDuplicates: true,
    })
    return NextResponse.json({ imported: leads.count }, { status: 201 })
  }

  const { type, name, company, email, phone, notes, source } = body
  const lead = await db.lead.create({
    data: { type, name, company: company || null, email: email || null, phone: phone || null, notes: notes || null, source: source || null, createdById: dbUser.id },
    include: { createdBy: { select: { id: true, name: true, email: true } } },
  })
  return NextResponse.json(lead, { status: 201 })
}
