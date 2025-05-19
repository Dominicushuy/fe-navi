// actions/schedule.ts
'use server'

import { auth } from '@/lib/auth'
import { revalidateTag } from 'next/cache'

// Type definitions
export interface ScheduledJob {
  id: string
  username: string
  external_linked: boolean
  setting_id: string
  status: string
  job_name: string
  job_status: string
  modified: string
  is_maintaining: boolean
  latest_executor_id: string
  output_path: string
  raw_data_path: string
  media: string
  media_off: boolean
  media_master_update: boolean
  media_master_update_off: boolean
  scheduler_weekday: string
  scheduler_time: string
  time: string
  cube_off: boolean
  conmane_off: boolean
  redownload_type: string
  redownload: boolean
  master_update_redownload_type: string
  master_update_redownload: boolean
  upload: boolean
  upload_opemane: boolean
  opemane: string
  split_medias: string[]
  split_days: number
  which_process: string
  cad_inform: boolean
  conmane_confirm: boolean
  group_by: string
  cad_id: string
  wait_time: number
  spreadsheet_id: string
  spreadsheet_sheet: string
  drive_folder: string
  old_drive_folder: string
  custom_info: string
  master_account: string
  skip_to: string
  use_api: boolean
  workplace: string
  chanel_id: string
  slack_id: string
}

export interface ScheduledJobResponse {
  count: number
  next: string | null
  previous: string | null
  results: ScheduledJob[]
}

export interface ScheduledJobUpdate {
  id: string
  [key: string]: any // Allow any field to be updated
}

/**
 * Fetch scheduled jobs from the API
 */
export async function getScheduledJobs(
  jobType: 'NAVI' | 'CVER',
  page: number = 1,
  limit: number = 20,
  search: string = ''
): Promise<ScheduledJobResponse> {
  const user = await auth.getCurrentUser()
  if (!user || !user.access) {
    throw new Error('Not authenticated')
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL
  const apiUrl = `${baseUrl}/job/scheduled-job/`

  const queryParams = new URLSearchParams({
    is_deleted: 'false',
    job_type: jobType,
    search,
    page: page.toString(),
    limit: limit.toString(),
  })

  try {
    const response = await fetch(`${apiUrl}?${queryParams.toString()}`, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.access}`,
      },
      next: {
        tags: [`scheduledJobs-${jobType}`],
        revalidate: 60, // Revalidate every 60 seconds
      },
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      throw new Error(
        `Error fetching scheduled jobs: ${response.status} ${errorText}`
      )
    }

    return await response.json()
  } catch (error) {
    console.error('Failed to fetch scheduled jobs:', error)
    throw error
  }
}

/**
 * Update a scheduled job
 */
export async function updateScheduledJob(
  update: ScheduledJobUpdate
): Promise<ScheduledJob> {
  const user = await auth.getCurrentUser()
  if (!user || !user.access) {
    throw new Error('Not authenticated')
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL
  const apiUrl = `${baseUrl}/job/scheduled-job/${update.id}/`

  try {
    const response = await fetch(apiUrl, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.access}`,
      },
      body: JSON.stringify(update),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      throw new Error(
        `Error updating scheduled job: ${response.status} ${errorText}`
      )
    }

    // Revalidate the tags after successful update
    revalidateTag(`scheduledJobs-NAVI`)
    revalidateTag(`scheduledJobs-CVER`)

    return await response.json()
  } catch (error) {
    console.error('Failed to update scheduled job:', error)
    throw error
  }
}

/**
 * Delete a scheduled job
 */
export async function deleteScheduledJob(id: string): Promise<void> {
  const user = await auth.getCurrentUser()
  if (!user || !user.access) {
    throw new Error('Not authenticated')
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL
  const apiUrl = `${baseUrl}/job/scheduled-job/${id}/`

  try {
    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.access}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      throw new Error(
        `Error deleting scheduled job: ${response.status} ${errorText}`
      )
    }

    // Revalidate the tags after successful deletion
    revalidateTag(`scheduledJobs-NAVI`)
    revalidateTag(`scheduledJobs-CVER`)
  } catch (error) {
    console.error('Failed to delete scheduled job:', error)
    throw error
  }
}

/**
 * Create a new scheduled job
 */
export async function createScheduledJob(
  jobData: Omit<ScheduledJob, 'id'>
): Promise<ScheduledJob> {
  const user = await auth.getCurrentUser()
  if (!user || !user.access) {
    throw new Error('Not authenticated')
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL
  const apiUrl = `${baseUrl}/job/scheduled-job/`

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.access}`,
      },
      body: JSON.stringify(jobData),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      throw new Error(
        `Error creating scheduled job: ${response.status} ${errorText}`
      )
    }

    // Revalidate the tags after successful creation
    revalidateTag(`scheduledJobs-NAVI`)
    revalidateTag(`scheduledJobs-CVER`)

    return await response.json()
  } catch (error) {
    console.error('Failed to create scheduled job:', error)
    throw error
  }
}
