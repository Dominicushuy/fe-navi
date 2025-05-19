// hooks/use-scheduled-job-mutations.ts
'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  updateScheduledJob,
  deleteScheduledJob,
  ScheduledJobUpdate,
} from '@/actions/schedule'
import { toast } from '@/components/ui/toast'
import { useTranslations } from 'next-intl'

/**
 * Hook for managing scheduled job mutations (update/delete)
 */
export function useScheduledJobMutations() {
  const queryClient = useQueryClient()
  const t = useTranslations('Schedule')

  const updateMutation = useMutation({
    mutationFn: (update: ScheduledJobUpdate) => updateScheduledJob(update),
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

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteScheduledJob(id),
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

  return {
    updateJob: updateMutation.mutate,
    deleteJob: deleteMutation.mutate,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
  }
}
