// components/schedule/server-schedule-tabs.tsx
'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { JobType, ServerScheduleTable } from './server-schedule-table'
import { ScheduledJob } from '@/actions/schedule'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { createQueryString } from '@/lib/url-utils'

interface ServerScheduleTabsProps {
  jobType: JobType
  data: ScheduledJob[]
  pagination: {
    pageCount: number
    page: number
    limit: number
  }
  totalCount: number
  searchValue: string
}

/**
 * Server-side rendered tabs component for switching between job types
 * Uses URL-based navigation for preserving tab state during page refresh
 */
export function ServerScheduleTabs({
  jobType,
  data,
  pagination,
  totalCount,
  searchValue,
}: ServerScheduleTabsProps) {
  const t = useTranslations('Schedule')
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Handle tab change
  const handleTabChange = (newJobType: JobType) => {
    if (newJobType === jobType) return

    // Create a new URL with the new job type and reset page to 1
    const queryString = createQueryString(searchParams, {
      jobType: newJobType,
      page: 1, // Reset to first page when changing tabs
    })
    router.push(`${pathname}${queryString}`)
  }

  return (
    <div className='space-y-4'>
      <div className='border-b flex'>
        <button
          onClick={() => handleTabChange('NAVI')}
          className={cn(
            'px-4 py-2 border-b-2 transition-colors',
            jobType === 'NAVI'
              ? 'border-primary text-primary font-medium'
              : 'border-transparent hover:border-muted-foreground/40'
          )}>
          {t('cadNavigator')}
        </button>
        <button
          onClick={() => handleTabChange('CVER')}
          className={cn(
            'px-4 py-2 border-b-2 transition-colors',
            jobType === 'CVER'
              ? 'border-primary text-primary font-medium'
              : 'border-transparent hover:border-muted-foreground/40'
          )}>
          {t('cVer')}
        </button>
      </div>

      <ServerScheduleTable
        jobType={jobType}
        data={data}
        pagination={pagination}
        totalCount={totalCount}
        searchValue={searchValue}
      />
    </div>
  )
}
