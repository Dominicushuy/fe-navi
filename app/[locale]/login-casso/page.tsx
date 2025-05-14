// app/[locale]/login-casso/page.tsx
import { loginWithCasso } from '@/actions/auth'
import CassoLoginRedirect from '@/components/auth/CassoLoginRedirect'
import { getTranslations } from 'next-intl/server'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Casso Login - Navigator',
  description: 'Login with Casso to Navigator Admin Dashboard',
}

export default async function LoginCassoPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const employeeId = searchParams['employee-id'] as string
  const cassoToken = searchParams['casso-token'] as string

  // Get translations on the server
  const t = await getTranslations('Auth')

  // Pre-translate the strings we need
  const translations = {
    loading: t('loading'),
    loginError: t('loginError'),
    authInfoMissing: t('authInfoMissing'),
    backToLogin: t('backToLogin'),
  }

  return (
    <div className='p-8 flex flex-col items-center'>
      <CassoLoginRedirect
        employeeId={employeeId}
        cassoToken={cassoToken}
        loginAction={loginWithCasso}
        translations={translations}
      />
    </div>
  )
}
