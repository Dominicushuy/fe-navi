'use client'

import React, { useState, useEffect } from 'react'
import { usePathname, Link } from '@/i18n/navigation'
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
  LogOut,
} from 'lucide-react'
import Image from 'next/image'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { useTranslations } from 'next-intl'

// Navigation items structure
type NavItem = {
  titleKey: string
  href?: string
  icon: React.ReactNode
  children?: Omit<NavItem, 'icon'>[]
}

export function Sidebar() {
  const pathname = usePathname()
  const t = useTranslations('Navigation')
  const authT = useTranslations('Auth')

  // Main navigation items with translation keys
  const navItems: NavItem[] = [
    {
      titleKey: 'scheduleJob',
      href: '/schedule',
      icon: <Calendar className='size-5' />,
    },
    {
      titleKey: 'setting',
      href: '/setting',
      icon: <Settings className='size-5' />,
    },
    {
      titleKey: 'history',
      icon: <RotateCcw className='size-5' />,
      children: [
        {
          titleKey: 'execution',
          href: '/history/execution',
        },
        {
          titleKey: 'settingChange',
          href: '/history/setting-change',
        },
      ],
    },
    {
      titleKey: 'credential',
      href: '/credential',
      icon: <FileText className='size-5' />,
    },
    {
      titleKey: 'parameterStorage',
      icon: <Database className='size-5' />,
      children: [
        {
          titleKey: 'manager',
          href: '/parameter-storage/manager',
        },
        {
          titleKey: 'activityLog',
          href: '/parameter-storage/activity-log',
        },
      ],
    },
  ]

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
    <aside className='w-72 bg-gradient-to-b from-sidebar to-sidebar/95 text-sidebar-foreground border-r border-sidebar-border/40 min-h-screen flex flex-col shadow-md'>
      {/* Logo and Title */}
      <div className='p-5 border-b border-sidebar-border/40 flex items-center gap-3'>
        <div className='relative w-10 h-10 bg-sidebar-primary/20 rounded-md overflow-hidden flex items-center justify-center shadow-inner'>
          <Image
            src='/logo.png'
            alt='Navigator Logo'
            width={32}
            height={32}
            className='object-contain drop-shadow-sm'
          />
        </div>
        <h1 className='text-xl font-bold text-sidebar-primary-foreground tracking-tight'>
          Navigator
          <span className='text-primary-400 ml-1 text-sm font-normal'>
            v1.0
          </span>
        </h1>
      </div>

      {/* Navigation Items */}
      <nav className='p-3 flex-1 overflow-y-auto custom-scrollbar'>
        <ul className='space-y-1.5'>
          {navItems.map((item, index) => (
            <li key={index}>
              {item.children ? (
                <Collapsible
                  defaultOpen={hasActiveChild(item)}
                  open={openSections[index]}
                  onOpenChange={() => toggleSection(index)}>
                  <CollapsibleTrigger
                    className={cn(
                      'flex items-center justify-between w-full px-4 py-2.5 text-left rounded-md',
                      'transition-all duration-200 ease-in-out',
                      'hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring/50',
                      hasActiveChild(item) &&
                        'bg-sidebar-accent/80 text-sidebar-accent-foreground font-medium'
                    )}>
                    <span className='flex items-center gap-3'>
                      <span
                        className={cn(
                          'p-1.5 rounded-md bg-sidebar-primary/20 text-primary-300',
                          hasActiveChild(item) &&
                            'bg-primary-700/30 text-primary-200'
                        )}>
                        {item.icon}
                      </span>
                      <span>{t(item.titleKey)}</span>
                    </span>
                    <span className='transition-transform duration-200'>
                      {openSections[index] ? (
                        <ChevronDown className='size-4' />
                      ) : (
                        <ChevronRight className='size-4' />
                      )}
                    </span>
                  </CollapsibleTrigger>
                  <CollapsibleContent
                    className='animate-[slideDown_200ms_ease-out]'
                    style={
                      {
                        '--tw-animate-from': 'transform 0.2s opacity 0.2s',
                        '--tw-animate-to': 'transform 1 opacity 1',
                      } as React.CSSProperties
                    }>
                    <ul className='pl-6 mt-1 space-y-1'>
                      {item.children.map((child, childIndex) => (
                        <li key={childIndex}>
                          <Link
                            href={child.href || '#'}
                            className={cn(
                              'flex items-center gap-2 px-4 py-2 rounded-md',
                              'transition-colors duration-200',
                              'hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
                              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring/50',
                              'relative',
                              isActive(child.href) &&
                                'bg-sidebar-accent/60 text-sidebar-accent-foreground font-medium'
                            )}>
                            <CornerDownRight className='size-4 text-primary-400' />
                            <span>{t(child.titleKey)}</span>
                            {isActive(child.href) && (
                              <span
                                className='absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4/5 bg-primary-400 rounded-r-md'
                                aria-hidden='true'
                              />
                            )}
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
                    'flex items-center gap-3 px-4 py-2.5 rounded-md',
                    'transition-all duration-200 ease-in-out',
                    'hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring/50',
                    'relative',
                    isActive(item.href) &&
                      'bg-sidebar-accent/80 text-sidebar-accent-foreground font-medium'
                  )}>
                  <span
                    className={cn(
                      'p-1.5 rounded-md bg-sidebar-primary/20 text-primary-300',
                      isActive(item.href) &&
                        'bg-primary-700/30 text-primary-200'
                    )}>
                    {item.icon}
                  </span>
                  <span>{t(item.titleKey)}</span>
                  {isActive(item.href) && (
                    <span
                      className='absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4/5 bg-primary-400 rounded-r-md'
                      aria-hidden='true'
                    />
                  )}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer section */}
      <div className='mt-auto p-4 border-t border-sidebar-border/40'>
        <div className='flex items-center justify-between px-2 py-1'>
          <div className='flex items-center gap-3'>
            <div className='w-8 h-8 rounded-full bg-primary-700/50 flex items-center justify-center text-primary-100 font-semibold'>
              AD
            </div>
            <div className='flex flex-col'>
              <span className='text-sm font-medium'>{authT('admin')}</span>
              <span className='text-xs text-primary-300'>
                {authT('systemAdmin')}
              </span>
            </div>
          </div>
          <button
            className='p-1.5 text-primary-300 hover:text-primary-100 rounded-md transition-colors'
            aria-label={authT('logOut')}>
            <LogOut className='size-4' />
          </button>
        </div>
      </div>
    </aside>
  )
}
