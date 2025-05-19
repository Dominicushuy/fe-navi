// hooks/use-scheduled-job-mutations.ts
'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ScheduledJobUpdate } from '@/actions/schedule'
import { toast } from '@/components/ui/toast'
import { useTranslations } from 'next-intl'

/**
 * Hook for managing scheduled job mutations (update/delete/create)
 */
export function useScheduledJobMutations() {
  const queryClient = useQueryClient()
  const t = useTranslations('Schedule')

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (update: ScheduledJobUpdate) => {
      const response = await fetch(`/api/schedule/jobs/${update.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || t('errorUpdating'))
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate relevant queries when a job is updated
      queryClient.invalidateQueries({ queryKey: ['scheduledJobs'] })

      toast({
        title: t('successfullyUpdated'),
        variant: 'success',
      })
    },
    onError: (error) => {
      toast({
        title: t('errorUpdating'),
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/schedule/jobs/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || t('errorDeleting'))
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate relevant queries when a job is deleted
      queryClient.invalidateQueries({ queryKey: ['scheduledJobs'] })

      toast({
        title: t('successfullyDeleted'),
        variant: 'success',
      })
    },
    onError: (error) => {
      toast({
        title: t('errorDeleting'),
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (jobData: any) => {
      const response = await fetch('/api/schedule/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || t('errorCreating'))
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate relevant queries when a job is created
      queryClient.invalidateQueries({ queryKey: ['scheduledJobs'] })

      toast({
        title: t('successfullyCreated'),
        variant: 'success',
      })
    },
    onError: (error) => {
      toast({
        title: t('errorCreating'),
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  return {
    createJob: createMutation.mutate,
    updateJob: updateMutation.mutate,
    deleteJob: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
  }
}
