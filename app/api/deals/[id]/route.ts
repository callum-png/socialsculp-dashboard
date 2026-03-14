import { NextResponse } from 'next/server'
import type { DealStage } from '@/types'

interface PatchBody {
  stage: DealStage
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body: PatchBody = await req.json()

  if (!body.stage) {
    return NextResponse.json({ error: 'stage is required' }, { status: 400 })
  }

  console.log(`[PATCH /api/deals/${id}]`, body)

  // In a real app this would update the DB
  return NextResponse.json({
    id,
    stage: body.stage,
    updatedAt: new Date().toISOString(),
  })
}
