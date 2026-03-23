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

  const onboardingComplete = user.publicMetadata?.onboardingComplete as boolean | undefined

  // Brand and Creator users need to complete onboarding on first login
  if (!onboardingComplete && (role === 'BRAND' || role === 'CREATOR')) {
    redirect(`/${role.toLowerCase()}/onboarding`)
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
