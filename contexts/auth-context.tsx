// contexts/auth-context.tsx
'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'

// User type
interface User {
  id: string
  name: string
  username: string
  role: string
  access?: string
}

// Auth context state
interface AuthContextState {
  user: User | null
  isLoading: boolean
  error: string | null
  login: (
    username: string,
    password: string,
    callbackUrl?: string
  ) => Promise<boolean>
  loginCasso: (employeeId: string, cassoToken: string) => Promise<boolean>
  logout: () => Promise<void>
}

// Create context
const AuthContext = createContext<AuthContextState | undefined>(undefined)

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const queryClient = useQueryClient()

  // Fetch the current user data on mount
  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch('/api/auth/user')

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.user) {
            setUser(data.user)
          } else {
            setUser(null)
          }
        } else {
          setUser(null)
        }
      } catch (e) {
        console.error('Error fetching user:', e)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [])

  // Login function
  async function login(
    username: string,
    password: string,
    callbackUrl?: string
  ): Promise<boolean> {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Set the user data
        setUser(data.user)

        // Invalidate queries to refresh data
        queryClient.invalidateQueries()

        // Navigate to the callback URL or default
        router.push(callbackUrl || '/')
        router.refresh()

        return true
      } else {
        setError(data.error || 'Login failed')
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

  // Casso login function
  async function loginCasso(
    employeeId: string,
    cassoToken: string
  ): Promise<boolean> {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/casso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          'employee-id': employeeId,
          'casso-token': cassoToken,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Set the user data
        setUser(data.user)

        // Invalidate queries to refresh data
        queryClient.invalidateQueries()

        // Navigate to home
        router.push('/')
        router.refresh()

        return true
      } else {
        setError(data.error || 'Casso authentication failed')
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
  async function handleLogout(): Promise<void> {
    setIsLoading(true)

    try {
      await fetch('/api/auth/logout', { method: 'POST' })

      // Clear user data
      setUser(null)

      // Clear all cached queries
      queryClient.clear()

      // Navigate to login
      router.push('/login')
      router.refresh()
    } catch (e) {
      console.error('Logout error:', e)
    } finally {
      setIsLoading(false)
    }
  }

  // Context value
  const value: AuthContextState = {
    user,
    isLoading,
    error,
    login,
    loginCasso,
    logout: handleLogout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
