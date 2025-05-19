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
 * Namespace for authentication utilities
 */
export const auth = {
  /**
   * Get the current user from the session
   * Use this in server components to access the current user
   */
  async getCurrentUser(): Promise<User | null> {
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
  },

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const cookieStore = await cookies()
    return cookieStore.get('logged-in')?.value === 'true'
  },

  /**
   * Protect a route by requiring authentication
   * Use this in server components to protect routes
   * Returns the user if authenticated, redirects to login if not
   */
  async requireAuth(redirectPath?: string) {
    const user = await this.getCurrentUser()

    if (!user) {
      const path = redirectPath
        ? `/login?callbackUrl=${encodeURIComponent(redirectPath)}`
        : '/login'
      redirect(path)
    }

    return user
  },

  /**
   * Get the authorization header with the access token
   */
  async getAuthHeader(): Promise<HeadersInit> {
    const user = await this.getCurrentUser()

    if (!user?.access) {
      return {}
    }

    return {
      Authorization: `Bearer ${user.access}`,
    }
  },
}

// Export backwards-compatible individual functions for existing code
export const getCurrentUser = auth.getCurrentUser
export const isAuthenticated = auth.isAuthenticated
export const requireAuth = auth.requireAuth
export const getAuthHeader = auth.getAuthHeader
