// hooks/use-server-table.ts
'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { createQueryString } from '@/lib/url-utils'

interface ServerTableOptions {
  initialSearch?: string
  defaultPage?: number
  defaultLimit?: number
}

/**
 * Hook for managing server-side table state with URL parameters
 */
export function useServerTable({
  initialSearch = '',
  defaultPage = 1,
  defaultLimit = 20,
}: ServerTableOptions = {}) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Local state for the search input
  const [search, setSearch] = useState(initialSearch)

  // Update search state when initialSearch prop changes
  useEffect(() => {
    setSearch(initialSearch)
  }, [initialSearch])

  // Handler for search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    // Create new URL with search parameter
    const query = createQueryString(searchParams, {
      search: search || undefined, // Use undefined to remove the param if empty
      page: 1, // Reset to page 1 when searching
    })

    // Navigate to the URL
    router.push(`${pathname}${query}`)
  }

  // Handler for page navigation
  const goToPage = (page: number) => {
    const query = createQueryString(searchParams, { page })
    router.push(`${pathname}${query}`)
  }

  // Handler for changing limit/items per page
  const setLimit = (limit: number) => {
    const query = createQueryString(searchParams, {
      limit,
      page: 1, // Reset to page 1 when changing limit
    })
    router.push(`${pathname}${query}`)
  }

  return {
    search,
    setSearch,
    handleSearch,
    goToPage,
    setLimit,
    currentParams: Object.fromEntries(searchParams.entries()),
  }
}
