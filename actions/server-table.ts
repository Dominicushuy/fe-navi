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
 * Options for fetching paginated data
 */
export interface FetchPaginatedDataOptions {
  url: string
  queryParams: URLSearchParams | Record<string, string>
  headers?: HeadersInit
  tag?: string
  revalidate?: number
}

/**
 * Core function to fetch paginated data from any API
 * @param options Configuration for the fetch operation
 * @returns Paginated response data
 */
export async function fetchPaginatedData<T>({
  url,
  queryParams,
  headers = {},
  tag,
  revalidate = 60,
}: FetchPaginatedDataOptions): Promise<PaginatedResponse<T>> {
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

/**
 * Generic helper to create paginated API fetchers for specific entities
 * @param baseUrl Base API URL
 * @param tag Cache tag for revalidation
 * @param defaultParams Default query parameters
 * @returns A function that fetches paginated data with the specified configuration
 */
export function createPaginatedFetcher<T>(
  baseUrl: string,
  tag?: string,
  defaultParams: Record<string, string> = {}
) {
  return async (
    page: number = 1,
    limit: number = 20,
    search: string = '',
    additionalParams: Record<string, string> = {}
  ): Promise<PaginatedResponse<T>> => {
    const queryParams = new URLSearchParams({
      ...defaultParams,
      page: page.toString(),
      limit: limit.toString(),
      ...(search ? { search } : {}),
      ...additionalParams,
    })

    return fetchPaginatedData<T>({
      url: baseUrl,
      queryParams,
      tag,
      revalidate: 60,
    })
  }
}
