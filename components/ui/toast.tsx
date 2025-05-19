// components/ui/toast.tsx
'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface ToastProps {
  title: string
  description?: string
  variant?: 'default' | 'destructive' | 'success'
  action?: React.ReactNode
  duration?: number
}

type ToastType = {
  id: string
  title: string
  description?: string
  variant?: 'default' | 'destructive' | 'success'
  action?: React.ReactNode
}

// Global toast state
let toasts: ToastType[] = []
let listeners: ((toasts: ToastType[]) => void)[] = []

function updateToasts(newToasts: ToastType[]) {
  toasts = newToasts
  listeners.forEach((listener) => listener(toasts))
}

// Toast function to add a new toast
export function toast(props: ToastProps) {
  const id = Math.random().toString(36).substring(2, 9)
  updateToasts([...toasts, { id, ...props }])

  // Auto dismiss after duration
  if (props.duration !== 0) {
    setTimeout(() => {
      dismiss(id)
    }, props.duration || 5000)
  }

  return id
}

// Dismiss a toast by id
export function dismiss(id: string) {
  updateToasts(toasts.filter((t) => t.id !== id))
}

// Component to display a single toast
function ToastItem({ toast }: { toast: ToastType }) {
  return (
    <div
      className={cn(
        'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all',
        toast.variant === 'destructive'
          ? 'border-destructive bg-destructive text-white'
          : toast.variant === 'success'
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-background text-foreground'
      )}>
      <div className='flex flex-col gap-1'>
        {toast.title && <div className='font-semibold'>{toast.title}</div>}
        {toast.description && (
          <div className='text-sm opacity-90'>{toast.description}</div>
        )}
      </div>

      {toast.action}

      <Button
        variant='ghost'
        size='sm'
        className={cn(
          'absolute right-1 top-1 rounded-sm p-0 opacity-70 transition-opacity hover:opacity-100',
          toast.variant === 'destructive' && 'text-white hover:text-white'
        )}
        onClick={() => dismiss(toast.id)}>
        <X className='h-4 w-4' />
      </Button>
    </div>
  )
}

// Toast container component to render all toasts
export function Toaster() {
  const [localToasts, setLocalToasts] = useState<ToastType[]>(toasts)

  useEffect(() => {
    // Subscribe to toast updates
    listeners.push(setLocalToasts)

    return () => {
      listeners = listeners.filter((listener) => listener !== setLocalToasts)
    }
  }, [])

  return (
    <div className='fixed bottom-0 right-0 z-50 flex flex-col p-4 gap-2 max-w-md w-full'>
      {localToasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  )
}
