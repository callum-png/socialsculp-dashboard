import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getDb } from '@/lib/db'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getDb()
  const user = await db.user.findUnique({ where: { clerkId: userId } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  if (user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden: ADMIN only' }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()
  const { liveUrl, views, likes, comments, shares, engagementRate, postedAt } = body

  const existing = await db.post.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  const post = await db.post.update({
    where: { id },
    data: {
      ...(liveUrl !== undefined && { liveUrl }),
      ...(views !== undefined && { views }),
      ...(likes !== undefined && { likes }),
      ...(comments !== undefined && { comments }),
      ...(shares !== undefined && { shares }),
      ...(engagementRate !== undefined && { engagementRate }),
      ...(postedAt !== undefined && { postedAt: new Date(postedAt) }),
    },
    include: {
      deliverable: {
        include: {
          deal: {
            include: { creator: true },
          },
        },
      },
      submittedBy: true,
    },
  })

  return NextResponse.json(post)
}
