// components/layout/sidebar.tsx
'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Calendar,
  Settings,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  FileText,
  Database,
  CornerDownRight,
} from 'lucide-react'
import Image from 'next/image'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

// Navigation items structure
type NavItem = {
  title: string
  href?: string
  icon: React.ReactNode
  children?: Omit<NavItem, 'icon'>[]
}

// Main navigation items
const navItems: NavItem[] = [
  {
    title: 'Schedule Job',
    href: '/schedule',
    icon: <Calendar className='size-5' />,
  },
  {
    title: 'Setting',
    href: '/setting',
    icon: <Settings className='size-5' />,
  },
  {
    title: 'History',
    icon: <RotateCcw className='size-5' />,
    children: [
      {
        title: 'Execution',
        href: '/history/execution',
      },
      {
        title: 'Setting change',
        href: '/history/setting-change',
      },
    ],
  },
  {
    title: 'Credential',
    href: '/credential',
    icon: <FileText className='size-5' />,
  },
  {
    title: 'Parameter Storage',
    icon: <Database className='size-5' />,
    children: [
      {
        title: 'Manager',
        href: '/parameter-storage/manager',
      },
      {
        title: 'Activity Log',
        href: '/parameter-storage/activity-log',
      },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()

  // Initialize with empty state first
  const [openSections, setOpenSections] = useState<Record<number, boolean>>({})

  // Check if the current path matches or starts with the given href
  const isActive = (href?: string) => {
    if (!href) return false
    return pathname === href || pathname.startsWith(href)
  }

  // Check if any child item is active
  const hasActiveChild = (item: NavItem) => {
    if (!item.children) return false
    return item.children.some((child) => isActive(child.href))
  }

  // Set initial state after component is mounted
  useEffect(() => {
    const initialState: Record<number, boolean> = {}

    navItems.forEach((item, index) => {
      if (item.children && hasActiveChild(item)) {
        initialState[index] = true
      }
    })

    setOpenSections(initialState)
  }, [pathname]) // Re-run when pathname changes

  // Toggle a section open/closed
  const toggleSection = (index: number) => {
    setOpenSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  return (
    <aside className='w-72 bg-sidebar text-sidebar-foreground border-r border-sidebar-border min-h-screen'>
      {/* Logo and Title */}
      <div className='p-4 border-b border-sidebar-border flex items-center gap-2'>
        <div className='relative w-10 h-10'>
          <Image
            src='/logo.png'
            alt='Navigator Logo'
            width={40}
            height={40}
            className='object-contain'
          />
        </div>
        <h1 className='text-2xl font-semibold text-sidebar-primary-foreground'>
          Navigator
        </h1>
      </div>

      {/* Navigation Items */}
      <nav className='p-3'>
        <ul className='space-y-1'>
          {navItems.map((item, index) => (
            <li key={index}>
              {item.children ? (
                <Collapsible
                  defaultOpen={hasActiveChild(item)}
                  open={openSections[index]}
                  onOpenChange={() => toggleSection(index)}>
                  <CollapsibleTrigger
                    className={cn(
                      'flex items-center justify-between w-full px-4 py-2 text-left rounded-md',
                      'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                      hasActiveChild(item) &&
                        'bg-sidebar-accent text-sidebar-accent-foreground'
                    )}>
                    <span className='flex items-center gap-3'>
                      {item.icon}
                      <span>{item.title}</span>
                    </span>
                    {openSections[index] ? (
                      <ChevronDown className='size-4' />
                    ) : (
                      <ChevronRight className='size-4' />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <ul className='pl-6 mt-1 space-y-1'>
                      {item.children.map((child, childIndex) => (
                        <li key={childIndex}>
                          <Link
                            href={child.href || '#'}
                            className={cn(
                              'flex items-center gap-2 px-4 py-2 rounded-md',
                              'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                              isActive(child.href) &&
                                'bg-sidebar-accent text-sidebar-accent-foreground'
                            )}>
                            <CornerDownRight className='size-4' />
                            {child.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <Link
                  href={item.href || '#'}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2 rounded-md',
                    'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                    isActive(item.href) &&
                      'bg-sidebar-accent text-sidebar-accent-foreground'
                  )}>
                  {item.icon}
                  {item.title}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
