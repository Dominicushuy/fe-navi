// contexts/auth-context.tsx
'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { useAuth as useAuthHook } from '@/hooks/use-auth'
import { useQuery } from '@tanstack/react-query'

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
  const auth = useAuthHook()

  // Use React Query to fetch user data
  const {
    data,
    isLoading: isUserLoading,
    error: userError,
  } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/auth/user')
        if (!response.ok) {
          // If we get a 401, the token is likely expired
          if (response.status === 401) {
            // Client-side logout
            document.cookie =
              'logged-in=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax'
            document.cookie =
              'user-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax'
            window.location.href = '/login'
            return { user: null }
          }
          return { user: null }
        }
        return await response.json()
      } catch (error) {
        console.error('Error fetching user:', error)
        return { user: null }
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: 1, // Only retry once
  })

  // Context value
  const value: AuthContextState = {
    user: data?.user || null,
    isLoading: isUserLoading || auth.isLoading,
    error:
      auth.error || (userError instanceof Error ? userError.message : null),
    login: auth.login,
    loginCasso: auth.loginCasso,
    logout: auth.logout,
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
