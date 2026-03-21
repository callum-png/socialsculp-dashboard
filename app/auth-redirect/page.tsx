import { auth, clerkClient } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function AuthRedirectPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const client = await clerkClient()
  const user = await client.users.getUser(userId)
  const role = user.publicMetadata?.role as string | undefined
  const status = user.publicMetadata?.status as string | undefined

  if (!role || status === 'PENDING') {
    redirect('/pending')
  }

  switch (role) {
    case 'ADMIN':
      redirect('/admin')
    case 'AGENT':
      redirect('/agent')
    case 'CREATOR':
      redirect('/creator')
    case 'BRAND':
      redirect('/brand')
    default:
      redirect('/pending')
  }
}
