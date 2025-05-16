// constants/router/page.ts
/**
 * Default page to redirect to after login or when accessing the root path
 */
export const DEFAULT_PAGE = 'schedule'

export const ROUTES = {
  SCHEDULE: 'schedule',
  SETTINGS: 'setting',
  HISTORY: {
    INDEX: 'history',
    EXECUTION: 'history/execution',
    SETTING_CHANGE: 'history/setting-change',
  },
  CREDENTIAL: 'credential',
  PARAMETER_STORAGE: {
    INDEX: 'parameter-storage',
    MANAGER: 'parameter-storage/manager',
    ACTIVITY_LOG: 'parameter-storage/activity-log',
  },
}
