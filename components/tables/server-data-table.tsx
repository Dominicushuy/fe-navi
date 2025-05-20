// components/tables/server-data-table.tsx
'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TableCell } from '@/components/tables/TableCell'
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
  maxHeight = '70vh', // Default max height
}: ServerDataTableProps<TData>) {
  const pathname = usePathname()
  const tableContainerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState<number | null>(null)

  const { search, setSearch, handleSearch, goToPage } = useServerTable({
    initialSearch: searchValue,
  })

  // Update container width on resize
  useEffect(() => {
    if (!tableContainerRef.current) return

    const updateWidth = () => {
      if (tableContainerRef.current) {
        setContainerWidth(tableContainerRef.current.clientWidth)
      }
    }

    // Initial width
    updateWidth()

    // Add resize listener
    window.addEventListener('resize', updateWidth)

    return () => {
      window.removeEventListener('resize', updateWidth)
    }
  }, [])

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
    <div className='space-y-4 w-full'>
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

      {/* Table Container with proper nesting for fixed header and scrolling */}
      <div className='data-table-container' ref={tableContainerRef}>
        <div className='table-scroll-container'>
          <div
            className='table-scroll-body'
            style={{ maxHeight: maxHeightStyle }}>
            <Table className='fixed-header-table'>
              <TableHeader className='table-header-group'>
                <TableRow>
                  {columns.map((column, colIndex) => {
                    // Xác định chiều rộng cột dựa trên metadata hoặc ID
                    const width =
                      column.meta?.width ||
                      (column.id === 'actions'
                        ? '120px'
                        : column.id === 'modified'
                        ? '200px'
                        : column.id === 'job_name'
                        ? '300px'
                        : '180px')

                    // Xác định min/max width dựa trên loại cột
                    const minWidth =
                      column.meta?.minWidth ||
                      (column.id === 'actions' ? '100px' : '120px')

                    const maxWidth =
                      column.meta?.maxWidth ||
                      (column.id === 'actions'
                        ? '150px'
                        : column.id === 'job_name'
                        ? '300px'
                        : '250px')

                    return (
                      <TableHead
                        key={column.id}
                        className={cn(
                          'table-header-cell',
                          colIndex === 0 && 'sticky-first-column-header'
                        )}
                        style={{
                          width: width,
                          minWidth: minWidth,
                          maxWidth: maxWidth,
                        }}>
                        {renderCellOrHeader(column.header)}
                      </TableHead>
                    )
                  })}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length > 0 ? (
                  data.map((record, index) => {
                    // Create a mock row that behaves like TanStack Table row
                    const row = createTableRow(record, index)

                    return (
                      <TableRow
                        key={index}
                        className={cn(
                          'table-row',
                          index % 2 === 0 ? 'table-row-even' : 'table-row-odd'
                        )}>
                        {columns.map((column, colIndex) => {
                          // Lấy giá trị nguyên bản cho tooltip
                          const rawValue = String(
                            (record as any)[column.id as string] || ''
                          )

                          // Xác định kích thước cột
                          const width =
                            column.meta?.width ||
                            (column.id === 'actions'
                              ? '120px'
                              : column.id === 'modified'
                              ? '200px'
                              : column.id === 'job_name'
                              ? '300px'
                              : '180px')

                          const minWidth =
                            column.meta?.minWidth ||
                            (column.id === 'actions' ? '100px' : '120px')

                          const maxWidth =
                            column.meta?.maxWidth ||
                            (column.id === 'actions'
                              ? '150px'
                              : column.id === 'job_name'
                              ? '300px'
                              : '250px')

                          // First column needs special handling for stickiness
                          const isFirstColumn = colIndex === 0

                          return (
                            <TableCell
                              key={`${index}-${column.id}`}
                              content={renderCellOrHeader(column.cell({ row }))}
                              rawValue={rawValue}
                              width={width}
                              minWidth={minWidth}
                              maxWidth={maxWidth}
                              className={cn(
                                isFirstColumn && 'sticky-first-column',
                                isFirstColumn &&
                                  (index % 2 === 0
                                    ? 'bg-background'
                                    : 'bg-muted/30')
                              )}
                            />
                          )
                        })}
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      content='No results.'
                      className='h-24 text-center'
                    />
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
