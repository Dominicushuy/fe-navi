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
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4'>
      <div className='w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden'>
        {children}
      </div>
    </div>
  )
}
