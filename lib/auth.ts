// lib/auth.ts
import { getServerSession } from 'next-auth'
import { authConfig } from './auth.config'
import { redirect } from 'next/navigation'

/**
 * Get the session in server components
 */
export async function getSession() {
  return getServerSession(authConfig)
}

/**
 * Get the current user from the session
 * Use this in server components to access the current user
 */
export async function getCurrentUser() {
  const session = await getSession()
  return session?.user
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated() {
  const session = await getSession()
  return !!session?.user
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

// Export auth config for use in API routes
export { authConfig }

// Export helper functions for client components
export { signIn, signOut } from 'next-auth/react'
