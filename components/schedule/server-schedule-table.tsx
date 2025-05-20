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
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [jobToDelete, setJobToDelete] = useState<string | null>(null)

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
                handleUpdateJob(job.id, isActive ? 'INACTIVE' : 'ACTIVE')
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
                    onClick={() => setJobToDelete(job.id)}
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

  // Handle update job status
  async function handleUpdateJob(id: string, status: string) {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/schedule/jobs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })

      if (!response.ok) {
        throw new Error(t('errorUpdating'))
      }

      toast({
        title: t('successfullyUpdated'),
        variant: 'success',
      })

      // Refresh the current page to show updated data
      router.refresh()
    } catch (error) {
      toast({
        title: t('errorUpdating'),
        description: error instanceof Error ? error.message : t('unknownError'),
        variant: 'destructive',
      })
    } finally {
      setIsUpdating(false)
    }
  }

  // Handle edit job
  function handleEditJob(id: string) {
    // Navigate to edit page or show modal
    console.log('Edit job', id)
    // router.push(`/schedule/edit/${id}`)
  }

  // Handle delete job
  async function handleDeleteJob() {
    if (!jobToDelete) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/schedule/jobs/${jobToDelete}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(t('errorDeleting'))
      }

      toast({
        title: t('successfullyDeleted'),
        variant: 'success',
      })

      // Refresh the current page to show updated data
      router.refresh()
    } catch (error) {
      toast({
        title: t('errorDeleting'),
        description: error instanceof Error ? error.message : t('unknownError'),
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
      setJobToDelete(null)
    }
  }

  // If delete job is set, handle it
  if (jobToDelete) {
    handleDeleteJob()
  }

  return (
    <ServerDataTable
      columns={columns}
      data={data}
      pagination={pagination}
      totalCount={totalCount}
      searchPlaceholder={t('searchJobs')}
      searchValue={searchValue}
    />
  )
}
