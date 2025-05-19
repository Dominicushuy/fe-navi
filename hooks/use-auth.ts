// hooks/use-auth.ts
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'

export function useAuth() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Login with username/password
  async function login(
    username: string,
    password: string,
    callbackUrl?: string
  ) {
    setIsLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('username', username)
    formData.append('password', password)
    if (callbackUrl) {
      formData.append('callbackUrl', callbackUrl)
    }

    try {
      // Make a server action call
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password, callbackUrl }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (result.success) {
        // Set client-side cookie for immediate effect
        document.cookie = `logged-in=true; path=/; max-age=${
          60 * 60 * 24 * 7
        }; SameSite=Lax`

        // Invalidate queries to refresh data
        queryClient.invalidateQueries({
          queryKey: ['user'],
        })

        router.push(result.redirectUrl || '/')
        router.refresh()
        return true
      } else {
        // If we have a redirectUrl, it means we need to redirect to Casso in production
        if (result.redirectUrl) {
          window.location.href = result.redirectUrl
          return false
        }

        setError(result.error || 'Login failed')
        return false
      }
    } catch (e) {
      console.error('Login error:', e)
      setError('An error occurred. Please try again.')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Login with Casso
  async function loginCasso(employeeId: string, cassoToken: string) {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/casso', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'employee-id': employeeId,
          'casso-token': cassoToken,
        }),
      })

      const result = await response.json()

      if (result.success) {
        // Set client-side cookie for immediate effect
        document.cookie = `logged-in=true; path=/; max-age=${
          60 * 60 * 24 * 7
        }; SameSite=Lax`

        // Invalidate queries to refresh data
        queryClient.invalidateQueries({
          queryKey: ['user'],
        })

        router.push(result.redirectUrl || '/')
        router.refresh()
        return true
      } else {
        setError(result.error || 'Casso authentication failed')
        return false
      }
    } catch (e) {
      console.error('Casso login error:', e)
      setError('An error occurred. Please try again.')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  async function handleLogout() {
    setIsLoading(true)

    try {
      // Clear client-side cookies for immediate effect
      document.cookie =
        'logged-in=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax'
      document.cookie =
        'user-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax'

      // Clear all cached queries
      queryClient.clear()

      // Call logout API endpoint
      await fetch('/api/auth/logout', {
        method: 'POST',
      })

      // Redirect to login page
      router.push('/login')
      router.refresh()
    } catch (e) {
      console.error('Logout error:', e)
      // Fallback client-side redirect if API call fails
      router.push('/login')
      router.refresh()
    } finally {
      setIsLoading(false)
    }
  }

  return {
    login,
    loginCasso,
    logout: handleLogout,
    isLoading,
    error,
  }
}
