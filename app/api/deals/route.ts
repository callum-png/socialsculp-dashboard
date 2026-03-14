import { NextResponse } from 'next/server'
import { MOCK_CAMPAIGNS, MOCK_CREATORS } from '@/lib/mock-data'
import type { DealStage } from '@/types'

const MOCK_DEALS = [
  { id: 'deal-1', creatorHandle: MOCK_CREATORS[0].handle, campaignName: MOCK_CAMPAIGNS[0].name, stage: 'LIVE' as DealStage, agreedFee: 12000 },
  { id: 'deal-2', creatorHandle: MOCK_CREATORS[4].handle, campaignName: MOCK_CAMPAIGNS[1].name, stage: 'LIVE' as DealStage, agreedFee: 18500 },
  { id: 'deal-3', creatorHandle: MOCK_CREATORS[1].handle, campaignName: MOCK_CAMPAIGNS[0].name, stage: 'SIGNED' as DealStage, agreedFee: 9500 },
  { id: 'deal-4', creatorHandle: MOCK_CREATORS[7].handle, campaignName: MOCK_CAMPAIGNS[2].name, stage: 'SIGNED' as DealStage, agreedFee: 15000 },
  { id: 'deal-5', creatorHandle: MOCK_CREATORS[2].handle, campaignName: MOCK_CAMPAIGNS[1].name, stage: 'NEGOTIATING' as DealStage, proposedFee: 8000 },
  { id: 'deal-6', creatorHandle: MOCK_CREATORS[3].handle, campaignName: MOCK_CAMPAIGNS[3].name, stage: 'NEGOTIATING' as DealStage, proposedFee: 22000 },
  { id: 'deal-7', creatorHandle: MOCK_CREATORS[5].handle, campaignName: MOCK_CAMPAIGNS[0].name, stage: 'OUTREACH' as DealStage, proposedFee: 6500 },
  { id: 'deal-8', creatorHandle: MOCK_CREATORS[6].handle, campaignName: MOCK_CAMPAIGNS[2].name, stage: 'OUTREACH' as DealStage, proposedFee: 11000 },
  { id: 'deal-9', creatorHandle: MOCK_CREATORS[8].handle, campaignName: MOCK_CAMPAIGNS[3].name, stage: 'COMPLETED' as DealStage, agreedFee: 25000 },
  { id: 'deal-10', creatorHandle: MOCK_CREATORS[9].handle, campaignName: MOCK_CAMPAIGNS[4].name, stage: 'COMPLETED' as DealStage, agreedFee: 19000 },
  { id: 'deal-11', creatorHandle: MOCK_CREATORS[10].handle, campaignName: MOCK_CAMPAIGNS[0].name, stage: 'OUTREACH' as DealStage, proposedFee: 7500 },
  { id: 'deal-12', creatorHandle: MOCK_CREATORS[11].handle, campaignName: MOCK_CAMPAIGNS[1].name, stage: 'NEGOTIATING' as DealStage, proposedFee: 14000 },
]

export async function GET() {
  return NextResponse.json(MOCK_DEALS)
}
