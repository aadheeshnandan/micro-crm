import { NextResponse, type NextRequest } from 'next/server'

// Auth temporarily disabled for demo — re-enable after interview
export function proxy(_request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}
