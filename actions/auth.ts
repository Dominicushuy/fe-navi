// actions/auth.ts
'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

/**
 * Server action for logging in with username and password
 */
export async function loginWithCredentials(formData: FormData) {
  try {
    const username = formData.get('username') as string
    const password = formData.get('password') as string
    const callbackUrl = (formData.get('callbackUrl') as string) || '/'

    if (!username || !password) {
      return {
        success: false,
        error: 'Username and password are required',
      }
    }

    // Call the login API
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/auth/login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        // Needed for server actions to make requests to its own API routes
        cache: 'no-store',
      }
    )

    const data = await response.json()

    if (!response.ok || !data.success) {
      return {
        success: false,
        error: data.error || 'Invalid credentials',
      }
    }

    return {
      success: true,
      redirectUrl: callbackUrl,
      user: data.user,
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred',
    }
  }
}

/**
 * Server action for logging in with Casso SSO
 */
export async function loginWithCasso(employeeId: string, cassoToken: string) {
  try {
    if (!employeeId || !cassoToken) {
      return {
        success: false,
        error: 'Employee ID and Casso token are required',
      }
    }

    // Call the Casso login API
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/auth/casso`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          'employee-id': employeeId,
          'casso-token': cassoToken,
        }),
        // Needed for server actions to make requests to its own API routes
        cache: 'no-store',
      }
    )

    const data = await response.json()

    if (!response.ok || !data.success) {
      return {
        success: false,
        error: data.error || 'Invalid Casso credentials',
      }
    }

    return {
      success: true,
      redirectUrl: '/',
      user: data.user,
    }
  } catch (error) {
    console.error('Casso authentication error:', error)
    return {
      success: false,
      error: 'An error occurred during Casso authentication',
    }
  }
}

/**
 * Server action for logging out
 */
export async function logout() {
  try {
    // Call the logout API
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/auth/logout`, {
      method: 'POST',
      // Needed for server actions to make requests to its own API routes
      cache: 'no-store',
    })
  } catch (error) {
    console.error('Logout error:', error)
  }

  // Redirect to login page
  redirect('/login')
}
