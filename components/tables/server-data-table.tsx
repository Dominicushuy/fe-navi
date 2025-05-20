// components/tables/server-data-table.tsx
'use client'

import { ColumnDef, RowData, CellContext } from '@tanstack/react-table'
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

// Define custom column meta type with sticky properties
interface CustomColumnMeta {
  width?: string
  minWidth?: string
  maxWidth?: string
  isSticky?: boolean
  stickyPosition?: number
}

// Extend RowData to include custom column meta
declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue>
    extends CustomColumnMeta {}
}

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

  // Helper to safely render cell content with fallback
  const renderCellContent = (column: ColumnDef<TData, any>, row: any) => {
    if (column.cell) {
      // Check if cell is a function
      if (typeof column.cell === 'function') {
        const cellContext = {
          row,
          column,
          getValue: row.getValue,
        } as unknown as CellContext<TData, any>

        return column.cell(cellContext)
      }

      // If cell is not a function, return it directly
      return column.cell
    }

    // Fallback: display the raw value from the row
    return row.getValue(column.id as string)
  }

  // Helper to calculate left position for sticky columns
  const calculateStickyLeftPosition = (columnIndex: number): string => {
    let leftPosition = 0

    // Find all sticky columns before this one and sum their widths
    for (let i = 0; i < columnIndex; i++) {
      const col = columns[i]
      if (col.meta?.isSticky) {
        // Extract width without 'px' and convert to number
        const width = col.meta.width || '180px'
        leftPosition += parseInt(width, 10)
      }
    }

    return `${leftPosition}px`
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
                    // Determine column styles based on metadata
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

                    // Check if this column is sticky
                    const isSticky = column.meta?.isSticky || false
                    const stickyPosition = column.meta?.stickyPosition || 0

                    // Calculate left position for sticky columns
                    const leftPosition = isSticky
                      ? calculateStickyLeftPosition(colIndex)
                      : undefined

                    // Calculate z-index for sticky headers - higher position = lower z-index
                    // This ensures proper layering when scrolling
                    const zIndex = isSticky ? 40 - stickyPosition : undefined

                    return (
                      <TableHead
                        key={column.id}
                        className={cn(
                          'table-header-cell',
                          isSticky && 'sticky-column-header'
                        )}
                        style={{
                          width,
                          minWidth,
                          maxWidth,
                          ...(isSticky && {
                            position: 'sticky',
                            left: leftPosition,
                            zIndex,
                            backgroundColor: 'var(--muted)', // Ensure background is solid
                            boxShadow: 'var(--shadow-sticky-column)',
                          }),
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
                    // Determine row background based on even/odd
                    const rowBg =
                      index % 2 === 0 ? 'var(--background)' : 'var(--muted-alt)'

                    return (
                      <TableRow
                        key={index}
                        className={cn(
                          'table-row',
                          index % 2 === 0 ? 'table-row-even' : 'table-row-odd'
                        )}>
                        {columns.map((column, colIndex) => {
                          // Get raw value for tooltip
                          const rawValue = String(
                            (record as any)[column.id as string] || ''
                          )

                          // Determine column styles based on metadata
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

                          // Check if this column is sticky
                          const isSticky = column.meta?.isSticky || false
                          const stickyPosition =
                            column.meta?.stickyPosition || 0

                          // Calculate left position for sticky columns
                          const leftPosition = isSticky
                            ? calculateStickyLeftPosition(colIndex)
                            : undefined

                          // Calculate z-index for sticky columns - higher position = lower z-index
                          const zIndex = isSticky
                            ? 30 - stickyPosition
                            : undefined

                          return (
                            <TableCell
                              key={`${index}-${column.id}`}
                              content={renderCellContent(column, row)}
                              rawValue={rawValue}
                              width={width}
                              minWidth={minWidth}
                              maxWidth={maxWidth}
                              className={cn(isSticky && 'sticky-column-cell')}
                              style={{
                                ...(isSticky && {
                                  position: 'sticky',
                                  left: leftPosition,
                                  zIndex,
                                  backgroundColor: rowBg, // Use row background
                                  boxShadow: 'var(--shadow-sticky-column)',
                                }),
                              }}
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
