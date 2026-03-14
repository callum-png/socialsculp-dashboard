import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import type { UserRole } from '@/types'

const ROLE_HOME: Record<UserRole, string> = {
  ADMIN: '/admin',
  CREATOR: '/creator',
  BRAND: '/brand',
}

export default async function RootPage() {
  const { userId, sessionClaims } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const meta = sessionClaims?.metadata as { role?: UserRole } | undefined
  const role = meta?.role

  if (role && ROLE_HOME[role]) {
    redirect(ROLE_HOME[role])
  }

  redirect('/sign-in')
}
