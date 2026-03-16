export const dynamic = 'force-dynamic'

import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent, clerkClient } from '@clerk/nextjs/server'
import { getDb } from '@/lib/db'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    console.error('CLERK_WEBHOOK_SECRET is not set')
    return new Response('Webhook secret not configured', { status: 500 })
  }

  // ── 1. Verify svix signature ──────────────────────────────────────────────
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 })
  }

  const body = await req.text()
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Webhook verification failed:', err)
    return new Response('Invalid signature', { status: 400 })
  }

  // ── 2. Handle events ──────────────────────────────────────────────────────
  const eventType = evt.type
  const db = getDb()

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, username, public_metadata } = evt.data

    const email = email_addresses?.[0]?.email_address ?? ''
    const name = [first_name, last_name].filter(Boolean).join(' ') || username || 'Unknown'
    const role = (public_metadata?.role as string) ?? 'CREATOR'

    try {
      const user = await db.user.create({
        data: {
          clerkId: id,
          email,
          name,
          role: role as 'ADMIN' | 'CREATOR' | 'BRAND',
        },
      })

      if (role === 'CREATOR') {
        await db.creatorProfile.create({
          data: {
            userId: user.id,
            handle: username ? `@${username}` : `@${id.slice(0, 8)}`,
          },
        })
      }

      if (role === 'BRAND') {
        await db.brandProfile.create({
          data: {
            userId: user.id,
            companyName: first_name ?? 'Unnamed Brand',
          },
        })
      }

      // Write role back to Clerk publicMetadata so it appears in session JWT claims
      const client = await clerkClient()
      await client.users.updateUser(id, { publicMetadata: { role } })

      console.log(`[webhook] user.created: ${user.id} (${role})`)
    } catch (err) {
      console.error('[webhook] user.created error:', err)
      return new Response('DB error', { status: 500 })
    }
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name } = evt.data

    const email = email_addresses?.[0]?.email_address
    const name = [first_name, last_name].filter(Boolean).join(' ') || undefined

    try {
      await db.user.updateMany({
        where: { clerkId: id },
        data: {
          ...(email && { email }),
          ...(name && { name }),
        },
      })
      console.log(`[webhook] user.updated: ${id}`)
    } catch (err) {
      console.error('[webhook] user.updated error:', err)
      return new Response('DB error', { status: 500 })
    }
  }

  return new Response('OK', { status: 200 })
}
