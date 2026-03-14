import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { UserRole } from '@/types'

// ─── Route Matchers ───────────────────────────────────────────────────────────

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks/(.*)',
])

const isAdminRoute = createRouteMatcher(['/admin(.*)'])
const isCreatorRoute = createRouteMatcher(['/creator(.*)'])
const isBrandRoute = createRouteMatcher(['/brand(.*)'])

// ─── Role → Home Route ────────────────────────────────────────────────────────

const ROLE_HOME: Record<UserRole, string> = {
  ADMIN: '/admin',
  CREATOR: '/creator',
  BRAND: '/brand',
}

// ─── Middleware ───────────────────────────────────────────────────────────────

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { userId, sessionClaims, redirectToSignIn } = await auth()

  // Allow all public routes through without any checks
  if (isPublicRoute(req)) {
    // If authenticated user hits '/', redirect them to their role home
    if (req.nextUrl.pathname === '/' && userId) {
      const role = (sessionClaims?.metadata as { role?: UserRole } | undefined)?.role
      const home = role ? ROLE_HOME[role] : null

      if (home) {
        return NextResponse.redirect(new URL(home, req.url))
      }

      // Authenticated but no role assigned yet — send to sign-in to re-auth
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }

    return NextResponse.next()
  }

  // ── Unauthenticated: gate all non-public routes ──────────────────────────
  if (!userId) {
    return redirectToSignIn({ returnBackUrl: req.url })
  }

  // ── Authenticated: enforce role-based access ─────────────────────────────
  const role = (sessionClaims?.metadata as { role?: UserRole } | undefined)?.role

  if (!role) {
    // User exists in Clerk but has no role — redirect to sign-in
    return NextResponse.redirect(new URL('/sign-in', req.url))
  }

  const home = ROLE_HOME[role]

  // Block cross-role access and redirect to the user's actual home
  if (isAdminRoute(req) && role !== 'ADMIN') {
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
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico
     * - Files with extensions (images, fonts, etc.)
     */
    '/((?!_next|.*\\..*|favicon.ico).*)',
  ],
}
