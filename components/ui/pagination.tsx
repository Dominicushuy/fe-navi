// components/ui/pagination.tsx
import Link from 'next/link'
import { cn } from '@/lib/utils'

export interface PaginationProps {
  /**
   * Current page number (1-based)
   */
  page: number
  /**
   * Total number of pages
   */
  pageCount: number
  /**
   * Current search query
   */
  search?: string
  /**
   * Current limit/page size
   */
  limit?: number
  /**
   * Base URL path
   */
  basePath: string
  /**
   * Additional query parameters
   */
  additionalParams?: Record<string, string>
  /**
   * Show compact version
   */
  compact?: boolean
  /**
   * Locale for i18n
   */
  locale?: string
}

/**
 * Server-side rendered pagination component
 * Uses Link component for navigation without client JS
 */
export function Pagination({
  page,
  pageCount,
  search = '',
  limit = 10,
  basePath,
  additionalParams = {},
  compact = false,
  locale,
}: PaginationProps) {
  // Create URL for a specific page
  const createPageUrl = (targetPage: number) => {
    const params = new URLSearchParams({
      ...(search ? { search } : {}),
      page: targetPage.toString(),
      limit: limit.toString(),
      ...additionalParams,
    })

    return `${basePath}?${params.toString()}`
  }

  // Generate pagination range
  const generatePaginationRange = () => {
    const delta = 2 // Number of pages to show on each side of current page
    const range = []

    for (
      let i = Math.max(2, page - delta);
      i <= Math.min(pageCount - 1, page + delta);
      i++
    ) {
      range.push(i)
    }

    // Always include first and last page
    if (range[0] > 2) range.unshift('...')
    if (range[range.length - 1] < pageCount - 1) range.push('...')

    if (range[0] !== 1) range.unshift(1)
    if (range[range.length - 1] !== pageCount) range.push(pageCount)

    return range
  }

  // Get the range of pages to display
  const paginationRange = generatePaginationRange()

  return (
    <nav
      className={cn(
        'flex items-center justify-center',
        compact ? 'text-xs space-x-1' : 'text-sm space-x-2'
      )}
      aria-label='Pagination'>
      {/* Previous page link */}
      <Link
        href={page > 1 ? createPageUrl(page - 1) : '#'}
        className={cn(
          'relative inline-flex items-center px-2 py-1 rounded-md border',
          page > 1
            ? 'hover:bg-accent hover:text-accent-foreground'
            : 'opacity-50 cursor-not-allowed'
        )}
        aria-disabled={page <= 1}
        tabIndex={page <= 1 ? -1 : undefined}>
        <span className='sr-only'>Previous</span>
        Previous
      </Link>

      {/* Page number links */}
      <div className='flex items-center space-x-1'>
        {paginationRange.map((pageNum, index) => {
          // For ellipsis
          if (pageNum === '...') {
            return (
              <span key={`ellipsis-${index}`} className='px-3 py-1'>
                ...
              </span>
            )
          }

          // For regular page numbers
          return (
            <Link
              key={`page-${pageNum}`}
              href={createPageUrl(pageNum as number)}
              className={cn(
                'relative inline-flex items-center justify-center min-w-[2rem] px-2 py-1 border rounded-md',
                page === pageNum
                  ? 'bg-primary text-primary-foreground font-medium border-primary'
                  : 'hover:bg-accent hover:text-accent-foreground'
              )}
              aria-current={page === pageNum ? 'page' : undefined}>
              {pageNum}
            </Link>
          )
        })}
      </div>

      {/* Next page link */}
      <Link
        href={page < pageCount ? createPageUrl(page + 1) : '#'}
        className={cn(
          'relative inline-flex items-center px-2 py-1 rounded-md border',
          page < pageCount
            ? 'hover:bg-accent hover:text-accent-foreground'
            : 'opacity-50 cursor-not-allowed'
        )}
        aria-disabled={page >= pageCount}
        tabIndex={page >= pageCount ? -1 : undefined}>
        <span className='sr-only'>Next</span>
        Next
      </Link>
    </nav>
  )
}
