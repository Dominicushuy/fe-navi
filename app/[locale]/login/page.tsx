// app/[locale]/login/page.tsx
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import LoginForm from '@/components/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Login - Navigator',
  description: 'Login to Navigator Admin Dashboard',
}

export default async function LoginPage() {
  // Get translations on the server
  const t = await getTranslations('Auth')

  // Pre-translate the strings we need
  const translations = {
    username: t('username'),
    password: t('password'),
    enterUsername: t('enterUsername'),
    enterPassword: t('enterPassword'),
    login: t('login'),
    loggingIn: t('loggingIn'),
    loginError: t('loginError'),
  }

  return (
    <div className='p-8 flex flex-col items-center'>
      <LoginForm translations={translations} />
    </div>
  )
}
