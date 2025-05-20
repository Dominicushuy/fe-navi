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

  // components/schedule/server-schedule-table.tsx (đoạn getColumns)
  function getColumns(): ColumnDef<ScheduledJob>[] {
    // Định nghĩa chiều rộng cột dựa vào key
    const columnWidths: Record<string, string> = {
      username: '150px',
      external_linked: '150px',
      setting_id: '150px',
      status: '150px',
      job_name: '300px',
      job_status: '150px',
      modified: '200px',
      is_maintaining: '180px',
      media: '150px',
      media_master_update: '200px',
      scheduler_weekday: '180px',
      scheduler_time: '150px',
      time: '120px',
      cube_off: '150px',
      conmane_off: '150px',
      redownload_type: '200px',
      redownload: '150px',
      master_update_redownload_type: '250px',
      master_update_redownload: '200px',
      upload: '120px',
      upload_opemane: '180px',
      opemane: '150px',
      split_medias: '180px',
      split_days: '150px',
      which_process: '180px',
      cad_inform: '150px',
      conmane_confirm: '180px',
      group_by: '150px',
      cad_id: '150px',
      wait_time: '150px',
      spreadsheet_id: '250px',
      spreadsheet_sheet: '200px',
      drive_folder: '250px',
      old_drive_folder: '250px',
      custom_info: '200px',
      master_account: '180px',
      skip_to: '150px',
      use_api: '150px',
      workplace: '150px',
      chanel_id: '150px',
      slack_id: '150px',
      actions: '120px', // Cột action nhỏ hơn
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
        // Meta có thể dùng để truyền thông tin bổ sung như chiều rộng
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
      // maxHeight='70vh'
    />
  )
}
