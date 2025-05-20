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
  useAuth?: boolean
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
  useAuth = true,
}: FetchPaginatedDataOptions): Promise<PaginatedResponse<T>> {
  // Get auth user and add authorization if available and requested
  let authHeaders: HeadersInit = {}

  if (useAuth) {
    const user = await auth.getCurrentUser()
    if (user?.access) {
      authHeaders = {
        Authorization: `Bearer ${user.access}`,
      }
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
 * Parameters type for pagination fetcher
 */
export type PaginationFetcherParams = {
  page?: number
  limit?: number
  search?: string
  additionalParams?: Record<string, string>
}

/**
 * Create a function to fetch paginated data
 * This function itself is a Server Action, but it returns a function that can be called elsewhere
 */
export async function createPaginatedFetcher<T>(
  baseUrl: string,
  tag?: string,
  defaultParams: Record<string, string> = {},
  options: { useAuth?: boolean; revalidate?: number } = {}
): Promise<(params: PaginationFetcherParams) => Promise<PaginatedResponse<T>>> {
  // Return an async function that can be called with pagination parameters
  return async ({
    page = 1,
    limit = 20,
    search = '',
    additionalParams = {},
  }: PaginationFetcherParams): Promise<PaginatedResponse<T>> => {
    // Create search params
    const queryParams = new URLSearchParams({
      ...defaultParams,
      page: page.toString(),
      limit: limit.toString(),
      ...(search ? { search } : {}),
      ...additionalParams,
    })

    // Create a specific tag for this query if base tag is provided
    const searchTag = search ? `-search-${encodeURIComponent(search)}` : ''
    const queryTag = tag
      ? `${tag}-page-${page}-limit-${limit}${searchTag}`
      : undefined

    return fetchPaginatedData<T>({
      url: baseUrl,
      queryParams,
      tag: queryTag,
      revalidate: options.revalidate ?? 60,
      useAuth: options.useAuth ?? true,
    })
  }
}

/**
 * Helper function to fetch paginated data directly with parameters
 */
export async function fetchWithPagination<T>(
  baseUrl: string,
  page: number = 1,
  limit: number = 20,
  search: string = '',
  additionalParams: Record<string, string> = {},
  options: { tag?: string; revalidate?: number; useAuth?: boolean } = {}
): Promise<PaginatedResponse<T>> {
  // Create search params
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search ? { search } : {}),
    ...additionalParams,
  })

  // Create a specific tag for this query if base tag is provided
  const searchTag = search ? `-search-${encodeURIComponent(search)}` : ''
  const queryTag = options.tag
    ? `${options.tag}-page-${page}-limit-${limit}${searchTag}`
    : undefined

  return fetchPaginatedData<T>({
    url: baseUrl,
    queryParams,
    tag: queryTag,
    revalidate: options.revalidate ?? 60,
    useAuth: options.useAuth ?? true,
  })
}
