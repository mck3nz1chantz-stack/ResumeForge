import type {
  PrintPrefs,
  ResumeApplication,
  TemplateId,
} from '../types/application'
import type { SkillCategoryOrder } from '../types/industryPack'
import type {
  Cert,
  Contact,
  Education,
  Job,
  ResumeProfile,
  Skills,
} from '../types/profile'
import { getPack, resolvePackId } from '../data/packs'
import { filterJobsByFeatured } from './featuredJobs'
import { filterSkillsByFeatured } from './featuredSkills'
import { orderJobsForInternal } from './internalPromo'
import { sortJobsReverseChrono } from './jobOrder'
import { bulletKey } from './jdKeywords'
import { resolvePrintPrefs } from './printPrefs'
import { categoryOrderForPack, orderSkillsForPack } from './skillOrder'

export type SectionId =
  | 'summary'
  | 'skills'
  | 'experience'
  | 'certs'
  | 'education'

/** Fully resolved resume ready for preview / PDF / plain text. */
export type ResolvedResume = {
  contact: Contact
  summary: string
  jobs: Job[]
  skills: Skills
  /** Pack-driven category print order */
  skillCategoryOrder: SkillCategoryOrder
  education: Education[]
  certs: Cert[]
  templateId: TemplateId
  mode: ResumeApplication['mode']
  targetTitle: string
  targetCompany: string
  currentTitle: string
  label: string
  industryPackId: string
  /** Shown on internal-promotion template */
  showInternalBanner: boolean
  /** Per-version: print professional / personal email */
  includeProfessionalEmail: boolean
  /** Per-version: print work / internal email */
  includeInternalEmail: boolean
  /** Section render order (varies by template) */
  sectionOrder: SectionId[]
  /** Locked font / density dials — CSS + PDF share these */
  printPrefs: PrintPrefs
}

function sectionOrderFor(templateId: TemplateId): SectionId[] {
  switch (templateId) {
    case 'skills-first':
      return ['skills', 'summary', 'experience', 'certs', 'education']
    case 'ops-leader':
    case 'executive-brief':
    case 'production-lead':
    case 'floor-worker':
      return ['summary', 'experience', 'skills', 'certs', 'education']
    case 'tech-ops':
      return ['skills', 'experience', 'summary', 'certs', 'education']
    case 'quality-focus':
      return ['summary', 'certs', 'experience', 'skills', 'education']
    case 'early-career':
    case 'classic-green':
      return ['summary', 'education', 'skills', 'experience', 'certs']
    case 'engineer-entry':
    case 'timeline':
      return ['summary', 'experience', 'education', 'skills', 'certs']
    case 'mfg-associate':
      return ['summary', 'skills', 'experience', 'education', 'certs']
    default:
      return ['summary', 'skills', 'experience', 'certs', 'education']
  }
}

export function resolveResume(
  profile: ResumeProfile,
  application: ResumeApplication | null,
): ResolvedResume {
  const templateId = application?.templateId ?? 'ats-classic'
  const mode = application?.mode ?? 'external'
  const targetTitle = application?.targetTitle?.trim() ?? ''
  const targetCompany = application?.targetCompany?.trim() ?? ''
  const currentTitle = application?.currentTitle?.trim() ?? ''
  const label = application?.label?.trim() || 'Master profile'
  const packId = resolvePackId(
    application?.industryPackId,
    profile.defaultIndustryPackId,
  )
  const pack = getPack(packId)
  const summary =
    (application?.summaryOverride?.trim()
      ? application.summaryOverride
      : profile.baseSummary) || ''

  // Master bank order: reverse-chronological by dates (not input order)
  let jobs = sortJobsReverseChrono([...profile.jobs])

  // Per-version job bank pick (empty featured = all master jobs)
  const featured = application?.featuredJobIds?.filter(Boolean) ?? []
  if (featured.length > 0) {
    // Keep reverse-chrono among the checked subset (ignore checkbox order)
    jobs = filterJobsByFeatured(jobs, featured)
  } else if (mode === 'internal' || templateId === 'internal-promotion') {
    // Company prefer/filter; each group already reverse-chrono by date
    const filterMode =
      application?.internalCompanyFilter && targetCompany
        ? 'filter'
        : 'prefer'
    jobs = orderJobsForInternal(jobs, targetCompany, filterMode)
  }

  // Phase 4: pin matched bullets to the top of each job
  const pinnedKeys = new Set(
    application?.pinnedBulletKeys?.filter(Boolean) ?? [],
  )
  if (pinnedKeys.size > 0) {
    jobs = jobs.map((job) => {
      const pinned: string[] = []
      const rest: string[] = []
      for (const b of job.bullets) {
        if (!b.trim()) continue
        if (pinnedKeys.has(bulletKey(job.id, b))) pinned.push(b)
        else rest.push(b)
      }
      if (pinned.length === 0) return job
      return { ...job, bullets: [...pinned, ...rest] }
    })
  }

  // Per-build skill pick, then pack-driven order within categories
  const skillsPicked = application
    ? filterSkillsByFeatured(profile.skills, application.featuredSkillKeys)
    : profile.skills
  const skills = orderSkillsForPack(skillsPicked, pack)

  return {
    contact: profile.contact,
    summary,
    jobs,
    skills,
    skillCategoryOrder: categoryOrderForPack(pack),
    education: profile.education,
    certs: profile.certs,
    templateId,
    mode,
    targetTitle,
    targetCompany,
    currentTitle,
    label,
    industryPackId: packId,
    showInternalBanner:
      mode === 'internal' || templateId === 'internal-promotion',
    // Master-only preview: show both filled emails. Version: use flags (defaults by mode).
    includeProfessionalEmail: application
      ? application.includeProfessionalEmail !== false
      : true,
    includeInternalEmail: application
      ? Boolean(application.includeInternalEmail)
      : true,
    sectionOrder: sectionOrderFor(templateId),
    printPrefs: resolvePrintPrefs(application?.printPrefs, templateId),
  }
}

/** Master-only resolve (no application). */
export function resolveFromProfile(profile: ResumeProfile): ResolvedResume {
  return resolveResume(profile, null)
}
