'use client'

import * as React from 'react'
import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light' | 'system'

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
  attribute?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

type ThemeContextType = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeContextType = {
  theme: 'system',
  setTheme: () => null,
}

const ThemeContext = createContext<ThemeContextType>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'theme',
  attribute = 'data-theme',
  enableSystem = true,
  disableTransitionOnChange = false,
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)

  useEffect(() => {
    const root = window.document.documentElement

    // Remove previous theme attributes
    root.removeAttribute(attribute)
    root.classList.remove('light', 'dark')

    // Get stored theme from localStorage or use default
    const storedTheme = localStorage.getItem(storageKey) as Theme | null
    let resolvedTheme = storedTheme || defaultTheme

    // Handle system theme preference
    if (resolvedTheme === 'system' && enableSystem) {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light'
      resolvedTheme = systemTheme
    }

    // Apply theme class
    root.classList.add(resolvedTheme)
    setTheme(storedTheme || defaultTheme)

    // Listen for system theme changes
    if (enableSystem) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

      const handleChange = () => {
        if (theme === 'system') {
          const newTheme = mediaQuery.matches ? 'dark' : 'light'
          root.classList.remove('light', 'dark')
          root.classList.add(newTheme)
        }
      }

      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [
    theme,
    attribute,
    defaultTheme,
    enableSystem,
    storageKey,
    disableTransitionOnChange,
  ])

  // Update localStorage and document class when theme changes
  const setThemeValue = React.useCallback(
    (newTheme: Theme) => {
      localStorage.setItem(storageKey, newTheme)
      setTheme(newTheme)
    },
    [storageKey]
  )

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setThemeValue }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
