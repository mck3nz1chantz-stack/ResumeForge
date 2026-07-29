export type OnboardPath = 'external' | 'internal'

export type OnboardState = {
  completed: boolean
  skipped: boolean
  path: OnboardPath | null
  /** Company name locked for internal path */
  internalCompany: string
  updatedAt: string
}

const KEY = 'resumeforge.onboarding.v1'

export function defaultOnboardState(): OnboardState {
  return {
    completed: false,
    skipped: false,
    path: null,
    internalCompany: '',
    updatedAt: new Date().toISOString(),
  }
}

export function loadOnboardState(): OnboardState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return defaultOnboardState()
    const p = JSON.parse(raw) as OnboardState
    return { ...defaultOnboardState(), ...p }
  } catch {
    return defaultOnboardState()
  }
}

export function saveOnboardState(state: OnboardState): void {
  localStorage.setItem(
    KEY,
    JSON.stringify({ ...state, updatedAt: new Date().toISOString() }),
  )
}

export function markOnboardDone(
  path: OnboardPath | null,
  opts?: { skipped?: boolean; internalCompany?: string },
): void {
  saveOnboardState({
    completed: true,
    skipped: !!opts?.skipped,
    path,
    internalCompany: opts?.internalCompany ?? '',
    updatedAt: new Date().toISOString(),
  })
}

export function resetOnboardState(): void {
  localStorage.removeItem(KEY)
}

/** Show wizard if never finished and profile has no meaningful history. */
export function shouldShowOnboarding(
  state: OnboardState,
  hasHistory: boolean,
): boolean {
  if (state.completed || state.skipped) return false
  if (hasHistory) return false
  return true
}

export function profileHasHistory(profile: {
  contact: { name: string }
  jobs: unknown[]
  education: unknown[]
}): boolean {
  return (
    profile.contact.name.trim().length > 0 ||
    profile.jobs.length > 0 ||
    profile.education.length > 0
  )
}
