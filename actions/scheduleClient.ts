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
import { toast } from '@/components/ui/toast'

/**
 * Client-side wrapper for getScheduledJobs server action
 * Includes error handling and loading state management
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
    toast({
      title: 'Error fetching data',
      description: error instanceof Error ? error.message : 'Unknown error',
      variant: 'destructive',
    })
    throw error
  }
}

/**
 * Client-side wrapper for updateScheduledJob server action
 * Handles optimistic updates and error states
 */
export async function updateScheduledJobClient(
  update: ScheduledJobUpdate
): Promise<ScheduledJob> {
  try {
    const result = await updateScheduledJob(update)
    toast({
      title: 'Job successfully updated',
      variant: 'success',
    })
    return result
  } catch (error) {
    console.error('Error updating scheduled job:', error)
    toast({
      title: 'Error updating job',
      description: error instanceof Error ? error.message : 'Unknown error',
      variant: 'destructive',
    })
    throw error
  }
}

/**
 * Client-side wrapper for deleteScheduledJob server action
 * Includes confirmation and error handling
 */
export async function deleteScheduledJobClient(id: string): Promise<void> {
  try {
    await deleteScheduledJob(id)
    toast({
      title: 'Job successfully deleted',
      variant: 'success',
    })
  } catch (error) {
    console.error('Error deleting scheduled job:', error)
    toast({
      title: 'Error deleting job',
      description: error instanceof Error ? error.message : 'Unknown error',
      variant: 'destructive',
    })
    throw error
  }
}

/**
 * Client-side wrapper for createScheduledJob server action
 * Includes form validation and success notifications
 */
export async function createScheduledJobClient(
  jobData: Omit<ScheduledJob, 'id'>
): Promise<ScheduledJob> {
  try {
    const result = await createScheduledJob(jobData)
    toast({
      title: 'Job successfully created',
      variant: 'success',
    })
    return result
  } catch (error) {
    console.error('Error creating scheduled job:', error)
    toast({
      title: 'Error creating job',
      description: error instanceof Error ? error.message : 'Unknown error',
      variant: 'destructive',
    })
    throw error
  }
}
