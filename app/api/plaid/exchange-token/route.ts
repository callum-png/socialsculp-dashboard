import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { plaidClient } from '@/lib/plaid'
import { getDb } from '@/lib/db'



export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { public_token, metadata } = await req.json()

  try {
    const exchangeRes = await plaidClient.itemPublicTokenExchange({ public_token })
    const { access_token, item_id } = exchangeRes.data

    // Save connection
    const connection = await getDb().bankConnection.create({
      data: {
        userId,
        accessToken: access_token,
        itemId: item_id,
        institutionId: metadata?.institution?.institution_id,
        institutionName: metadata?.institution?.name,
      },
    })

    // Fetch and save accounts
    const accountsRes = await plaidClient.accountsGet({ access_token })
    for (const acct of accountsRes.data.accounts) {
      await getDb().bankAccount.create({
        data: {
          connectionId: connection.id,
          plaidAccountId: acct.account_id,
          name: acct.name,
          officialName: acct.official_name ?? null,
          type: acct.type,
          subtype: acct.subtype ?? null,
          mask: acct.mask ?? null,
          currentBalance: acct.balances.current ?? null,
          availableBalance: acct.balances.available ?? null,
          isoCurrencyCode: acct.balances.iso_currency_code ?? null,
        },
      })
    }

    return NextResponse.json({ success: true, connectionId: connection.id })
  } catch (err: any) {
    console.error('Plaid exchange error:', err?.response?.data || err)
    return NextResponse.json({ error: 'Failed to exchange token' }, { status: 500 })
  }
}
