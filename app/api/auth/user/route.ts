// app/api/auth/user/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // Get user data from cookie - using async cookies() in Next.js 15
    const cookieStore = await cookies()
    const isLoggedIn = cookieStore.get('logged-in')?.value === 'true'

    if (!isLoggedIn) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const userSession = cookieStore.get('user-session')?.value

    if (!userSession) {
      return NextResponse.json(
        { success: false, error: 'Invalid session' },
        { status: 401 }
      )
    }

    try {
      const userData = JSON.parse(userSession)
      return NextResponse.json({
        success: true,
        user: userData,
      })
    } catch (error) {
      console.error('Error parsing user session:', error)
      return NextResponse.json(
        { success: false, error: 'Invalid session data' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('User API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get user data' },
      { status: 500 }
    )
  }
}
