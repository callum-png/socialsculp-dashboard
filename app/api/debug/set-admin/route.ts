import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })

  const client = await clerkClient()
  await client.users.updateUser(userId, { publicMetadata: { role: 'ADMIN' } })

  return NextResponse.json({ success: true, message: 'Role set to ADMIN' })
}
