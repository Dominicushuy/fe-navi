// app/[locale]/schedule/page.tsx
import { ScheduleTabs } from '@/components/schedule/schedule-tabs'
import { getTranslations } from 'next-intl/server'
import { Metadata } from 'next'
import { Toaster } from '@/components/ui/toast'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Schedule')

  return {
    title: `${t('scheduleJob')} - Navigator`,
    description: t('scheduleJobDescription'),
  }
}

export default async function SchedulePage() {
  const t = await getTranslations('Schedule')

  // Verify the user is authenticated with a valid session
  const user = await auth.getCurrentUser()

  if (!user || !user.access) {
    // If user is not authenticated or no access token, redirect to login
    redirect('/login?callbackUrl=/schedule')
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>
          {t('scheduleJob')}
        </h1>
        <p className='text-muted-foreground'>{t('scheduleJobDescription')}</p>
      </div>

      <ScheduleTabs />
      <Toaster />
    </div>
  )
}
