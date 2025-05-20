// components/tables/server-data-table.tsx
'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import { useServerTable } from '@/hooks/use-server-table'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface ServerDataTableProps<TData> {
  columns: ColumnDef<TData, any>[]
  data: TData[]
  pagination: {
    pageCount: number
    page: number
    limit: number
  }
  totalCount: number
  searchPlaceholder?: string
  searchValue?: string
  maxHeight?: string | number
}

export function ServerDataTable<TData>({
  columns,
  data,
  pagination,
  totalCount,
  searchPlaceholder = 'Search...',
  searchValue = '',
  maxHeight = '70vh', // Mặc định chiều cao tối đa
}: ServerDataTableProps<TData>) {
  const pathname = usePathname()

  const { search, setSearch, handleSearch, goToPage } = useServerTable({
    initialSearch: searchValue,
  })

  // Calculate visible range
  const { page, pageCount, limit } = pagination
  const startItem = (page - 1) * limit + 1
  const endItem = Math.min(startItem + limit - 1, totalCount)

  // Helper function to create a mock row that behaves like a TanStack Table row
  const createTableRow = (record: TData, index: number) => {
    return {
      id: index.toString(),
      original: record,
      getValue: (id: string) => {
        return (record as any)[id]
      },
    }
  }

  // Helper to safely render cell or header content
  const renderCellOrHeader = (content: any) => {
    if (typeof content === 'function') {
      return content()
    }
    return content
  }

  // Dynamically create style for max-height
  const maxHeightStyle =
    typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight

  return (
    <div className='space-y-4'>
      {/* Search field */}
      <div className='flex items-center'>
        <form onSubmit={handleSearch} className='relative flex-1 max-w-sm'>
          <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className='pl-8'
          />
        </form>
      </div>

      {/* Responsive Table Container with fixed header */}
      <div className='rounded-md border'>
        <div className='data-table-container'>
          <div
            className='fixed-data-wrapper'
            style={{ maxHeight: maxHeightStyle }}>
            <Table className='fixed-header-table'>
              <TableHeader className='fixed-header'>
                <TableRow className='border-b-0'>
                  {columns.map((column, colIndex) => (
                    <TableHead
                      key={column.id}
                      className={cn(
                        'py-3 px-4 font-semibold text-foreground bg-muted/90 border-b-2 border-primary/20',
                        colIndex === 0 &&
                          'sticky left-0 z-20 bg-muted/95 backdrop-blur-sm'
                      )}
                      style={{
                        // Lấy chiều rộng từ meta nếu có
                        minWidth:
                          column.meta?.width || column.id === 'actions'
                            ? '120px'
                            : column.id === 'modified'
                            ? '200px'
                            : column.id === 'job_name'
                            ? '300px'
                            : '180px',
                        maxWidth:
                          column.meta?.width || column.id === 'actions'
                            ? '150px'
                            : column.id === 'modified'
                            ? '200px'
                            : column.id === 'job_name'
                            ? '300px'
                            : '250px',
                      }}>
                      {renderCellOrHeader(column.header)}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className='table-body'>
                {data.length > 0 ? (
                  data.map((record, index) => {
                    // Create a mock row that behaves like TanStack Table row
                    const row = createTableRow(record, index)

                    return (
                      <TableRow
                        key={index}
                        className={
                          index % 2 === 0 ? 'bg-background' : 'bg-muted/30'
                        }>
                        {columns.map((column, colIndex) => (
                          <TableCell
                            key={`${index}-${column.id}`}
                            className={cn(
                              'py-3 px-4 border-b',
                              'overflow-hidden',
                              colIndex === 0 && 'sticky left-0 z-10 bg-inherit'
                            )}
                            style={{
                              // Lấy chiều rộng từ meta nếu có
                              minWidth:
                                column.meta?.width || column.id === 'actions'
                                  ? '120px'
                                  : column.id === 'modified'
                                  ? '200px'
                                  : column.id === 'job_name'
                                  ? '300px'
                                  : '180px',
                              maxWidth:
                                column.meta?.width || column.id === 'actions'
                                  ? '150px'
                                  : column.id === 'modified'
                                  ? '200px'
                                  : column.id === 'job_name'
                                  ? '300px'
                                  : '250px',
                            }}>
                            <div
                              className='truncate cell-truncate'
                              title={String(
                                (record as any)[column.id as string] || ''
                              )}>
                              {renderCellOrHeader(column.cell({ row }))}
                            </div>
                          </TableCell>
                        ))}
                      </TableRow>
                    )
                  })
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
        </div>
      </div>

      {/* Pagination */}
      <div className='flex flex-col sm:flex-row items-center justify-between gap-4 py-4'>
        <div className='text-sm text-muted-foreground'>
          {totalCount > 0 ? (
            <>
              Showing {startItem} to {endItem} of {totalCount} items
            </>
          ) : (
            'No results'
          )}
        </div>
        <div className='flex items-center space-x-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => goToPage(1)}
            disabled={page <= 1}>
            <ChevronsLeft className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}>
            <ChevronLeft className='h-4 w-4' />
          </Button>
          <span className='flex items-center gap-1 text-sm'>
            <span>Page</span>
            <strong>
              {page} of {pageCount || 1}
            </strong>
          </span>
          <Button
            variant='outline'
            size='sm'
            onClick={() => goToPage(page + 1)}
            disabled={page >= pageCount}>
            <ChevronRight className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => goToPage(pageCount)}
            disabled={page >= pageCount}>
            <ChevronsRight className='h-4 w-4' />
          </Button>
        </div>
      </div>
    </div>
  )
}
