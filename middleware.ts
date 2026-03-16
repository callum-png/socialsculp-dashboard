import { clerkMiddleware, createRouteMatcher, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { UserRole } from '@/types'

// ─── Route Matchers ───────────────────────────────────────────────────────────

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks/(.*)',
  '/api/debug/(.*)',
])

const isAdminRoute = createRouteMatcher(['/admin(.*)'])
const isAgentRoute = createRouteMatcher(['/agent(.*)'])
const isCreatorRoute = createRouteMatcher(['/creator(.*)'])
const isBrandRoute = createRouteMatcher(['/brand(.*)'])

// ─── Role → Home Route ────────────────────────────────────────────────────────

const ROLE_HOME: Record<UserRole, string> = {
  ADMIN: '/admin',
  AGENT: '/agent',
  CREATOR: '/creator',
  BRAND: '/brand',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getRoleForUser(userId: string): Promise<UserRole | null> {
  try {
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    return (user.publicMetadata?.role as UserRole) ?? null
  } catch {
    return null
  }
}

// ─── Middleware ───────────────────────────────────────────────────────────────

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { userId, redirectToSignIn } = await auth()

  // Allow all public routes through without any checks
  if (isPublicRoute(req)) {
    // If authenticated user hits '/', redirect them to their role home
    if (req.nextUrl.pathname === '/' && userId) {
      const role = await getRoleForUser(userId)
      const home = role ? ROLE_HOME[role] : null
      if (home) return NextResponse.redirect(new URL(home, req.url))
    }
    return NextResponse.next()
  }

  // ── Unauthenticated: gate all non-public routes ──────────────────────────
  if (!userId) {
    return redirectToSignIn({ returnBackUrl: req.url })
  }

  // ── Authenticated: fetch role from Clerk ─────────────────────────────────
  const role = await getRoleForUser(userId)

  if (!role) {
    return redirectToSignIn({ returnBackUrl: req.url })
  }

  const home = ROLE_HOME[role]

  // Block cross-role access and redirect to the user's actual home
  if (isAdminRoute(req) && role !== 'ADMIN') {
    return NextResponse.redirect(new URL(home, req.url))
  }

  if (isAgentRoute(req) && role !== 'AGENT') {
    return NextResponse.redirect(new URL(home, req.url))
  }

  if (isCreatorRoute(req) && role !== 'CREATOR') {
    return NextResponse.redirect(new URL(home, req.url))
  }

  if (isBrandRoute(req) && role !== 'BRAND') {
    return NextResponse.redirect(new URL(home, req.url))
  }

  return NextResponse.next()
})

// ─── Matcher Config ───────────────────────────────────────────────────────────

export const config = {
  matcher: [
    '/((?!_next|.*\\..*|favicon.ico).*)',
  ],
}
