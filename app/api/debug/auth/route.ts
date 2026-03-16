import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const { userId, sessionClaims } = await auth()
  if (!userId) return NextResponse.json({ userId: null })

  const client = await clerkClient()
  const user = await client.users.getUser(userId)

  return NextResponse.json({
    userId,
    sessionClaims,
    publicMetadata: user.publicMetadata,
    email: user.emailAddresses?.[0]?.emailAddress,
  })
}
