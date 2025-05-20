// components/auth/LoginForm.tsx
'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter, useSearchParams } from 'next/navigation'
import { FormEvent, useState, useEffect } from 'react'
import { loginWithCredentials } from '@/actions/auth'
import { DEFAULT_PAGE } from '@/constants/router'
import { CassoLogo, CassoLoginButton } from './CassoComponents'

// Define the translations interface
interface Translations {
  username: string
  password: string
  enterUsername: string
  enterPassword: string
  login: string
  loggingIn: string
  loginError: string
}

interface LoginFormProps {
  translations: Translations
}

export default function LoginForm({ translations }: LoginFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDevelopment, setIsDevelopment] = useState(false)

  // Check if we're in development environment
  useEffect(() => {
    // You can't directly access process.env.NODE_ENV in client components
    setIsDevelopment(
      window.location.hostname === 'localhost' ||
        window.location.protocol === 'http:'
    )
  }, [])

  const callbackUrl = searchParams.get('callbackUrl') || `/${DEFAULT_PAGE}`

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.append('callbackUrl', callbackUrl)

    try {
      // Direct server action call
      const result = await loginWithCredentials(formData)

      if (result.success) {
        router.push(result.redirectUrl || `/${DEFAULT_PAGE}`)
        router.refresh()
      } else {
        setError(result.error || 'Login failed')

        // Handle redirect to Casso if needed
        if (result.redirectUrl) {
          window.location.href = result.redirectUrl
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('An error occurred during login. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Logo Section */}
      <CassoLogo />

      {/* Content Section */}
      {isDevelopment ? (
        <form onSubmit={handleSubmit} className='w-full space-y-6'>
          <div className='space-y-4'>
            <div>
              <label
                htmlFor='username'
                className='block text-sm font-medium text-gray-700 mb-2'>
                {translations.username}
              </label>
              <Input
                id='username'
                type='text'
                name='username'
                required
                placeholder={translations.enterUsername}
                className='w-full'
              />
            </div>

            <div>
              <label
                htmlFor='password'
                className='block text-sm font-medium text-gray-700 mb-2'>
                {translations.password}
              </label>
              <Input
                id='password'
                type='password'
                name='password'
                required
                placeholder={translations.enterPassword}
                className='w-full'
              />
            </div>
          </div>

          {error && (
            <p className='text-red-500 text-sm text-center mt-2'>{error}</p>
          )}

          <Button
            type='submit'
            disabled={isLoading}
            className='w-full py-6'
            variant='default'>
            {isLoading ? translations.loggingIn : translations.login}
          </Button>
        </form>
      ) : (
        // In production, only show Casso login option
        <CassoLoginButton loginText={translations.login} />
      )}
    </>
  )
}
