// components/auth/LoginForm.tsx
'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter, useSearchParams } from 'next/navigation'
import { FormEvent, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { DEFAULT_PAGE } from '@/constants/router'
import { CassoLogo, CassoLoginButton } from './CassoComponents' // Import the components

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
  const { login, isLoading, error: authError } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const isDevelopment = process.env.NODE_ENV === 'development'

  const callbackUrl = searchParams.get('callbackUrl') || `/${DEFAULT_PAGE}`

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const form = e.currentTarget
    const username = form.username.value
    const password = form.password.value

    if (!username || !password) {
      setError('Username and password are required')
      return
    }

    await login(username, password, callbackUrl)
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

          {(error || authError) && (
            <p className='text-red-500 text-sm text-center mt-2'>
              {error || authError}
            </p>
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
        <CassoLoginButton loginText={translations.login} />
      )}
    </>
  )
}
