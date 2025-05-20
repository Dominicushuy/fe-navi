// components/tables/server-page-size.tsx
import Link from 'next/link'

interface ServerPageSizeProps {
  options: number[]
  currentSize: number
  basePath: string
  search?: string
  page?: number
  additionalParams?: Record<string, string>
}

/**
 * Server-side page size selector
 * This is not a client component and doesn't use 'use client'
 */
export function ServerPageSize({
  options,
  currentSize,
  basePath,
  search = '',
  page = 1,
  additionalParams = {},
}: ServerPageSizeProps) {
  // Create URL for a page size
  const createPageSizeUrl = (size: number) => {
    const params = new URLSearchParams({
      ...(search ? { search } : {}),
      // Reset to page 1 when changing page size
      page: '1',
      limit: size.toString(),
      ...additionalParams,
    })

    return `${basePath}?${params.toString()}`
  }

  return (
    <div className='flex items-center text-sm'>
      <span className='mr-2'>Rows per page:</span>
      <div className='flex space-x-1'>
        {options.map((size) => (
          <Link
            key={size}
            href={createPageSizeUrl(size)}
            className={`px-2 py-1 border rounded-md ${
              size === currentSize
                ? 'bg-primary text-primary-foreground font-medium'
                : 'hover:bg-accent hover:text-accent-foreground'
            }`}>
            {size}
          </Link>
        ))}
      </div>
    </div>
  )
}
