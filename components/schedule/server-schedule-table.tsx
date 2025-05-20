// components/schedule/server-schedule-table.tsx
'use client'

import { ColumnDef } from '@tanstack/react-table'
import { ScheduledJob } from '@/actions/schedule'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Play, Pause, Trash2, Edit } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { ServerDataTable } from '@/components/tables/server-data-table'
import { toast } from '@/components/ui/toast'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { updateScheduledJob, deleteScheduledJob } from '@/actions/schedule'
import { useServerAction } from '@/hooks/use-server-action'
import { useQueryClient } from '@tanstack/react-query'

// Mapping for column keys to display names
const columnMapping: Record<string, string> = {
  username: 'Assign',
  external_linked: 'External Cver',
  setting_id: 'Setting ID',
  status: 'Scheduler Status',
  job_name: 'Project',
  job_status: 'Result',
  modified: 'Latest Update',
  is_maintaining: 'Maintaining Request',
  media: 'Media',
  media_master_update: 'Media Master Update',
  scheduler_weekday: 'Schedule Week Day',
  scheduler_time: 'Schedule Time',
  time: 'Time',
  cube_off: 'Cube Off',
  conmane_off: 'Conmane Off',
  redownload_type: 'Redownload Type',
  redownload: 'Redownload',
  master_update_redownload_type: 'Master Update Redownload Type',
  master_update_redownload: 'Master Update Redownload',
  upload: 'Upload',
  upload_opemane: 'Upload Opemane',
  opemane: 'Opemane',
  split_medias: 'Split Medias',
  split_days: 'Split Days',
  which_process: 'Which Process',
  cad_inform: 'Cad Inform',
  conmane_confirm: 'Conmane Confirm',
  group_by: 'Group By',
  cad_id: 'Cad ID',
  wait_time: 'Wait Time Rate',
  spreadsheet_id: 'Spreadsheet ID',
  spreadsheet_sheet: 'Spreadsheet Sheet',
  drive_folder: 'Drive Folder',
  old_drive_folder: 'Old Drive Folder',
  custom_info: 'Custom Info',
  master_account: 'Master Account',
  skip_to: 'Skip To',
  use_api: 'Use API',
  workplace: 'Workplace',
  chanel_id: 'Chanel ID',
  slack_id: 'Slack ID',
}

export type JobType = 'NAVI' | 'CVER'

interface ServerScheduleTableProps {
  jobType: JobType
  data: ScheduledJob[]
  pagination: {
    pageCount: number
    page: number
    limit: number
  }
  totalCount: number
  searchValue: string
}

/**
 * Server-side rendered table component for displaying scheduled jobs
 */
export function ServerScheduleTable({
  jobType,
  data,
  pagination,
  totalCount,
  searchValue,
}: ServerScheduleTableProps) {
  const t = useTranslations('Schedule')
  const router = useRouter()
  const pathname = usePathname()
  const queryClient = useQueryClient()

  // Get the tag for this job type
  const jobTypeTag = `scheduledJobs-${jobType}`

  // Use the server action wrapper for updateJob with optimistic updates
  const updateJobMutation = useServerAction({
    action: updateScheduledJob,
    invalidateTags: [jobTypeTag],
    successMessage: t('successfullyUpdated'),
    errorMessage: t('errorUpdating'),
    refreshOnSuccess: true,
    mutationOptions: {
      // Add optimistic update
      onMutate: async (newJob) => {
        // Cancel outgoing refetches
        await queryClient.cancelQueries({ queryKey: [jobTypeTag] })

        // Snapshot the previous value
        const previousJobs = queryClient.getQueryData([jobTypeTag])

        // Optimistically update to the new value
        queryClient.setQueryData([jobTypeTag], (old: any) => {
          if (!old) return old

          // Create a copy of the results with the updated job
          return {
            ...old,
            results: old.results.map((job: ScheduledJob) =>
              job.id === newJob.id ? { ...job, ...newJob } : job
            ),
          }
        })

        // Return a context object with the snapshot
        return { previousJobs }
      },
      // If the mutation fails, roll back to the previous value
      onError: (err, newJob, context) => {
        queryClient.setQueryData([jobTypeTag], context?.previousJobs)
      },
    },
  })

  // Use the server action wrapper for deleteJob with optimistic updates
  const deleteJobMutation = useServerAction({
    action: deleteScheduledJob,
    invalidateTags: [jobTypeTag],
    successMessage: t('successfullyDeleted'),
    errorMessage: t('errorDeleting'),
    refreshOnSuccess: true,
    mutationOptions: {
      // Add optimistic update
      onMutate: async (jobId) => {
        // Cancel outgoing refetches
        await queryClient.cancelQueries({ queryKey: [jobTypeTag] })

        // Snapshot the previous value
        const previousJobs = queryClient.getQueryData([jobTypeTag])

        // Optimistically update to the new value
        queryClient.setQueryData([jobTypeTag], (old: any) => {
          if (!old) return old

          // Create a copy of the results without the deleted job
          return {
            ...old,
            count: old.count - 1,
            results: old.results.filter(
              (job: ScheduledJob) => job.id !== jobId
            ),
          }
        })

        // Return a context object with the snapshot
        return { previousJobs }
      },
      // If the mutation fails, roll back to the previous value
      onError: (err, jobId, context) => {
        queryClient.setQueryData([jobTypeTag], context?.previousJobs)
      },
    },
  })

  // Define the columns for the table
  const columns = getColumns()

  // Get columns with specific column widths
  function getColumns(): ColumnDef<ScheduledJob>[] {
    // Define column widths based on key
    const columnWidths: Record<
      string,
      { width: string; minWidth: string; maxWidth: string }
    > = {
      username: { width: '150px', minWidth: '120px', maxWidth: '200px' },
      external_linked: { width: '150px', minWidth: '120px', maxWidth: '180px' },
      setting_id: { width: '150px', minWidth: '120px', maxWidth: '180px' },
      status: { width: '150px', minWidth: '120px', maxWidth: '180px' },
      job_name: { width: '300px', minWidth: '200px', maxWidth: '400px' },
      job_status: { width: '150px', minWidth: '120px', maxWidth: '180px' },
      modified: { width: '200px', minWidth: '180px', maxWidth: '250px' },
      is_maintaining: { width: '180px', minWidth: '150px', maxWidth: '200px' },
      media: { width: '150px', minWidth: '120px', maxWidth: '250px' },
      media_master_update: {
        width: '200px',
        minWidth: '180px',
        maxWidth: '250px',
      },
      scheduler_weekday: {
        width: '180px',
        minWidth: '150px',
        maxWidth: '200px',
      },
      scheduler_time: { width: '150px', minWidth: '120px', maxWidth: '180px' },
      time: { width: '120px', minWidth: '100px', maxWidth: '150px' },
      cube_off: { width: '150px', minWidth: '120px', maxWidth: '180px' },
      conmane_off: { width: '150px', minWidth: '120px', maxWidth: '180px' },
      redownload_type: { width: '200px', minWidth: '180px', maxWidth: '250px' },
      redownload: { width: '150px', minWidth: '120px', maxWidth: '180px' },
      master_update_redownload_type: {
        width: '250px',
        minWidth: '200px',
        maxWidth: '300px',
      },
      master_update_redownload: {
        width: '200px',
        minWidth: '180px',
        maxWidth: '250px',
      },
      upload: { width: '120px', minWidth: '100px', maxWidth: '150px' },
      upload_opemane: { width: '180px', minWidth: '150px', maxWidth: '200px' },
      opemane: { width: '150px', minWidth: '120px', maxWidth: '200px' },
      split_medias: { width: '180px', minWidth: '150px', maxWidth: '250px' },
      split_days: { width: '150px', minWidth: '120px', maxWidth: '180px' },
      which_process: { width: '180px', minWidth: '150px', maxWidth: '200px' },
      cad_inform: { width: '150px', minWidth: '120px', maxWidth: '180px' },
      conmane_confirm: { width: '180px', minWidth: '150px', maxWidth: '200px' },
      group_by: { width: '150px', minWidth: '120px', maxWidth: '180px' },
      cad_id: { width: '150px', minWidth: '120px', maxWidth: '180px' },
      wait_time: { width: '150px', minWidth: '120px', maxWidth: '180px' },
      spreadsheet_id: { width: '250px', minWidth: '200px', maxWidth: '300px' },
      spreadsheet_sheet: {
        width: '200px',
        minWidth: '180px',
        maxWidth: '250px',
      },
      drive_folder: { width: '250px', minWidth: '200px', maxWidth: '400px' },
      old_drive_folder: {
        width: '250px',
        minWidth: '200px',
        maxWidth: '400px',
      },
      custom_info: { width: '200px', minWidth: '150px', maxWidth: '300px' },
      master_account: { width: '180px', minWidth: '150px', maxWidth: '250px' },
      skip_to: { width: '150px', minWidth: '120px', maxWidth: '180px' },
      use_api: { width: '150px', minWidth: '120px', maxWidth: '180px' },
      workplace: { width: '150px', minWidth: '120px', maxWidth: '200px' },
      chanel_id: { width: '150px', minWidth: '120px', maxWidth: '180px' },
      slack_id: { width: '150px', minWidth: '120px', maxWidth: '180px' },
      actions: { width: '120px', minWidth: '100px', maxWidth: '150px' },
    }

    // Create columns from the columnMapping
    const baseColumns = Object.entries(columnMapping)
      .filter(([key]) => {
        // Filter out columns that shouldn't be displayed
        const skipFields = [
          'id',
          'latest_executor_id',
          'output_path',
          'raw_data_path',
          'media_off',
          'media_master_update_off',
        ]
        return !skipFields.includes(key)
      })
      .map(([key, header]) => ({
        accessorKey: key,
        id: key,
        // Meta can be used to pass additional information like width
        meta: {
          width: columnWidths[key] || '180px',
        },
        header: () => (
          <div className='font-semibold text-foreground'>
            {t(key, { defaultValue: header })}
          </div>
        ),
        cell: ({ row }) => {
          const value = row.getValue(key)

          // Handle different types of data
          if (typeof value === 'boolean') {
            return value ? t('yes') : t('no')
          } else if (key === 'modified') {
            // Format date
            return new Date(value as string).toLocaleString()
          } else if (Array.isArray(value)) {
            return value.join(', ')
          }

          return (
            <div className='truncate' title={String(value || '')}>
              {value as React.ReactNode}
            </div>
          )
        },
      }))

    // Add an actions column
    const actionsColumn: ColumnDef<ScheduledJob> = {
      id: 'actions',
      meta: {
        width: '120px',
      },
      header: () => (
        <div className='text-right font-semibold'>{t('actions')}</div>
      ),
      cell: ({ row }) => {
        const job = row.original
        const isActive = job.status === 'ACTIVE'

        return (
          <div className='flex justify-end space-x-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() =>
                handleUpdateJob(job.id, isActive ? 'INACTIVE' : 'ACTIVE')
              }
              disabled={updateJobMutation.isLoading}
              title={isActive ? t('deactivateJob') : t('activateJob')}>
              {isActive ? (
                <Pause className='h-4 w-4' />
              ) : (
                <Play className='h-4 w-4' />
              )}
            </Button>

            <Button
              variant='outline'
              size='sm'
              onClick={() => handleEditJob(job.id)}
              title={t('editJob')}>
              <Edit className='h-4 w-4' />
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant='destructive' size='sm' title={t('deleteJob')}>
                  <Trash2 className='h-4 w-4' />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {t('deleteJobConfirmation')}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('deleteJobDescription')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDeleteJob(job.id)}
                    disabled={deleteJobMutation.isLoading}>
                    {t('delete')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )
      },
    }

    return [...baseColumns, actionsColumn]
  }

  // Handle update job status
  async function handleUpdateJob(id: string, status: string) {
    try {
      await updateJobMutation.mutateAsync({ id, status })

      toast({
        title: t('successfullyUpdated'),
        variant: 'success',
      })
    } catch (error) {
      toast({
        title: t('errorUpdating'),
        description: error instanceof Error ? error.message : t('unknownError'),
        variant: 'destructive',
      })
    }
  }

  // Handle edit job
  function handleEditJob(id: string) {
    // Navigate to edit page or show modal
    console.log('Edit job', id)
    // router.push(`/schedule/edit/${id}`)
  }

  // Handle delete job
  async function handleDeleteJob(id: string) {
    try {
      await deleteJobMutation.mutateAsync(id)

      toast({
        title: t('successfullyDeleted'),
        variant: 'success',
      })
    } catch (error) {
      toast({
        title: t('errorDeleting'),
        description: error instanceof Error ? error.message : t('unknownError'),
        variant: 'destructive',
      })
    }
  }

  return (
    <ServerDataTable
      columns={columns}
      data={data}
      pagination={pagination}
      totalCount={totalCount}
      searchPlaceholder={t('searchJobs')}
      searchValue={searchValue}
      maxHeight='70vh'
    />
  )
}
