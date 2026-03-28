import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'



export async function GET(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const prisma = getDb()
  const url = new URL(req.url)
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '50')
  const search = url.searchParams.get('search') || ''
  const accountId = url.searchParams.get('accountId') || ''

  // Get user's account IDs
  const userAccounts = await getDb().bankAccount.findMany({
    where: {
      connection: { userId },
      ...(accountId ? { id: accountId } : {}),
    },
    select: { id: true },
  })

  const accountIds = userAccounts.map(a => a.id)
  if (accountIds.length === 0) {
    return NextResponse.json({ transactions: [], total: 0, page, pages: 0 })
  }

  const where = {
    accountId: { in: accountIds },
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { merchantName: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  }

  const [transactions, total] = await Promise.all([
    getDb().plaidTransaction.findMany({
      where,
      include: {
        account: {
          select: { name: true, mask: true, type: true, connection: { select: { institutionName: true } } },
        },
      },
      orderBy: { date: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    getDb().plaidTransaction.count({ where }),
  ])

  return NextResponse.json({
    transactions,
    total,
    page,
    pages: Math.ceil(total / limit),
  })
}
