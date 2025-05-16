// app/[locale]/login/layout.tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login - Navigator',
  description: 'Login to Navigator Admin Dashboard',
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-950 dark:to-primary-900 p-4'>
      <div className='w-full max-w-md bg-background rounded-2xl shadow-xl overflow-hidden'>
        {children}
      </div>
    </div>
  )
}
