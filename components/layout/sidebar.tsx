'use client'

import React, { useState } from 'react'
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
  // Track open state for each collapsible section
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    History: pathname.startsWith('/history'),
    'Parameter Storage': pathname.startsWith('/parameter-storage'),
  })

  // Check if the current path matches or starts with the given href
  const isActive = (href?: string) => {
    if (!href) return false
    return pathname === href || pathname.startsWith(href)
  }

  // Toggle section open state
  const toggleSection = (title: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }))
  }

  return (
    <aside className='w-72 bg-primary-900 text-white border-r border-primary-800 min-h-screen'>
      {/* Logo and Title */}
      <div className='p-4 border-b border-primary-800 flex items-center gap-2'>
        <div className='relative w-10 h-10'>
          <Image
            src='/logo.png'
            alt='Navigator Logo'
            width={40}
            height={40}
            className='object-contain'
          />
        </div>
        <h1 className='text-2xl font-semibold text-primary-50'>Navigator</h1>
      </div>

      {/* Navigation Items */}
      <nav className='p-3'>
        <ul className='space-y-1'>
          {navItems.map((item, index) => (
            <li key={index}>
              {item.children ? (
                <Collapsible
                  open={openSections[item.title]}
                  onOpenChange={() => toggleSection(item.title)}>
                  <CollapsibleTrigger
                    className={cn(
                      'flex items-center justify-between w-full px-4 py-2 text-left rounded-md',
                      'text-primary-100 hover:bg-primary-800 hover:text-white',
                      openSections[item.title] && 'bg-primary-800 text-white'
                    )}>
                    <div className='flex items-center gap-3'>
                      {item.icon}
                      <span>{item.title}</span>
                    </div>
                    <div>
                      {openSections[item.title] ? (
                        <ChevronDown className='size-4' />
                      ) : (
                        <ChevronRight className='size-4' />
                      )}
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <ul className='mt-1 ml-6'>
                      {item.children.map((child, childIndex) => (
                        <li key={childIndex}>
                          <Link
                            href={child.href || '#'}
                            className={cn(
                              'flex items-center px-4 py-2 rounded-md',
                              'text-primary-200 hover:bg-primary-800 hover:text-white',
                              isActive(child.href) &&
                                'bg-primary-700 text-white'
                            )}>
                            <span className='inline-block w-4 mr-2 text-primary-400'>
                              ⌞
                            </span>
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
                    'text-primary-100 hover:bg-primary-800 hover:text-white',
                    isActive(item.href) && 'bg-primary-700 text-white'
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
