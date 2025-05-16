// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // In development mode, accept simple credentials
    // In production, you would validate against your actual auth system
    let isValidCredentials = false
    let userData = null

    // Production authentication logic
    // Replace with your actual authentication logic against your backend
    try {
      const apiResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/navi/login/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        }
      )

      if (apiResponse.ok) {
        const data = await apiResponse.json()
        if (data.access) {
          isValidCredentials = true
          userData = {
            id: data.id || '1',
            name: data.username || 'User',
            username: data.username,
            role: data.role || 'user',
            access: data.access,
          }
        }
      }
    } catch (error) {
      console.error('API login error:', error)
    }

    if (!isValidCredentials || !userData) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Create a response with auth cookie
    const response = NextResponse.json({
      success: true,
      user: userData,
    })

    // Set the auth cookie
    response.cookies.set({
      name: 'logged-in',
      value: 'true',
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      sameSite: 'lax',
    })

    // Store user data in session
    response.cookies.set({
      name: 'user-session',
      value: JSON.stringify(userData),
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      sameSite: 'lax',
    })

    return response
  } catch (error) {
    console.error('Login API error:', error)
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    )
  }
}
