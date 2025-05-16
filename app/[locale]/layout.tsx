// app/[locale]/layout.tsx
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import { Layout } from '@/components/layout'
import { NextIntlClientProvider } from 'next-intl'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { routing } from '@/i18n/routing'
import { getMessages } from 'next-intl/server'
import { isAuthenticated } from '@/lib/auth' // Use our new auth utility instead of getSession
import '../globals.css'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { QueryProvider } from '@/components/providers/query-provider'
import { AuthProvider } from '@/contexts/auth-context'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Navigator - Admin Dashboard',
  description: 'Admin dashboard for Navigator system',
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  // Ensure that the incoming `locale` is valid using hasLocale
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  // Get messages for the current locale
  const messages = await getMessages()

  // Check if the user is logged in using our new auth utility
  const isLoggedIn = await isAuthenticated()

  // Extract the current path from children or URL
  // to determine if we're on a login page
  const isLoginPage =
    children?.toString().includes('/login') ||
    children?.toString().includes('/login-casso')

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider
            attribute='class'
            defaultTheme='system'
            enableSystem
            disableTransitionOnChange>
            <QueryProvider>
              <AuthProvider>
                {isLoggedIn && !isLoginPage ? (
                  <Layout>{children}</Layout>
                ) : (
                  children
                )}
              </AuthProvider>
            </QueryProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
