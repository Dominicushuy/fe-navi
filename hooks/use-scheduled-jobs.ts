// hooks/use-scheduled-jobs.ts
'use client'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { ScheduledJobResponse } from '@/actions/schedule'

interface UseScheduledJobsOptions {
  initialPage?: number
  initialLimit?: number
  initialSearch?: string
}

/**
 * Hook for fetching scheduled jobs with pagination and search
 */
export function useScheduledJobs(
  jobType: 'NAVI' | 'CVER',
  options: UseScheduledJobsOptions = {}
) {
  // Get initial values from options with defaults
  const { initialPage = 1, initialLimit = 20, initialSearch = '' } = options

  // State for pagination and filtering
  const [page, setPage] = useState(initialPage)
  const [search, setSearch] = useState(initialSearch)
  const [limit, setLimit] = useState(initialLimit)

  // Query function to fetch data
  const fetchJobs = async (): Promise<ScheduledJobResponse> => {
    const response = await fetch(
      `/api/schedule/jobs?jobType=${jobType}&page=${page}&limit=${limit}&search=${encodeURIComponent(
        search
      )}`
    )

    if (!response.ok) {
      throw new Error('Failed to fetch scheduled jobs')
    }

    return response.json()
  }

  // Use React Query to fetch and cache the data
  const queryResult = useQuery<ScheduledJobResponse, Error>({
    queryKey: ['scheduledJobs', jobType, page, limit, search],
    queryFn: fetchJobs,
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes
    retry: 1, // Only retry once
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
