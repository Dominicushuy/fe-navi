// components/ui/input.tsx
import * as React from 'react'
import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot='input'
      className={cn(
        // Base styles
        'text-foreground border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs transition-colors',
        // State styles
        'focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30',
        // Placeholder and selection
        'placeholder:text-muted-foreground selection:bg-primary/20',
        // Dark mode adjustments
        'dark:border-input/50 dark:bg-input/30 dark:text-foreground',
        // Validation styles
        'aria-invalid:border-destructive aria-invalid:ring-destructive/30',
        // Form control states
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
}

export { Input }
