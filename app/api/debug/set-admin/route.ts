import { NextResponse } from 'next/server'

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Dev-only: import dynamically to avoid bundling in production
  const { auth, clerkClient } = await import('@clerk/nextjs/server')
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })

  const client = await clerkClient()
  await client.users.updateUser(userId, { publicMetadata: { role: 'ADMIN' } })

  return NextResponse.json({ success: true, message: 'Role set to ADMIN' })
}
