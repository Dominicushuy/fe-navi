// components/auth/CassoLoginRedirect.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DEFAULT_PAGE } from '@/constants/router'
import { CassoLogo } from './LoginForm'
import { Button } from '@/components/ui/button'
import { useQueryClient } from '@tanstack/react-query'

interface CassoTranslations {
  loading: string
  loginError: string
  authInfoMissing: string
  backToLogin: string
}

export default function CassoLoginRedirect({
  employeeId,
  cassoToken,
  loginAction,
  translations,
}: {
  employeeId: string
  cassoToken: string
  loginAction: (
    employeeId: string,
    cassoToken: string
  ) => Promise<{
    success: boolean
    error?: string
    redirectUrl?: string
  }>
  translations: CassoTranslations
}) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function handleCassoLogin() {
      if (!employeeId || !cassoToken) {
        setError(translations.authInfoMissing)
        setIsLoading(false)
        return
      }

      try {
        const result = await loginAction(employeeId, cassoToken)

        if (result.success) {
          // Set the auth cookie client-side as well
          document.cookie = `logged-in=true; path=/; max-age=${
            60 * 60 * 24 * 7
          }; SameSite=Lax`

          // Invalidate queries to refetch fresh data after login
          queryClient.invalidateQueries()
          router.push(result.redirectUrl || `/${DEFAULT_PAGE}`)
          router.refresh()
        } else {
          setError(result.error || translations.loginError)
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Casso login error:', error)
        setError(translations.loginError)
        setIsLoading(false)
      }
    }

    handleCassoLogin()
  }, [employeeId, cassoToken, router, loginAction, queryClient, translations])

  return (
    <div className='flex flex-col items-center w-full'>
      <CassoLogo />

      {isLoading ? (
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4'></div>
          <p className='text-lg font-medium'>{translations.loading}</p>
        </div>
      ) : error ? (
        <div className='text-center'>
          <p className='text-red-500 mb-4'>{error}</p>
          <Button onClick={() => router.push('/login')} className='w-full'>
            {translations.backToLogin}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
