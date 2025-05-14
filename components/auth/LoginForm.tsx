// components/auth/LoginForm.tsx
'use client'

import { loginWithCredentials } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { DEFAULT_PAGE } from '@/constants/router'
import { Input } from '@/components/ui/input'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

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
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const isDevelopment = process.env.NODE_ENV === 'development'

  const callbackUrl = searchParams.get('callbackUrl') || `/${DEFAULT_PAGE}`

  async function handleSubmit(formData: FormData) {
    setError(null)

    startTransition(async () => {
      const result = await loginWithCredentials(formData)

      if (result.success) {
        // IMPORTANT: Set the cookie client-side as well to ensure it's available immediately
        document.cookie = `logged-in=true; path=/; max-age=${
          60 * 60 * 24 * 7
        }; SameSite=Lax`

        // Invalidate queries to refetch fresh data
        queryClient.invalidateQueries()

        // Navigate to the callback URL or default page
        router.push(result.redirectUrl || `/${DEFAULT_PAGE}`)
        router.refresh()
      } else {
        setError(result.error || translations.loginError)
      }
    })
  }

  return (
    <>
      {/* Logo Section */}
      <CassoLogo />

      {/* Content Section */}
      {isDevelopment ? (
        <form action={handleSubmit} className='w-full space-y-6'>
          <input type='hidden' name='callbackUrl' value={callbackUrl} />

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
            disabled={isPending}
            className='w-full py-6'
            variant='default'>
            {isPending ? translations.loggingIn : translations.login}
          </Button>
        </form>
      ) : (
        <CassoLoginButton loginText={translations.login} />
      )}
    </>
  )
}

// Component Logo
export function CassoLogo() {
  const handleLogoClick = () => {
    if (process.env.NEXT_PUBLIC_CASSO_URL) {
      window.open(
        process.env.NEXT_PUBLIC_CASSO_URL,
        '_blank',
        'noopener,noreferrer'
      )
    }
  }

  return (
    <div className='mb-8'>
      <Image
        src='/images/casso-logo.svg'
        width={150}
        height={150}
        alt='Casso Logo'
        onClick={handleLogoClick}
        className={`  
          ${
            process.env.NEXT_PUBLIC_CASSO_URL
              ? 'cursor-pointer'
              : 'cursor-default'
          }  
          hover:scale-110 transition-transform duration-300  
        `}
      />
    </div>
  )
}

// Component Button for Casso
export function CassoLoginButton({ loginText }: { loginText: string }) {
  const router = useRouter()

  return (
    <Button
      className='w-full px-4 py-6 bg-primary text-primary-foreground'
      onClick={() => router.push(process.env.NEXT_PUBLIC_CASSO_URL || '')}>
      <span className='text-xl font-bold'>{loginText}</span>
    </Button>
  )
}
