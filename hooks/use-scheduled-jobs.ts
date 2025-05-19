// hooks/use-scheduled-jobs.ts
'use client'

import { useQuery } from '@tanstack/react-query'
import { getScheduledJobs, ScheduledJobResponse } from '@/actions/schedule'
import { useState } from 'react'

/**
 * Hook for fetching scheduled jobs with pagination and search
 */
export function useScheduledJobs(jobType: 'NAVI' | 'CVER') {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [limit, setLimit] = useState(20)

  const queryResult = useQuery<ScheduledJobResponse, Error>({
    queryKey: ['scheduledJobs', jobType, page, limit, search],
    queryFn: () => getScheduledJobs(jobType, page, limit, search),
    staleTime: 1000 * 60, // 1 minute
    retry: 1, // Only retry once to avoid flooding with requests if there's a persistent issue
  })

  return {
    ...queryResult,
    page,
    setPage,
    search,
    setSearch,
    limit,
    setLimit,
  }
}
