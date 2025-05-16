// lib/auth.ts
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

// User type definition
export interface User {
  id: string
  name: string
  username: string
  role: string
  access?: string
}

/**
 * Get the current user from the session
 * Use this in server components to access the current user
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const isLoggedIn = cookieStore.get('logged-in')?.value === 'true'

    if (!isLoggedIn) {
      return null
    }

    const userSession = cookieStore.get('user-session')?.value

    if (!userSession) {
      return null
    }

    return JSON.parse(userSession) as User
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  return cookieStore.get('logged-in')?.value === 'true'
}

/**
 * Protect a route by requiring authentication
 * Use this in server components to protect routes
 */
export async function requireAuth() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return user
}
