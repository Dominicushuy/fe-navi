// lib/url-utils.ts
import { ReadonlyURLSearchParams } from 'next/navigation'

/**
 * Creates a new URLSearchParams object with updated params
 */
export function createQueryString(
  searchParams: ReadonlyURLSearchParams,
  params: Record<string, string | number | null | undefined>
): string {
  const newSearchParams = new URLSearchParams(searchParams.toString())

  // Update search params with new values
  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') {
      newSearchParams.delete(key)
    } else {
      newSearchParams.set(key, String(value))
    }
  })

  const queryString = newSearchParams.toString()
  return queryString ? `?${queryString}` : ''
}

/**
 * Helper to get search param as number with fallback
 */
export function getNumericParam(
  searchParams: { [key: string]: string | string[] | undefined },
  key: string,
  fallback: number
): number {
  const value = searchParams[key]
  if (!value) return fallback

  // Handle both string and string[] cases
  const strValue = Array.isArray(value) ? value[0] : value
  const parsed = parseInt(strValue, 10)
  return isNaN(parsed) ? fallback : parsed
}

/**
 * Parse searchParams into table params object
 */
export function parseTableParams(searchParams: {
  [key: string]: string | string[] | undefined
}): {
  page: number
  limit: number
  search: string
} {
  return {
    page: getNumericParam(searchParams, 'page', 1),
    limit: getNumericParam(searchParams, 'limit', 20),
    search:
      typeof searchParams.search === 'string'
        ? searchParams.search
        : Array.isArray(searchParams.search)
        ? searchParams.search[0] || ''
        : '',
  }
}
