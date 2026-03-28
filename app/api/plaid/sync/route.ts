import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { plaidClient } from '@/lib/plaid'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const connections = await prisma.bankConnection.findMany({
      where: { userId },
      include: { accounts: true },
    })

    let totalAdded = 0
    let totalModified = 0
    let totalRemoved = 0

    for (const conn of connections) {
      let cursor = conn.cursor
      let hasMore = true

      while (hasMore) {
        const res = await plaidClient.transactionsSync({
          access_token: conn.accessToken,
          cursor: cursor || undefined,
        })

        const { added, modified, removed, next_cursor, has_more } = res.data

        // Process added transactions
        for (const txn of added) {
          const account = conn.accounts.find(a => a.plaidAccountId === txn.account_id)
          if (!account) continue

          await prisma.plaidTransaction.upsert({
            where: { plaidTransactionId: txn.transaction_id },
            create: {
              accountId: account.id,
              plaidTransactionId: txn.transaction_id,
              amount: txn.amount,
              date: new Date(txn.date),
              name: txn.name,
              merchantName: txn.merchant_name ?? null,
              category: txn.personal_finance_category
                ? [txn.personal_finance_category.primary, txn.personal_finance_category.detailed]
                : txn.category ?? [],
              pending: txn.pending,
              isoCurrencyCode: txn.iso_currency_code ?? null,
            },
            update: {
              amount: txn.amount,
              name: txn.name,
              merchantName: txn.merchant_name ?? null,
              category: txn.personal_finance_category
                ? [txn.personal_finance_category.primary, txn.personal_finance_category.detailed]
                : txn.category ?? [],
              pending: txn.pending,
            },
          })
        }

        // Process modified
        for (const txn of modified) {
          await prisma.plaidTransaction.updateMany({
            where: { plaidTransactionId: txn.transaction_id },
            data: {
              amount: txn.amount,
              name: txn.name,
              merchantName: txn.merchant_name ?? null,
              pending: txn.pending,
            },
          })
        }

        // Process removed
        for (const txn of removed) {
          if (txn.transaction_id) {
            await prisma.plaidTransaction.deleteMany({
              where: { plaidTransactionId: txn.transaction_id },
            })
          }
        }

        totalAdded += added.length
        totalModified += modified.length
        totalRemoved += removed.length
        cursor = next_cursor
        hasMore = has_more
      }

      // Update cursor
      await prisma.bankConnection.update({
        where: { id: conn.id },
        data: { cursor },
      })

      // Update account balances
      try {
        const balRes = await plaidClient.accountsGet({ access_token: conn.accessToken })
        for (const acct of balRes.data.accounts) {
          await prisma.bankAccount.updateMany({
            where: { plaidAccountId: acct.account_id },
            data: {
              currentBalance: acct.balances.current ?? null,
              availableBalance: acct.balances.available ?? null,
            },
          })
        }
      } catch (e) {
        console.error('Balance update failed:', e)
      }
    }

    return NextResponse.json({ added: totalAdded, modified: totalModified, removed: totalRemoved })
  } catch (err: any) {
    console.error('Plaid sync error:', err?.response?.data || err)
    return NextResponse.json({ error: 'Failed to sync transactions' }, { status: 500 })
  }
}
