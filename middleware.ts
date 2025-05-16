// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

// Create the internationalization middleware
const intlMiddleware = createMiddleware(routing)

// Define strict matcher to prevent middleware running on unnecessary paths
export const config = {
  matcher: [
    // Skip public files, API routes, and Next.js internals
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // 1. ALWAYS SKIP auth for login-related pages and API routes
  if (
    pathname.includes('/login') ||
    pathname.includes('/api/auth') ||
    pathname.startsWith('/api/')
  ) {
    return intlMiddleware(request)
  }

  // 2. Check for Casso auth subdomain
  const hostname = request.headers.get('host') || ''
  if (hostname.startsWith('auth.')) {
    const headers = Array.from(request.headers.entries())
    const employeeId = headers.find(
      ([key]) => key === 'x-amzn-oidc-identity'
    )?.[1]
    const cassoToken = headers.find(
      ([key]) => key === 'x-amzn-oidc-accesstoken'
    )?.[1]

    if (employeeId && cassoToken) {
      return NextResponse.redirect(
        `${request.nextUrl.origin}/login-casso?employee-id=${employeeId}&casso-token=${cassoToken}`
      )
    }
  }

  // 3. For all other routes, check auth cookie
  const authCookie = request.cookies.get('logged-in')
  const isLoggedIn = authCookie?.value === 'true'

  if (!isLoggedIn) {
    // Extract locale if present
    const segments = pathname.split('/').filter(Boolean)
    const locale =
      segments.length > 0 &&
      routing.locales.includes(segments[0] as 'en' | 'jp')
        ? (segments[0] as 'en' | 'jp')
        : routing.defaultLocale

    // Build login URL with locale
    const loginUrl = new URL(`/${locale}/login`, request.url)

    // Add the full path as callback URL
    loginUrl.searchParams.set('callbackUrl', pathname)

    return NextResponse.redirect(loginUrl)
  }

  // 4. User is authenticated, continue with locale handling
  return intlMiddleware(request)
}
