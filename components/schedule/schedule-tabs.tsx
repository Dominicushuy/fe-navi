// components/schedule/schedule-tabs.tsx
'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { JobType, ScheduleTable } from './schedule-table'

/**
 * Tabs component for switching between CAD Navigator and CVer
 */
export function ScheduleTabs() {
  const t = useTranslations('Schedule')
  const [activeTab, setActiveTab] = React.useState<JobType>('NAVI')

  return (
    <div className='space-y-4'>
      <div className='border-b flex'>
        <button
          onClick={() => setActiveTab('NAVI')}
          className={cn(
            'px-4 py-2 border-b-2 transition-colors',
            activeTab === 'NAVI'
              ? 'border-primary text-primary font-medium'
              : 'border-transparent hover:border-muted-foreground/40'
          )}>
          {t('cadNavigator')}
        </button>
        <button
          onClick={() => setActiveTab('CVER')}
          className={cn(
            'px-4 py-2 border-b-2 transition-colors',
            activeTab === 'CVER'
              ? 'border-primary text-primary font-medium'
              : 'border-transparent hover:border-muted-foreground/40'
          )}>
          {t('cVer')}
        </button>
      </div>

      <ScheduleTable jobType={activeTab} />
    </div>
  )
}
