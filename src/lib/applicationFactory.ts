import type {
  ResumeApplication,
  ResumeToneId,
  TemplateId,
} from '../types/application'
import type { ResumeProfile } from '../types/profile'
import { getTone } from '../data/tones'
import { uid } from './id'
import { defaultPrintPrefs, normalizePrintPrefs } from './printPrefs'

export function emptyApplication(
  profile: ResumeProfile,
  partial?: Partial<ResumeApplication>,
): ResumeApplication {
  const now = new Date().toISOString()
  const templateId = partial?.templateId ?? 'ats-classic'
  const mode = partial?.mode ?? 'external'
  // External versions hide work email by default; internal shows both.
  const emailDefaults =
    mode === 'internal'
      ? { includeProfessionalEmail: true, includeInternalEmail: true }
      : { includeProfessionalEmail: true, includeInternalEmail: false }
  const base: ResumeApplication = {
    schema: 'ResumeApplication.v1',
    applicationId: uid('app'),
    profileId: profile.profileId,
    label: 'General application',
    targetTitle: '',
    targetCompany: '',
    currentTitle: '',
    mode: 'external',
    industryPackId: profile.defaultIndustryPackId || 'manufacturing',
    tone: 'ats-external',
    templateId: 'ats-classic',
    includeProfessionalEmail: emailDefaults.includeProfessionalEmail,
    includeInternalEmail: emailDefaults.includeInternalEmail,
    featuredJobIds: [],
    featuredSkillKeys: [],
    summaryOverride: '',
    jobDescription: '',
    jdKeywords: [],
    pinnedBulletKeys: [],
    internalCompanyFilter: false,
    coverLetter: '',
    printPrefs: defaultPrintPrefs(templateId),
    updatedAt: now,
  }
  const merged: ResumeApplication = {
    ...base,
    ...partial,
    schema: 'ResumeApplication.v1',
    updatedAt: now,
    applicationId: partial?.applicationId ?? base.applicationId,
    profileId: partial?.profileId ?? base.profileId,
  }
  // If caller set mode but not email flags, keep mode-aware defaults
  if (partial?.includeProfessionalEmail === undefined) {
    merged.includeProfessionalEmail =
      merged.mode === 'internal' ? true : true
  }
  if (partial?.includeInternalEmail === undefined) {
    merged.includeInternalEmail = merged.mode === 'internal'
  }
  const tid = merged.templateId
  return {
    ...merged,
    printPrefs: normalizePrintPrefs(
      partial?.printPrefs ?? base.printPrefs,
      tid,
    ),
  }
}

export function duplicateApplication(app: ResumeApplication): ResumeApplication {
  return {
    ...app,
    applicationId: uid('app'),
    label: `${app.label || 'Application'} (copy)`,
    // Deep-copy arrays so pins/keywords don't share refs
    featuredJobIds: [...(app.featuredJobIds ?? [])],
    featuredSkillKeys: [...(app.featuredSkillKeys ?? [])],
    jdKeywords: [...(app.jdKeywords ?? [])],
    pinnedBulletKeys: [...(app.pinnedBulletKeys ?? [])],
    coverLetter: app.coverLetter ?? '',
    updatedAt: new Date().toISOString(),
  }
}

export function touchApplication(app: ResumeApplication): ResumeApplication {
  return { ...app, updatedAt: new Date().toISOString() }
}

export function defaultLabel(
  targetTitle: string,
  targetCompany: string,
  mode: ResumeApplication['mode'],
): string {
  const title = targetTitle.trim()
  const company = targetCompany.trim()
  if (title && company) return `${title} @ ${company}`
  if (title) return title
  if (company) return company
  return mode === 'internal' ? 'Internal promotion' : 'General application'
}

export function withTemplate(
  app: ResumeApplication,
  templateId: TemplateId,
): ResumeApplication {
  return touchApplication({ ...app, templateId })
}

/** Apply tone → templateId (+ mode for internal). */
export function withTone(
  app: ResumeApplication,
  toneId: ResumeToneId,
): ResumeApplication {
  const tone = getTone(toneId)
  const mode =
    tone.id === 'internal-promo' ? 'internal' : app.mode
  return touchApplication({
    ...app,
    tone: tone.id,
    templateId: tone.templateId,
    mode,
    // Switching into internal promo → include work email; leave flags alone otherwise
    ...(tone.id === 'internal-promo'
      ? { includeInternalEmail: true, includeProfessionalEmail: true }
      : {}),
  })
}

/** Mode change with email defaults for external vs internal. */
export function withMode(
  app: ResumeApplication,
  mode: ResumeApplication['mode'],
): ResumeApplication {
  if (mode === 'internal') {
    return touchApplication({
      ...app,
      mode: 'internal',
      includeInternalEmail: true,
      includeProfessionalEmail: true,
    })
  }
  return touchApplication({
    ...app,
    mode: 'external',
    includeInternalEmail: false,
    includeProfessionalEmail: true,
  })
}
