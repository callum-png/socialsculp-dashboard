import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getDb } from '@/lib/db'

export async function GET() {
  const db = getDb()
  const brands = await db.brandProfile.findMany({
    include: { user: true, campaigns: { select: { id: true, status: true } } },
    orderBy: { companyName: 'asc' },
  })
  return NextResponse.json(brands)
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getDb()
  const body = await req.json()
  const { companyName, industry, website, contactName, contactEmail } = body

  const placeholderClerkId = `managed_brand_${Date.now()}_${Math.random().toString(36).slice(2)}`
  const placeholderEmail = contactEmail || `${companyName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}__${Date.now()}@managed.socialsculp.io`

  const user = await db.user.create({
    data: {
      clerkId: placeholderClerkId,
      email: placeholderEmail,
      name: contactName || companyName,
      role: 'BRAND',
    },
  })

  const brand = await db.brandProfile.create({
    data: {
      userId: user.id,
      companyName,
      industry: industry || null,
      website: website || null,
    },
    include: { user: true },
  })

  return NextResponse.json(brand, { status: 201 })
}
