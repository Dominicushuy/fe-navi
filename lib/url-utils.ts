// lib/url-utils.ts
/**
 * Helper to get search param as number with fallback
 * @param searchParams The search parameters object
 * @param key The parameter key to retrieve
 * @param fallback Default value if parameter is not found or invalid
 * @returns Parsed numeric value or fallback
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
 * Parse searchParams into table params object for pagination and search
 * @param searchParams The search parameters object
 * @param defaults Default values
 * @returns Structured pagination parameters
 */
export function parseTableParams(
  searchParams: { [key: string]: string | string[] | undefined },
  defaults: { page?: number; limit?: number; search?: string } = {}
): {
  page: number
  limit: number
  search: string
} {
  return {
    page: getNumericParam(searchParams, 'page', defaults.page || 1),
    limit: getNumericParam(searchParams, 'limit', defaults.limit || 20),
    search:
      typeof searchParams.search === 'string'
        ? searchParams.search
        : Array.isArray(searchParams.search)
        ? searchParams.search[0] || defaults.search || ''
        : defaults.search || '',
  }
}

/**
 * Create pagination params for API requests
 * @param page Current page (1-based)
 * @param limit Items per page
 * @returns Object with pagination parameters
 */
export function createPaginationParams(page: number, limit: number) {
  return {
    page: Math.max(1, page),
    limit: Math.max(1, limit),
    offset: Math.max(0, (page - 1) * limit),
  }
}
