// app/api/schedule/jobs/route.ts
import { auth } from '@/lib/auth'
import { getScheduledJobs, createScheduledJob } from '@/actions/schedule'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET handler for fetching scheduled jobs with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await auth.getCurrentUser()
    if (!user || !user.access) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const jobType = (searchParams.get('jobType') as 'NAVI' | 'CVER') || 'NAVI'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''

    // Call the server action
    const data = await getScheduledJobs(jobType, page, limit, search)

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching scheduled jobs:', error)
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to fetch scheduled jobs' },
      { status: 500 }
    )
  }
}

/**
 * POST handler for creating new scheduled jobs
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await auth.getCurrentUser()
    if (!user || !user.access) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Parse request body
    const jobData = await request.json()

    // Call the server action
    const result = await createScheduledJob(jobData)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error creating scheduled job:', error)
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to create scheduled job' },
      { status: 500 }
    )
  }
}
