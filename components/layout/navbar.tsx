'use client'

import { ModeToggle } from '@/components/mode-toggle'
import { usePathname } from 'next/navigation'
import React from 'react'

export function Navbar() {
  const pathname = usePathname()

  // Get the current page title from the path
  const getPageTitle = () => {
    const parts = pathname.split('/').filter(Boolean)
    if (parts.length === 0) return 'Dashboard'

    // Convert kebab-case to Title Case
    return parts[parts.length - 1]
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <header className='h-16 border-b border-border bg-background'>
      <div className='flex h-full items-center justify-between px-6'>
        <h1 className='text-xl font-semibold'>{getPageTitle()}</h1>
        <div className='flex items-center gap-4'>
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
