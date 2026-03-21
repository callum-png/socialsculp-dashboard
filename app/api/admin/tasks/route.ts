import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getDb } from '@/lib/db'
import { TaskStatus } from '@prisma/client'

export async function GET(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getDb()
  const user = await db.user.findUnique({ where: { clerkId: userId } })
  if (!user || (user.role !== 'ADMIN' && user.role !== 'AGENT')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const statusParam = searchParams.get('status') as TaskStatus | null

  const tasks = await db.adminTask.findMany({
    where: statusParam ? { status: statusParam } : undefined,
    include: {
      assignee: { select: { id: true, name: true } },
      campaign: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true } },
    },
    orderBy: [
      { status: 'asc' },
      { priority: 'desc' },
      { createdAt: 'desc' },
    ],
  })

  return NextResponse.json(tasks)
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getDb()
  const user = await db.user.findUnique({ where: { clerkId: userId } })
  if (!user || (user.role !== 'ADMIN' && user.role !== 'AGENT')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { title, notes, priority, assigneeId, campaignId, dueDate } = body

  if (!title?.trim()) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 })
  }

  const task = await db.adminTask.create({
    data: {
      title: title.trim(),
      notes: notes || null,
      priority: priority || 'MEDIUM',
      assigneeId: assigneeId || null,
      campaignId: campaignId || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      createdById: user.id,
    },
    include: {
      assignee: { select: { id: true, name: true } },
      campaign: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true } },
    },
  })

  return NextResponse.json(task, { status: 201 })
}
