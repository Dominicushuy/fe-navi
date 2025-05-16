// app/api/auth/user/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get user data from cookie
    const userSessionCookie = request.cookies.get('user-session')

    if (!userSessionCookie || !userSessionCookie.value) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    try {
      const userData = JSON.parse(userSessionCookie.value)
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
