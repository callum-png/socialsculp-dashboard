import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED_PREFIXES = ['/admin', '/agent', '/creator', '/brand', '/auth-redirect']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))
  if (!isProtected) return NextResponse.next()

  // Clerk sets __client_uat to a non-zero timestamp when a session exists.
  // Full JWT verification happens in each page/route via auth().
  const clientUat = req.cookies.get('__client_uat')?.value
  const hasSession = !!clientUat && clientUat !== '0'

  if (!hasSession) {
    const signIn = new URL('/sign-in', req.url)
    signIn.searchParams.set('redirect_url', pathname)
    return NextResponse.redirect(signIn)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin(.*)',
    '/agent(.*)',
    '/creator(.*)',
    '/brand(.*)',
    '/auth-redirect(.*)',
  ],
}
