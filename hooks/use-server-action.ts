// hooks/use-server-action.ts
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query'

export type ServerActionOptions<TData, TError, TVariables, TContext> = {
  action: (variables: TVariables) => Promise<TData>
  invalidateQueries?: string[]
  invalidateTags?: string[]
  successMessage?: string
  errorMessage?: string
  onSuccess?: (data: TData, variables: TVariables, context: TContext) => void
  onError?: (error: TError, variables: TVariables, context: TContext) => void
  mutationOptions?: Omit<
    UseMutationOptions<TData, TError, TVariables, TContext>,
    'mutationFn'
  >
  refreshOnSuccess?: boolean
}

/**
 * Hook for using server actions with react-query
 */
export function useServerAction<
  TData,
  TError = Error,
  TVariables = void,
  TContext = unknown
>({
  action,
  invalidateQueries = [],
  invalidateTags = [],
  successMessage,
  errorMessage,
  onSuccess,
  onError,
  mutationOptions = {},
  refreshOnSuccess = true,
}: ServerActionOptions<TData, TError, TVariables, TContext>) {
  const queryClient = useQueryClient()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const mutation = useMutation<TData, TError, TVariables, TContext>({
    mutationFn: async (variables) => {
      setIsLoading(true)
      try {
        return await action(variables)
      } finally {
        setIsLoading(false)
      }
    },
    onSuccess: (data, variables, context) => {
      // Invalidate queries
      if (invalidateQueries.length > 0) {
        invalidateQueries.forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey: [queryKey] })
        })
      }

      // Refresh the page to get the latest data from the server
      if (refreshOnSuccess) {
        router.refresh()
      }

      // Call the success callback
      onSuccess?.(data, variables, context)
    },
    onError: (error, variables, context) => {
      console.error('Server action error:', error)

      // Call the error callback
      onError?.(error, variables, context)
    },
    ...mutationOptions,
  })

  return {
    ...mutation,
    isLoading,
  }
}
