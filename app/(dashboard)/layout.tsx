import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { DashboardShell } from '@/components/layout/DashboardShell'
import type { UserRole } from '@/types'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId, sessionClaims } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const meta = sessionClaims?.metadata as { role?: UserRole } | undefined
  const role: UserRole = meta?.role ?? 'ADMIN'

  return <DashboardShell role={role}>{children}</DashboardShell>
}
