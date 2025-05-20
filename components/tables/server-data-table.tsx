// components/tables/server-table.tsx
import * as React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Pagination } from '@/components/ui/pagination'

export interface ColumnDef<T> {
  id: string
  header: React.ReactNode
  cell: (item: T) => React.ReactNode
}

interface ServerTableProps<T> {
  columns: ColumnDef<T>[]
  data: T[]
  pagination: {
    page: number
    pageCount: number
    limit: number
  }
  totalCount: number
  basePath: string
  search?: string
  additionalParams?: Record<string, string>
  className?: string
  locale?: string
}

/**
 * A server-side rendered table with pagination
 * This is not a client component and doesn't use 'use client'
 */
export function ServerTable<T>({
  columns,
  data,
  pagination,
  totalCount,
  basePath,
  search = '',
  additionalParams = {},
  className,
  locale,
}: ServerTableProps<T>) {
  const { page, pageCount, limit } = pagination

  // Calculate visible range
  const startItem = (page - 1) * limit + 1
  const endItem = Math.min(startItem + limit - 1, totalCount)

  return (
    <div className='space-y-4'>
      {/* Table */}
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.id}>{column.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              data.map((item, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell key={`${index}-${column.id}`}>
                      {column.cell(item)}
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

      {/* Pagination metadata and controls */}
      <div className='flex flex-col sm:flex-row items-center justify-between'>
        <div className='text-sm text-muted-foreground mb-4 sm:mb-0'>
          {totalCount > 0 ? (
            <>
              Showing {startItem} to {endItem} of {totalCount} items
            </>
          ) : (
            'No results'
          )}
        </div>

        <Pagination
          page={page}
          pageCount={pageCount}
          search={search}
          limit={limit}
          basePath={basePath}
          additionalParams={additionalParams}
          locale={locale}
        />
      </div>
    </div>
  )
}
