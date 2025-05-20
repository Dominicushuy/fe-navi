// lib/react-query-utils.ts
'use client'

import { QueryClient } from '@tanstack/react-query'

/**
 * Create a query client with default settings
 */
export function createQueryClient(options = {}) {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Don't refetch on window focus by default
        refetchOnWindowFocus: false,

        // Consider data fresh for 60 seconds by default
        staleTime: 1000 * 60,

        // Default retry behavior
        retry: 1,
      },
    },
    ...options,
  })
}

/**
 * Prefetch server side data and hydrate client side query cache
 * @param client QueryClient instance
 * @param queryKey Query key to prefetch
 * @param queryFn Query function that returns a Promise
 */
export async function prefetchQuery<T>(
  client: QueryClient,
  queryKey: unknown[],
  queryFn: () => Promise<T>,
  options = {}
) {
  // Prefetch the query on the server
  const data = await queryFn()

  // Set the data in the query cache
  client.setQueryData(queryKey, data)

  // Return the data
  return data
}
