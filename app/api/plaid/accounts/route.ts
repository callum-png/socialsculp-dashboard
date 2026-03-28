import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const connections = await prisma.bankConnection.findMany({
    where: { userId },
    include: {
      accounts: {
        orderBy: { name: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ connections })
}

export async function DELETE(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { connectionId } = await req.json()

  await prisma.bankConnection.deleteMany({
    where: { id: connectionId, userId },
  })

  return NextResponse.json({ success: true })
}
