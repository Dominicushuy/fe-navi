// actions/auth.ts
'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { DEFAULT_PAGE } from '@/constants/router'

/**
 * Result type for auth operations
 */
export interface AuthResult {
  success: boolean
  error?: string
  redirectUrl?: string
  user?: any
}

/**
 * Login with username and password
 */
export async function loginWithCredentials(
  formData: FormData
): Promise<AuthResult> {
  const username = formData.get('username') as string
  const password = formData.get('password') as string
  const callbackUrl =
    (formData.get('callbackUrl') as string) || `/${DEFAULT_PAGE}`

  if (!username || !password) {
    return {
      success: false,
      error: 'Username and password are required',
    }
  }

  try {
    const isDevelopment = process.env.NODE_ENV === 'development'
    const apiUrl = isDevelopment
      ? `${process.env.NEXT_PUBLIC_API_URL}/navi/login/`
      : `${process.env.NEXT_PRIVATE_API_URL}/navi/login/`

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        cache: 'no-store',
      })

      if (!response.ok) {
        // If the direct API call didn't work, redirect to Casso SSO in production
        if (!isDevelopment) {
          const cassoUrl = process.env.NEXT_PUBLIC_CASSO_URL
          if (cassoUrl) {
            return {
              success: false,
              redirectUrl: cassoUrl,
              error: 'Please use Casso SSO to login',
            }
          }
        }

        return {
          success: false,
          error: 'Invalid credentials',
        }
      }

      const data = await response.json()

      if (!data.access) {
        return {
          success: false,
          error: 'Invalid response from authentication server',
        }
      }

      // Authentication successful, create user data
      const userData = {
        id: data.id || '1',
        name: data.username || username,
        username: data.username || username,
        role: data.role || 'user',
        access: data.access,
      }

      // Set cookies - using async cookies() in Next.js 15
      const cookieStore = await cookies()

      cookieStore.set({
        name: 'logged-in',
        value: 'true',
        httpOnly: true,
        path: '/',
        secure: !isDevelopment,
        maxAge: 60 * 60 * 24 * 7, // 1 week
        sameSite: 'lax',
      })

      cookieStore.set({
        name: 'user-session',
        value: JSON.stringify(userData),
        httpOnly: true,
        path: '/',
        secure: !isDevelopment,
        maxAge: 60 * 60 * 24 * 7, // 1 week
        sameSite: 'lax',
      })

      return {
        success: true,
        redirectUrl: callbackUrl,
        user: userData,
      }
    } catch (error) {
      console.error('Login API error:', error)

      // Fallback to Casso SSO in production
      if (!isDevelopment) {
        const cassoUrl = process.env.NEXT_PUBLIC_CASSO_URL
        if (cassoUrl) {
          return {
            success: false,
            redirectUrl: cassoUrl,
            error: 'Direct login failed. Redirecting to Casso SSO.',
          }
        }
      }

      return {
        success: false,
        error: 'An error occurred during authentication',
      }
    }
  } catch (error) {
    console.error('Login error:', error)
    return {
      success: false,
      error: 'An error occurred during authentication',
    }
  }
}

/**
 * Login with Casso
 * This should only be used in production, but we'll handle both environments
 */
export async function loginWithCasso(
  employeeId: string,
  cassoToken: string
): Promise<AuthResult> {
  if (!employeeId || !cassoToken) {
    return {
      success: false,
      error: 'Employee ID and Casso token are required',
    }
  }

  try {
    const isDevelopment = process.env.NODE_ENV === 'development'

    // Get the Casso API URL
    const apiUrl = process.env.NEXT_PRIVATE_API_LOGIN_URL

    if (!apiUrl) {
      return {
        success: false,
        error: 'Casso API URL is not configured',
      }
    }

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          'employee-id': employeeId,
          'casso-token': cassoToken,
        }),
        cache: 'no-store',
      })

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: 'Invalid credentials' }))
        return {
          success: false,
          error: errorData.message || 'Authentication failed',
        }
      }

      const data = await response.json()

      if (!data.access) {
        return {
          success: false,
          error: 'Invalid response from authentication server',
        }
      }

      // Authentication successful, create user data
      const userData = {
        id: data.id || employeeId,
        name: data.username || 'Casso User',
        username: data.username || employeeId,
        role: data.role || 'user',
        access: data.access,
      }

      // Set cookies - using async cookies() in Next.js 15
      const cookieStore = await cookies()

      cookieStore.set({
        name: 'logged-in',
        value: 'true',
        httpOnly: true,
        path: '/',
        secure: !isDevelopment,
        maxAge: 60 * 60 * 24 * 7, // 1 week
        sameSite: 'lax',
      })

      cookieStore.set({
        name: 'user-session',
        value: JSON.stringify(userData),
        httpOnly: true,
        path: '/',
        secure: !isDevelopment,
        maxAge: 60 * 60 * 24 * 7, // 1 week
        sameSite: 'lax',
      })

      return {
        success: true,
        redirectUrl: `/${DEFAULT_PAGE}`,
        user: userData,
      }
    } catch (error) {
      console.error('Casso API error:', error)
      return {
        success: false,
        error: 'An error occurred during Casso authentication',
      }
    }
  } catch (error) {
    console.error('Casso login error:', error)
    return {
      success: false,
      error: 'An error occurred during Casso authentication',
    }
  }
}

/**
 * Logout the current user
 */
export async function logout() {
  // Clear cookies - using async cookies() in Next.js 15
  const cookieStore = await cookies()

  cookieStore.set({
    name: 'logged-in',
    value: '',
    expires: new Date(0),
    path: '/',
  })

  cookieStore.set({
    name: 'user-session',
    value: '',
    expires: new Date(0),
    path: '/',
  })

  // Redirect to login page
  redirect('/login')
}
