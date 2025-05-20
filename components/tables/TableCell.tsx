// components/tables/TableCell.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { TableCell as UITableCell } from '@/components/ui/table'

// Use Omit to avoid type conflict with "content" property
interface TableCellProps extends Omit<React.ComponentProps<'td'>, 'content'> {
  content: React.ReactNode
  rawValue?: string
  width?: string
  minWidth?: string
  maxWidth?: string
  tooltipDisabled?: boolean
  style?: React.CSSProperties // Add style prop for sticky positioning
}

export function TableCell({
  content,
  rawValue,
  width,
  minWidth = '100px',
  maxWidth = '300px',
  tooltipDisabled = false,
  className,
  style, // Accept style prop
  ...props
}: TableCellProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const cellRef = useRef<HTMLTableCellElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // Check if content is overflowing and needs tooltip
  useEffect(() => {
    if (tooltipDisabled || !contentRef.current) return

    const checkOverflow = () => {
      const element = contentRef.current
      if (!element) return

      // Check if content is overflowing
      const isOverflowing = element.scrollWidth > element.clientWidth
      setShowTooltip(isOverflowing)
    }

    // Check on initial render
    checkOverflow()

    // Setup resize observer to check when container size changes
    const resizeObserver = new ResizeObserver(checkOverflow)
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [content, tooltipDisabled])

  // Define base styles
  const baseStyle = {
    '--cell-width': width,
    '--cell-min-width': minWidth,
    '--cell-max-width': maxWidth,
    ...style, // Merge provided styles
  } as React.CSSProperties

  return (
    <UITableCell
      ref={cellRef}
      className={cn('table-cell fixed-width-cell', className)}
      style={baseStyle}
      {...props}>
      <div className='cell-wrapper relative'>
        <div
          ref={contentRef}
          className='cell-content'
          title={
            tooltipDisabled ? undefined : rawValue || String(content || '')
          }>
          {content}
        </div>

        {/* Custom tooltip for larger content - optional enhancement */}
        {showTooltip && !tooltipDisabled && (
          <div className='cell-tooltip'>
            {rawValue || String(content || '')}
          </div>
        )}
      </div>
    </UITableCell>
  )
}
