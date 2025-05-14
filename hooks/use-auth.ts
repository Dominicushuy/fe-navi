// hooks/use-auth.ts
'use client'

import { loginWithCredentials, loginWithCasso, logout } from '@/actions/auth'
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
      const result = await loginWithCredentials(formData)

      if (result.success) {
        queryClient.invalidateQueries()
        router.push(result.redirectUrl || '/')
        router.refresh()
        return true
      } else {
        setError(result.error || 'ログインに失敗しました')
        return false
      }
    } catch (e) {
      setError('エラーが発生しました。もう一度試してください')
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
      const result = await loginWithCasso(employeeId, cassoToken)

      if (result.success) {
        queryClient.invalidateQueries()
        router.push(result.redirectUrl || '/')
        router.refresh()
        return true
      } else {
        setError(result.error || 'Casso認証に失敗しました')
        return false
      }
    } catch (e) {
      setError('エラーが発生しました。もう一度試してください')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  async function handleLogout() {
    setIsLoading(true)

    try {
      await logout()
      queryClient.clear() // Clear all cached queries
    } catch (e) {
      console.error('Logout error:', e)
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
