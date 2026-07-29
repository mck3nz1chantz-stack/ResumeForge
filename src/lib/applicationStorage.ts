import type { ResumeApplication } from '../types/application'
import type { ResumeProfile } from '../types/profile'
import { isToneId, toneFromTemplate } from '../data/tones'
import { emptyApplication } from './applicationFactory'
import { normalizePrintPrefs } from './printPrefs'
import { isTemplateId } from './templates'

export const APPS_STORAGE_KEY = 'resumeforge.applications.v1'
export const ACTIVE_APP_KEY = 'resumeforge.activeApplicationId.v1'

export function loadApplications(profile: ResumeProfile): ResumeApplication[] {
  try {
    const raw = localStorage.getItem(APPS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as ResumeApplication[]
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((a) => a?.schema === 'ResumeApplication.v1')
      .map((a) => normalizeApp(a, profile))
  } catch {
    return []
  }
}

function normalizeApp(
  a: ResumeApplication,
  profile: ResumeProfile,
): ResumeApplication {
  return normalizeAppFromPartial(a, profile)
}

/** Public for full backup import. */
export function normalizeAppFromPartial(
  a: ResumeApplication,
  profile: ResumeProfile,
): ResumeApplication {
  return {
    ...emptyApplication(profile),
    ...a,
    schema: 'ResumeApplication.v1',
    profileId: a.profileId || profile.profileId,
    featuredJobIds: Array.isArray(a.featuredJobIds) ? a.featuredJobIds : [],
    featuredSkillKeys: Array.isArray(a.featuredSkillKeys)
      ? a.featuredSkillKeys.filter(
          (k): k is string => typeof k === 'string' && k.trim() !== '',
        )
      : [],
    summaryOverride: a.summaryOverride ?? '',
    currentTitle: typeof a.currentTitle === 'string' ? a.currentTitle : '',
    jobDescription: typeof a.jobDescription === 'string' ? a.jobDescription : '',
    jdKeywords: Array.isArray(a.jdKeywords)
      ? a.jdKeywords.filter((k): k is string => typeof k === 'string' && k.trim() !== '')
      : [],
    pinnedBulletKeys: Array.isArray(a.pinnedBulletKeys)
      ? a.pinnedBulletKeys.filter(
          (k): k is string => typeof k === 'string' && k.trim() !== '',
        )
      : [],
    internalCompanyFilter: Boolean(a.internalCompanyFilter),
    coverLetter: typeof a.coverLetter === 'string' ? a.coverLetter : '',
    industryPackId: a.industryPackId || profile.defaultIndustryPackId || 'manufacturing',
    templateId: isTemplateId(a.templateId) ? a.templateId : 'ats-classic',
    tone: isToneId(a.tone ?? '')
      ? a.tone!
      : toneFromTemplate(
          isTemplateId(a.templateId) ? a.templateId : 'ats-classic',
        ),
    mode: a.mode === 'internal' ? 'internal' : 'external',
    // Legacy apps: external hid both emails incorrectly — default work email off for external
    includeProfessionalEmail:
      typeof a.includeProfessionalEmail === 'boolean'
        ? a.includeProfessionalEmail
        : true,
    includeInternalEmail:
      typeof a.includeInternalEmail === 'boolean'
        ? a.includeInternalEmail
        : a.mode === 'internal',
    printPrefs: normalizePrintPrefs(
      a.printPrefs,
      isTemplateId(a.templateId) ? a.templateId : 'ats-classic',
    ),
  }
}

export function saveApplications(apps: ResumeApplication[]): void {
  localStorage.setItem(APPS_STORAGE_KEY, JSON.stringify(apps))
}

export function loadActiveApplicationId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_APP_KEY)
  } catch {
    return null
  }
}

export function saveActiveApplicationId(id: string | null): void {
  if (id) localStorage.setItem(ACTIVE_APP_KEY, id)
  else localStorage.removeItem(ACTIVE_APP_KEY)
}

export function downloadApplicationJson(app: ResumeApplication): void {
  const blob = new Blob([JSON.stringify(app, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const slug =
    app.label.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') ||
    'application'
  a.href = url
  a.download = `resumeforge-app-${slug}.json`
  a.click()
  URL.revokeObjectURL(url)
}
