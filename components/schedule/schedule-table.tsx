// components/schedule/schedule-table.tsx
'use client'

import { DataTable } from '@/components/tables/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { useScheduledJobs } from '@/hooks/use-scheduled-jobs'
import { ScheduledJob } from '@/actions/schedule'
import { useScheduledJobMutations } from '@/hooks/use-scheduled-job-mutations'
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

/**
 * Table component for displaying scheduled jobs based on job type
 */
export function ScheduleTable({ jobType }: { jobType: JobType }) {
  const t = useTranslations('Schedule')
  const {
    data,
    isLoading,
    isError,
    error,
    page,
    setPage,
    limit,
    setLimit,
    search,
    setSearch,
  } = useScheduledJobs(jobType)
  const { updateJob, deleteJob, isUpdating, isDeleting } =
    useScheduledJobMutations()

  // Define the columns for the table
  const columns = getColumns()

  function getColumns(): ColumnDef<ScheduledJob>[] {
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
        header: () => <div>{t(key, { defaultValue: header })}</div>,
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
            <div className='whitespace-nowrap'>{value as React.ReactNode}</div>
          )
        },
      }))

    // Add an actions column
    const actionsColumn: ColumnDef<ScheduledJob> = {
      id: 'actions',
      header: () => <div className='text-right'>{t('actions')}</div>,
      cell: ({ row }) => {
        const job = row.original
        const isActive = job.status === 'ACTIVE'

        return (
          <div className='flex justify-end space-x-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() =>
                updateJob({
                  id: job.id,
                  status: isActive ? 'INACTIVE' : 'ACTIVE',
                })
              }
              disabled={isUpdating}
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
              onClick={() => {
                // You might want to navigate to an edit page or open a modal here
                console.log('Edit job', job.id)
              }}
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
                    onClick={() => deleteJob(job.id)}
                    disabled={isDeleting}>
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

  if (isError) {
    return (
      <div className='rounded-md bg-destructive/10 p-6 text-center'>
        <h3 className='text-lg font-medium text-destructive mb-2'>
          {t('errorFetchingData')}
        </h3>
        <p className='text-sm text-destructive/80 mb-4'>
          {error instanceof Error ? error.message : t('unknownError')}
        </p>
        <Button variant='outline' onClick={() => window.location.reload()}>
          {t('tryAgain')}
        </Button>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {isLoading ? (
        <div className='flex justify-center py-8'>
          <div className='animate-spin h-8 w-8 border-t-2 border-b-2 border-primary rounded-full'></div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={data?.results || []}
          searchPlaceholder={t('searchJobs')}
          searchColumn='job_name'
        />
      )}
    </div>
  )
}
