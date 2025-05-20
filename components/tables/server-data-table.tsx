// components/tables/server-data-table.tsx
'use client'

import * as React from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
} from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { createQueryString } from '@/lib/url-utils'
import { FormEvent, useTransition } from 'react'

interface ServerDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  pagination: {
    pageCount: number
    page: number
    limit: number
  }
  totalCount: number
  searchPlaceholder?: string
  searchValue?: string
}

export function ServerDataTable<TData, TValue>({
  columns,
  data,
  pagination,
  totalCount,
  searchPlaceholder = 'Search...',
  searchValue = '',
}: ServerDataTableProps<TData, TValue>) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [searchInput, setSearchInput] = React.useState(searchValue)

  // Initialize react-table
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: pagination.pageCount,
    state: {
      pagination: {
        pageIndex: pagination.page - 1,
        pageSize: pagination.limit,
      },
    },
  })

  // Handle search form submission
  const handleSearch = (e: FormEvent) => {
    e.preventDefault()

    startTransition(() => {
      // Create a new URL with updated search and reset page to 1
      const queryString = createQueryString(searchParams, {
        search: searchInput,
        page: 1, // Reset to first page when searching
      })
      router.push(`${pathname}${queryString}`)
    })
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    startTransition(() => {
      const queryString = createQueryString(searchParams, { page })
      router.push(`${pathname}${queryString}`)
    })
  }

  // Handle limit change
  const handleLimitChange = (limit: number) => {
    startTransition(() => {
      const queryString = createQueryString(searchParams, {
        limit,
        page: 1, // Reset to first page when changing limit
      })
      router.push(`${pathname}${queryString}`)
    })
  }

  return (
    <div className='space-y-4'>
      {/* Search field */}
      <form onSubmit={handleSearch} className='flex items-center'>
        <div className='relative flex-1 max-w-sm'>
          <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder={searchPlaceholder}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className='pl-8'
            aria-label={searchPlaceholder}
          />
        </div>
        <Button type='submit' className='ml-2' disabled={isPending}>
          {isPending ? 'Searching...' : 'Search'}
        </Button>
      </form>

      {/* Table */}
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {data.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'>
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className='flex items-center justify-between space-x-2 py-4'>
        <div className='flex-1 text-sm text-muted-foreground'>
          {totalCount > 0 ? (
            <>
              Showing {(pagination.page - 1) * pagination.limit + 1}-
              {Math.min(pagination.page * pagination.limit, totalCount)} of{' '}
              {totalCount} items
            </>
          ) : (
            'No results'
          )}
        </div>
        <div className='flex items-center space-x-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => handlePageChange(1)}
            disabled={pagination.page <= 1 || isPending}>
            <ChevronsLeft className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1 || isPending}>
            <ChevronLeft className='h-4 w-4' />
          </Button>
          <span className='flex items-center gap-1 text-sm'>
            <span>Page</span>
            <strong>
              {pagination.page} of {pagination.pageCount || 1}
            </strong>
          </span>
          <Button
            variant='outline'
            size='sm'
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.pageCount || isPending}>
            <ChevronRight className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => handlePageChange(pagination.pageCount)}
            disabled={pagination.page >= pagination.pageCount || isPending}>
            <ChevronsRight className='h-4 w-4' />
          </Button>

          {/* Page size selector */}
          <select
            className='px-2 py-1 border rounded-md bg-background'
            value={pagination.limit}
            onChange={(e) => handleLimitChange(Number(e.target.value))}
            disabled={isPending}>
            {[10, 20, 50, 100].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
