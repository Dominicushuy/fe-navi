// lib/session.ts
import { getSession } from './auth'
import { redirect } from 'next/navigation'

/**
 * Get the current user from the session
 * Use this in server components to access the current user
 */
export async function getCurrentUser() {
  const session = await getSession()
  return session?.user
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
