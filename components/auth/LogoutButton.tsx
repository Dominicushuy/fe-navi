// components/auth/LogoutButton.tsx
'use client'

import { useAuth } from '@/hooks/use-auth'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'

export function LogoutButton() {
  const { logout, isLoading } = useAuth()
  const t = useTranslations('Auth')

  return (
    <Button
      variant='ghost'
      size='icon'
      onClick={logout}
      disabled={isLoading}
      aria-label={t('logOut')}
      className='p-1.5 text-primary-300 hover:text-primary-100 rounded-md transition-colors'>
      <LogOut className='size-4' />
    </Button>
  )
}
