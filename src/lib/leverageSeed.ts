/**
 * Offline leverage seeding — places operator words into profile + application shape.
 * Does not invent metrics, years, or titles beyond what the operator typed.
 */

import type { ResumeApplication } from '../types/application'
import type { ResumeProfile } from '../types/profile'
import { emptyApplication, defaultLabel } from './applicationFactory'
import { sortJobsReverseChrono } from './jobOrder'
import { emptyJob, touch } from './profileFactory'
import { parseTagInput } from './stringList'

export type LeverageStory = {
  mode: 'external' | 'internal'
  targetTitle: string
  targetCompany: string
  currentTitle: string
  currentCompany: string
  /** Comma / line separated skills & tools */
  skillsText: string
  /** Plain language daily work */
  dailyWork: string
  /** What they have helped with (outcomes in their words) */
  helpedWith: string
  /** Optional name for contact if empty */
  name: string
}

export type LeverageSeedResult = {
  profile: ResumeProfile
  application: ResumeApplication
}

function splitHelped(text: string): string[] {
  const t = text.trim()
  if (!t) return []
  // Split on " and " / ";" / newlines — keep operator language
  return t
    .split(/\n+|;\s*|\s+and\s+/i)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4)
}

function toBullet(raw: string): string {
  const s = raw.trim()
  if (!s) return ''
  // Capitalize first letter only — do not rephrase content
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/**
 * Merge leverage story into profile (non-destructive where possible) + new application.
 */
export function seedFromLeverage(
  profile: ResumeProfile,
  story: LeverageStory,
): LeverageSeedResult {
  const targetTitle = story.targetTitle.trim()
  const targetCompany = story.targetCompany.trim()
  const currentTitle = story.currentTitle.trim()
  const currentCompany = story.currentCompany.trim()

  // Skills: all as hard for now; operator can re-bucket on Skills panel
  const skillTags = parseTagInput(story.skillsText)
  const skills = {
    hard: [
      ...new Set([
        ...profile.skills.hard,
        ...skillTags.filter((s) => s.length > 0),
      ]),
    ],
    tools: [...profile.skills.tools],
    soft: [...profile.skills.soft],
  }

  // Job: seed current role from story if we have title or company
  let jobs = [...profile.jobs]
  if (currentTitle || currentCompany) {
    const job = emptyJob()
    job.title = currentTitle || 'Current role'
    job.company = currentCompany || targetCompany || ''
    job.isCurrentEmployer = true
    job.end = null

    const bullets: string[] = []
    if (story.dailyWork.trim()) {
      bullets.push(toBullet(story.dailyWork.trim()))
    }
    for (const h of splitHelped(story.helpedWith)) {
      bullets.push(toBullet(h))
    }
    job.bullets = bullets.length > 0 ? bullets : ['']

    jobs = sortJobsReverseChrono([job, ...jobs.filter((j) => j.id !== job.id)])
  } else {
    jobs = sortJobsReverseChrono(jobs)
  }

  // Summary: leave blank so operator writes with Structure guide —
  // only seed a one-line intent note if completely empty (as bracket scaffold)
  let baseSummary = profile.baseSummary
  if (!baseSummary.trim() && (targetTitle || currentTitle)) {
    // Scaffold with brackets for missing pieces — operator replaces
    const who = currentTitle || '[Current title]'
    const where = currentCompany || '[Company / plant]'
    const seek = targetTitle || '[Target title]'
    const skillsHint =
      skillTags.length > 0
        ? skillTags.slice(0, 3).join(', ')
        : '[skill 1], [skill 2]'
    baseSummary =
      story.mode === 'internal'
        ? `Internal candidate for ${seek} as current ${who} at ${where}. Strong in ${skillsHint}. [Add one real result only if true].`
        : `${seek} candidate with hands-on experience as ${who}${where ? ` at ${where}` : ''}. Strong in ${skillsHint}. [Add one real result only if true].`
  }

  const contact = { ...profile.contact }
  if (!contact.name.trim() && story.name.trim()) {
    contact.name = story.name.trim()
  }

  const nextProfile = touch({
    ...profile,
    contact,
    baseSummary,
    jobs,
    skills,
  })

  const application = emptyApplication(nextProfile, {
    mode: story.mode,
    targetTitle,
    targetCompany:
      targetCompany ||
      (story.mode === 'internal' ? currentCompany : ''),
    currentTitle,
    label: defaultLabel(
      targetTitle,
      targetCompany || currentCompany,
      story.mode,
    ),
    tone: story.mode === 'internal' ? 'internal-promo' : 'ats-external',
    templateId:
      story.mode === 'internal' ? 'internal-promotion' : 'ats-classic',
    internalCompanyFilter: story.mode === 'internal' && Boolean(currentCompany),
  })

  return { profile: nextProfile, application }
}
