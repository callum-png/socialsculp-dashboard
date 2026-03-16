import { auth, clerkClient } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import type { UserRole } from '@/types'

const ROLE_HOME: Record<UserRole, string> = {
  ADMIN: '/admin',
  AGENT: '/agent',
  CREATOR: '/creator',
  BRAND: '/brand',
}

export default async function RootPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const client = await clerkClient()
  const user = await client.users.getUser(userId)
  const role = user.publicMetadata?.role as UserRole | undefined

  if (role && ROLE_HOME[role]) {
    redirect(ROLE_HOME[role])
  }

  redirect('/sign-in')
}
