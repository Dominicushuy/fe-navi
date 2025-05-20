// app/api/schedule/jobs/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { updateScheduledJob, deleteScheduledJob } from '@/actions/schedule'
import { revalidateTag } from 'next/cache'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    const body = await request.json()

    // Update the job
    const updatedJob = await updateScheduledJob({
      id,
      ...body,
    })

    // Revalidate cache tags
    revalidateTag('scheduledJobs-NAVI')
    revalidateTag('scheduledJobs-CVER')

    return NextResponse.json({
      success: true,
      job: updatedJob,
    })
  } catch (error) {
    console.error('Error updating job:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update job',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id

    // Delete the job
    await deleteScheduledJob(id)

    // Revalidate cache tags
    revalidateTag('scheduledJobs-NAVI')
    revalidateTag('scheduledJobs-CVER')

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('Error deleting job:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete job',
      },
      { status: 500 }
    )
  }
}
