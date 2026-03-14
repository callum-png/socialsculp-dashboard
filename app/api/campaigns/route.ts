import { NextResponse } from 'next/server'
import { MOCK_CAMPAIGNS } from '@/lib/mock-data'

export async function GET() {
  return NextResponse.json(MOCK_CAMPAIGNS)
}

export async function POST(req: Request) {
  const body = await req.json()
  console.log('[POST /api/campaigns]', body)
  return NextResponse.json({ success: true, data: body }, { status: 201 })
}
