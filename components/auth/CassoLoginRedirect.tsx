// components/auth/CassoLoginRedirect.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { loginWithCasso } from '@/actions/auth'
import { CassoLogo } from './CassoComponents'

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
        // Direct server action call
        const result = await loginWithCasso(employeeId, cassoToken)

        if (result.success) {
          router.push(result.redirectUrl || '/')
          router.refresh()
        } else {
          setError(result.error || translations.loginError)
        }
      } catch (error) {
        console.error('Casso login error:', error)
        setError(translations.loginError)
      } finally {
        setIsLoading(false)
      }
    }

    handleCassoLogin()
  }, [employeeId, cassoToken, router, translations])

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
