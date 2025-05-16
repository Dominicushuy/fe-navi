// components/auth/CassoComponents.tsx
'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

/**
 * Casso logo component with optional click handler
 */
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

/**
 * Casso login button with redirect to Casso SSO
 */
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
