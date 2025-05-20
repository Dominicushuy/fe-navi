// types/schedule.ts
/**
 * Schedule related type definitions
 */

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
