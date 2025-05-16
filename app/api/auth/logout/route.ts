// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Create a response for logout
    const response = NextResponse.json({ success: true })

    // Clear the auth cookies
    response.cookies.set({
      name: 'logged-in',
      value: '',
      expires: new Date(0),
      path: '/',
    })

    response.cookies.set({
      name: 'user-session',
      value: '',
      expires: new Date(0),
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Logout API error:', error)
    return NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    )
  }
}
