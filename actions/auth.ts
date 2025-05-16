// actions/auth.ts
'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

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
 * In development: Direct login without API call
 * In production: Redirects to Casso login (should not be used directly)
 */
export async function loginWithCredentials(
  formData: FormData
): Promise<AuthResult> {
  const username = formData.get('username') as string
  const password = formData.get('password') as string
  const callbackUrl = (formData.get('callbackUrl') as string) || '/'

  if (!username || !password) {
    return {
      success: false,
      error: 'Username and password are required',
    }
  }

  try {
    const nodeEnv = process.env.NODE_ENV || 'development'
    const isDevelopment = nodeEnv === 'development'

    // DEVELOPMENT MODE - Allow direct username/password login
    if (isDevelopment) {
      // Simple dev authentication - any username/password is valid
      const userData = {
        id: '1',
        name: username,
        username: username,
        role: 'admin', // Default admin role in development
        access: 'mock-token',
      }

      // Set cookies
      const cookieStore = await cookies()

      cookieStore.set({
        name: 'logged-in',
        value: 'true',
        httpOnly: true,
        path: '/',
        secure: false, // Not secure in development
        maxAge: 60 * 60 * 24 * 7, // 1 week
        sameSite: 'lax',
      })

      cookieStore.set({
        name: 'user-session',
        value: JSON.stringify(userData),
        httpOnly: true,
        path: '/',
        secure: false, // Not secure in development
        maxAge: 60 * 60 * 24 * 7, // 1 week
        sameSite: 'lax',
      })

      return {
        success: true,
        redirectUrl: callbackUrl,
        user: userData,
      }
    }
    // PRODUCTION MODE - Redirect to Casso login
    else {
      const cassoUrl = process.env.NEXT_PUBLIC_CASSO_URL
      if (!cassoUrl) {
        return {
          success: false,
          error: 'Casso URL not configured. Please log in through Casso SSO.',
        }
      }

      // For client-side redirection (we'll return this url)
      return {
        success: false,
        error: 'Direct login not allowed in production. Please use Casso SSO.',
        redirectUrl: cassoUrl,
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
 * In development: Simulated login
 * In production: Actual Casso API authentication
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
    const nodeEnv = process.env.NODE_ENV || 'development'
    const isDevelopment = nodeEnv === 'development'

    // DEVELOPMENT MODE - Simulate Casso login
    if (isDevelopment) {
      const userData = {
        id: employeeId,
        name: 'Casso User',
        username: employeeId,
        role: 'admin', // Default admin role in development
      }

      // Set cookies
      const cookieStore = await cookies()

      cookieStore.set({
        name: 'logged-in',
        value: 'true',
        httpOnly: true,
        path: '/',
        secure: false, // Not secure in development
        maxAge: 60 * 60 * 24 * 7, // 1 week
        sameSite: 'lax',
      })

      cookieStore.set({
        name: 'user-session',
        value: JSON.stringify(userData),
        httpOnly: true,
        path: '/',
        secure: false, // Not secure in development
        maxAge: 60 * 60 * 24 * 7, // 1 week
        sameSite: 'lax',
      })

      return {
        success: true,
        redirectUrl: '/',
        user: userData,
      }
    }
    // PRODUCTION MODE - Real Casso authentication
    else {
      // Get the Casso API URL
      const apiUrl = process.env.NEXT_PRIVATE_API_LOGIN_URL

      if (!apiUrl) {
        return {
          success: false,
          error: 'Casso API URL is not configured',
        }
      }

      // Ensure proper URL construction
      let fullApiUrl: string
      try {
        fullApiUrl = apiUrl
      } catch (e) {
        console.error('Invalid Casso API URL:', apiUrl, e)
        return {
          success: false,
          error: 'Server configuration error - invalid API URL',
        }
      }

      const response = await fetch(fullApiUrl, {
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

      // Set cookies
      const cookieStore = await cookies()

      cookieStore.set({
        name: 'logged-in',
        value: 'true',
        httpOnly: true,
        path: '/',
        secure: true, // Secure in production
        maxAge: 60 * 60 * 24 * 7, // 1 week
        sameSite: 'lax',
      })

      cookieStore.set({
        name: 'user-session',
        value: JSON.stringify(userData),
        httpOnly: true,
        path: '/',
        secure: true, // Secure in production
        maxAge: 60 * 60 * 24 * 7, // 1 week
        sameSite: 'lax',
      })

      return {
        success: true,
        redirectUrl: '/',
        user: userData,
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
 * Get current user from server-side
 */
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies() // Updated for async cookies
    const isLoggedIn = cookieStore.get('logged-in')?.value === 'true'

    if (!isLoggedIn) {
      return { user: null }
    }

    const userSession = cookieStore.get('user-session')?.value

    if (!userSession) {
      return { user: null }
    }

    return { user: JSON.parse(userSession) }
  } catch (error) {
    console.error('Error getting current user:', error)
    return { user: null }
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
