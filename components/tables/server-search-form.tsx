// components/tables/server-search-form.tsx
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

interface ServerSearchFormProps {
  basePath: string
  currentSearch?: string
  placeholder?: string
  page?: number
  limit?: number
  additionalParams?: Record<string, string>
}

/**
 * Server-side search form that submits as a regular form POST
 * This is not a client component and doesn't use 'use client'
 */
export function ServerSearchForm({
  basePath,
  currentSearch = '',
  placeholder = 'Search...',
  page = 1,
  limit = 10,
  additionalParams = {},
}: ServerSearchFormProps) {
  // Build hidden fields for additional params
  const hiddenFields = Object.entries(additionalParams).map(([key, value]) => (
    <input key={key} type='hidden' name={key} value={value} />
  ))

  return (
    <form action={basePath} method='get' className='flex items-center mb-4'>
      <div className='relative flex-1 max-w-sm'>
        <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
        <Input
          type='text'
          name='search'
          defaultValue={currentSearch}
          placeholder={placeholder}
          className='pl-8'
        />
        {/* Always reset to page 1 when searching */}
        <input type='hidden' name='page' value='1' />
        <input type='hidden' name='limit' value={limit.toString()} />
        {hiddenFields}
      </div>

      <button
        type='submit'
        className='ml-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90'>
        Search
      </button>
    </form>
  )
}
