// app/[locale]/schedule/page.tsx
import { ServerScheduleTabs } from '@/components/schedule/server-schedule-tabs'
import { getTranslations } from 'next-intl/server'
import { Metadata } from 'next'
import { Toaster } from '@/components/ui/toast'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getScheduledJobs } from '@/actions/schedule'
import { parseTableParams } from '@/lib/url-utils'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Schedule')

  return {
    title: `${t('scheduleJob')} - Navigator`,
    description: t('scheduleJobDescription'),
  }
}

interface SchedulePageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function SchedulePage({
  searchParams,
}: SchedulePageProps) {
  const t = await getTranslations('Schedule')

  // Verify the user is authenticated with a valid session
  const user = await auth.getCurrentUser()

  if (!user || !user.access) {
    // If user is not authenticated or no access token, redirect to login
    redirect('/login?callbackUrl=/schedule')
  }

  // Parse search parameters directly from searchParams
  const { page, limit, search } = parseTableParams(searchParams)

  // Get job type from search params or default to 'NAVI'
  // Handle both string and string[] cases
  let jobType: 'NAVI' | 'CVER' = 'NAVI'
  if (searchParams.jobType) {
    const jobTypeParam = Array.isArray(searchParams.jobType)
      ? searchParams.jobType[0]
      : searchParams.jobType

    if (jobTypeParam === 'CVER') {
      jobType = 'CVER'
    }
  }

  // Fetch data using server action
  const jobsData = await getScheduledJobs(jobType, page, limit, search)

  // Calculate page count
  const pageCount = Math.ceil(jobsData.count / limit)

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>
          {t('scheduleJob')}
        </h1>
        <p className='text-muted-foreground'>{t('scheduleJobDescription')}</p>
      </div>

      <ServerScheduleTabs
        jobType={jobType}
        data={jobsData.results}
        pagination={{
          pageCount,
          page,
          limit,
        }}
        totalCount={jobsData.count}
        searchValue={search}
      />
      <Toaster />
    </div>
  )
}
