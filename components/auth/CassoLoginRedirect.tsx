// components/auth/CassoLoginRedirect.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { CassoLogo } from './CassoComponents' // Import the CassoLogo component

interface CassoTranslations {
  loading: string
  loginError: string
  authInfoMissing: string
  backToLogin: string
}

export default function CassoLoginRedirect({
  employeeId,
  cassoToken,
  translations,
}: {
  employeeId: string
  cassoToken: string
  translations: CassoTranslations
}) {
  const router = useRouter()
  const { loginCasso, error: authError, isLoading: authLoading } = useAuth()
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
        const success = await loginCasso(employeeId, cassoToken)

        if (!success) {
          setError(authError || translations.loginError)
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Casso login error:', error)
        setError(translations.loginError)
        setIsLoading(false)
      }
    }

    handleCassoLogin()
  }, [employeeId, cassoToken, loginCasso, authError, translations])

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
