// actions/scheduleClient.ts
'use client'

import {
  getScheduledJobs,
  updateScheduledJob,
  deleteScheduledJob,
  createScheduledJob,
} from './schedule'
import {
  ScheduledJob,
  ScheduledJobResponse,
  ScheduledJobUpdate,
} from '@/types/schedule'

/**
 * Client-side wrapper for getScheduledJobs server action
 */
export async function fetchScheduledJobs(
  jobType: 'NAVI' | 'CVER',
  page: number = 1,
  limit: number = 20,
  search: string = ''
): Promise<ScheduledJobResponse> {
  try {
    return await getScheduledJobs(jobType, page, limit, search)
  } catch (error) {
    console.error('Error fetching scheduled jobs:', error)
    throw error
  }
}

/**
 * Client-side wrapper for updateScheduledJob server action
 */
export async function updateScheduledJobClient(
  update: ScheduledJobUpdate
): Promise<ScheduledJob> {
  try {
    return await updateScheduledJob(update)
  } catch (error) {
    console.error('Error updating scheduled job:', error)
    throw error
  }
}

/**
 * Client-side wrapper for deleteScheduledJob server action
 */
export async function deleteScheduledJobClient(id: string): Promise<void> {
  try {
    return await deleteScheduledJob(id)
  } catch (error) {
    console.error('Error deleting scheduled job:', error)
    throw error
  }
}

/**
 * Client-side wrapper for createScheduledJob server action
 */
export async function createScheduledJobClient(
  jobData: Omit<ScheduledJob, 'id'>
): Promise<ScheduledJob> {
  try {
    return await createScheduledJob(jobData)
  } catch (error) {
    console.error('Error creating scheduled job:', error)
    throw error
  }
}
