// actions/server-table.ts
'use server'

import { auth } from '@/lib/auth'

/**
 * Generic type for paginated API responses
 */
export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

/**
 * Core function to fetch paginated data from any API
 */
export async function fetchPaginatedData<T>({
  url,
  queryParams,
  headers = {},
  tag,
  revalidate = 60,
}: {
  url: string
  queryParams: URLSearchParams | Record<string, string>
  headers?: HeadersInit
  tag?: string
  revalidate?: number
}): Promise<PaginatedResponse<T>> {
  // Get auth user and add authorization if available
  const user = await auth.getCurrentUser()
  let authHeaders: HeadersInit = {}

  if (user?.access) {
    authHeaders = {
      Authorization: `Bearer ${user.access}`,
    }
  }

  // Convert queryParams to URLSearchParams if it's not already
  const searchParams =
    queryParams instanceof URLSearchParams
      ? queryParams
      : new URLSearchParams(queryParams as Record<string, string>)

  // Construct the full URL
  const fullUrl = `${url}?${searchParams.toString()}`

  try {
    const response = await fetch(fullUrl, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...authHeaders,
        ...headers,
      },
      next: {
        tags: tag ? [tag] : undefined,
        revalidate,
      },
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      throw new Error(`Error fetching data: ${response.status} ${errorText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Failed to fetch paginated data:', error)
    throw error
  }
}
