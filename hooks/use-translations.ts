'use client'

import { useTranslations } from 'next-intl'

/**
 * A convenience hook to access translations with namespace support
 *
 * @param namespace The translation namespace
 * @returns The translation function for the specified namespace
 */
export function useAppTranslations(namespace?: string) {
  return useTranslations(namespace)
}
