import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Auth is enforced server-side in each layout and page via Clerk's auth()
// This middleware is a no-op pass-through required by Next.js routing
export function middleware(_req: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next|.*\\..*|favicon.ico).*)',
  ],
}
