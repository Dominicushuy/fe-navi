// components/tables/server-tabs.tsx
import Link from 'next/link'
import { cn } from '@/lib/utils'

export interface Tab {
  id: string
  label: string
}

interface ServerTabsProps {
  tabs: Tab[]
  currentTab: string
  basePath: string
  search?: string
  page?: number
  limit?: number
  additionalParams?: Record<string, string>
}

/**
 * Server-side rendered tabs for content type selection
 * This is not a client component and doesn't use 'use client'
 */
export function ServerTabs({
  tabs,
  currentTab,
  basePath,
  search = '',
  page = 1,
  limit = 10,
  additionalParams = {},
}: ServerTabsProps) {
  // Create URL for a tab
  const createTabUrl = (tabId: string) => {
    const params = new URLSearchParams({
      ...(search ? { search } : {}),
      // Reset to page 1 when switching tabs
      page: '1',
      limit: limit.toString(),
      ...additionalParams,
      // Override entityType with the new tab ID
      entityType: tabId,
    })

    return `${basePath}?${params.toString()}`
  }

  return (
    <div className='border-b flex mb-4'>
      {tabs.map((tab) => (
        <Link
          key={tab.id}
          href={createTabUrl(tab.id)}
          className={cn(
            'px-4 py-2 border-b-2 transition-colors',
            tab.id === currentTab
              ? 'border-primary text-primary font-medium'
              : 'border-transparent hover:border-muted-foreground/40'
          )}>
          {tab.label}
        </Link>
      ))}
    </div>
  )
}
