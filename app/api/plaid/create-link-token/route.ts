import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { plaidClient } from '@/lib/plaid'
import { CountryCode, Products } from 'plaid'

export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: userId },
      client_name: 'SocialSculp Finance',
      products: [Products.Transactions],
      country_codes: [CountryCode.Us, CountryCode.Gb],
      language: 'en',
    })
    return NextResponse.json({ link_token: response.data.link_token })
  } catch (err: any) {
    console.error('Plaid link token error:', err?.response?.data || err)
    return NextResponse.json({ error: 'Failed to create link token' }, { status: 500 })
  }
}
