/**
 * ResumeForge 3-C craft framework (operator SSOT):
 *
 * Clarity      — skimmable structure a stranger can parse in seconds
 * Conciseness  — tight length; no filler; 2–4 strong bullets beat 8 weak ones
 * Consistency  — parallel structure, date formats, voice, and naming across the page
 *
 * Structural craft meters only — not a vendor ATS score. Never invent metrics.
 *
 * Honesty rule: Consistency rewards *demonstrated* parallel structure.
 * Sparse drafts cannot score ~100% by mere absence of conflicts.
 */

import type { ResumeProfile } from '../types/profile'
import type { ResolvedResume } from '../lib/resolveResume'
import { getPageGuidance } from '../lib/pageGuidance'

export type ThreeCId = 'clarity' | 'conciseness' | 'consistency'

export type ThreeCItem = {
  id: ThreeCId
  label: string
  short: string
  /** 0–1 structural completeness for UI meter only — not an ATS score */
  score: number
  tips: string[]
  ok: boolean
}

export type ThreeCReport = {
  items: ThreeCItem[]
  overall: number
}

export const THREE_C_LABEL = 'Clarity · Conciseness · Consistency'

/** Quiet craft status — not a percentage grade. */
export type CraftStatus = 'Need more' | 'Need work' | 'OK' | 'Solid'

export function craftStatusLabel(item: ThreeCItem): CraftStatus {
  if (item.short === 'Need more content') return 'Need more'
  if (item.ok) return 'Solid'
  if (item.score >= 0.45) return 'OK'
  return 'Need work'
}

/** Overall line for 3-C header (no “% ready”). */
export function craftOverallLabel(report: ThreeCReport): string {
  const solid = report.items.filter((i) => i.ok).length
  const needMore = report.items.some((i) => i.short === 'Need more content')
  if (solid === 3) return 'Looking solid'
  if (needMore && solid === 0) return 'Add content'
  if (solid === 0) return 'Needs work'
  return `${solid} of 3 solid`
}

export const THREE_C_COPY: Record<
  ThreeCId,
  { title: string; principle: string; doList: string[] }
> = {
  clarity: {
    title: 'Clarity',
    principle:
      'A hiring manager (or ATS) should grasp your fit in seconds — standard headers, single column, plain language, complete contact.',
    doList: [
      'Name + way to reach you',
      'Standard section headers (Summary, Skills, Experience…)',
      'Reverse-chronological jobs with clear titles',
      'No multi-column / graphic layouts as default',
    ],
  },
  conciseness: {
    title: 'Conciseness',
    principle:
      'Every line earns its place. Early career often fits 1 page; mid-level / manager depth can use 2 pages when content is real — not filler.',
    doList: [
      'Summary ≤ ~4 sentences',
      '2–4 impact bullets per role (not a duty dump)',
      'Skip “responsible for / duties included”',
      'Trim oldest or irrelevant roles for the target; 2 pages OK when earned',
    ],
  },
  consistency: {
    title: 'Consistency',
    principle:
      'Same date style, parallel bullet grammar, stable company/title naming, and one professional voice end-to-end.',
    doList: [
      'Dates in the same format (prefer YYYY-MM)',
      'Bullets start with action verbs in the same tense family',
      'Same company spelling across roles',
      'Skills written in a similar style (not mixed Title Case / ALL CAPS chaos)',
    ],
  },
}

function dateStyle(s: string): 'ym' | 'y' | 'other' | 'empty' {
  const t = s.trim()
  if (!t) return 'empty'
  if (/^\d{4}-\d{2}$/.test(t)) return 'ym'
  if (/^\d{4}$/.test(t)) return 'y'
  return 'other'
}

/** Enough content to fairly score Consistency (not just “no conflicts”). */
function consistencySampleReady(
  datedJobs: number,
  bulletCount: number,
  skillCount: number,
): boolean {
  return datedJobs >= 2 || bulletCount >= 3 || skillCount >= 4
}

/** Structural 3-C check — honest craft meter, not a magic ATS score. */
export function evaluateThreeCs(
  profile: ResumeProfile,
  resolved: ResolvedResume,
): ThreeCReport {
  const c = profile.contact
  const contactOk =
    Boolean(c.name.trim()) &&
    Boolean(c.phone.trim() || c.email.trim() || c.emailInternal?.trim())

  const hasJobs = resolved.jobs.length > 0
  const skillCount =
    resolved.skills.hard.length +
    resolved.skills.tools.length +
    resolved.skills.soft.length
  const hasSkills = skillCount > 0
  const hasSummary = Boolean(resolved.summary.trim())
  const hasEduOrCert =
    resolved.education.length > 0 || resolved.certs.length > 0

  // ——— Clarity ———
  // Structure completeness — can be high with few complete fields (OK).
  let clarityScore = 0
  if (contactOk) clarityScore += 0.35
  if (hasJobs) clarityScore += 0.3
  if (hasSkills) clarityScore += 0.2
  if (hasEduOrCert || hasSummary) clarityScore += 0.15
  const clarityTips: string[] = []
  if (!c.name.trim()) clarityTips.push('Add your name in Contact')
  if (!c.email.trim() && !c.emailInternal?.trim())
    clarityTips.push('Add an email so they can reach you')
  if (!hasJobs) clarityTips.push('Add at least one job with title + company')
  if (!hasSkills) clarityTips.push('Add skills (hard / tools / soft)')
  const jobsMissingTitle = resolved.jobs.filter(
    (j) => !j.title.trim() || !j.company.trim(),
  )
  if (jobsMissingTitle.length)
    clarityTips.push(
      `${jobsMissingTitle.length} job(s) missing title or company`,
    )
  // Soft signal only — does not change score. Research: complete LinkedIn helps callbacks.
  if (
    contactOk &&
    !(c.linkedin ?? '').trim() &&
    clarityTips.length < 3
  ) {
    clarityTips.push(
      'Optional: add LinkedIn if you keep it current (complete profiles get more callbacks)',
    )
  }

  // ——— Conciseness ———
  // Sparse drafts are not "concise by default" — free base reduced; empty gets low.
  const guidance = getPageGuidance(resolved)
  const allBullets = resolved.jobs.flatMap((j) =>
    j.bullets.map((b) => b.trim()).filter(Boolean),
  )
  const longBullets = allBullets.filter((b) => b.length > 180)
  const weakOpeners = allBullets.filter((b) =>
    /^(responsible for|duties included|helped with|worked on)\b/i.test(b),
  )
  const summaryLong =
    resolved.summary.trim().split(/\s+/).filter(Boolean).length > 90

  const hasBody =
    allBullets.length > 0 || hasSummary || skillCount > 0 || hasJobs

  let conciseScore = 0
  if (!hasBody) {
    // Nothing to measure yet
    conciseScore = 0.1
  } else {
    // Modest floor once there is content (was 0.25 free — inflated empty drafts)
    conciseScore = 0.1
    if (guidance.level !== 'long') conciseScore += 0.35
    if (longBullets.length === 0) conciseScore += 0.2
    if (weakOpeners.length === 0) conciseScore += 0.2
    if (!summaryLong) conciseScore += 0.1
    // Small bonus when there is enough substance to judge "tight"
    if (allBullets.length >= 2 || (hasSummary && skillCount >= 2)) {
      conciseScore += 0.05
    }
  }

  const conciseTips: string[] = []
  if (!hasBody)
    conciseTips.push('Add summary, skills, or job bullets to measure Conciseness')
  if (guidance.level === 'long')
    conciseTips.push(
      'Past ~2 pages — trim older roles or tighten bullets (2 pages is fine when earned)',
    )
  if (longBullets.length)
    conciseTips.push(`${longBullets.length} bullet(s) run long (>180 chars)`)
  if (weakOpeners.length)
    conciseTips.push(
      'Replace weak openers (responsible for…) with action verbs',
    )
  if (summaryLong) conciseTips.push('Shorten summary to ~2–4 sentences')

  // ——— Consistency ———
  const dateStyles = new Set<string>()
  let datedJobs = 0
  for (const j of resolved.jobs) {
    const a = dateStyle(j.start)
    const endStyle = j.end ? dateStyle(j.end) : 'empty'
    if (a !== 'empty' || endStyle !== 'empty') datedJobs += 1
    if (a !== 'empty') dateStyles.add(a)
    if (endStyle !== 'empty') dateStyles.add(endStyle)
  }
  const mixedDates = dateStyles.size > 1

  const verbStarts = allBullets.map((b) => {
    const w = b.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, '') ?? ''
    return w
  })
  const pastish = verbStarts.filter((v) =>
    /ed$|led|built|drove|cut|won|ran|met/.test(v),
  ).length
  const presentish = verbStarts.filter((v) =>
    /^(lead|manage|own|train|support|drive|build|run|coordinate)$/.test(v),
  ).length
  const mixedTense =
    pastish > 0 && presentish > 0 && Math.min(pastish, presentish) >= 2

  const withPeriod = allBullets.filter((b) => /\.$/.test(b)).length
  const withoutPeriod = allBullets.length - withPeriod
  const mixedPeriods =
    allBullets.length >= 3 && withPeriod > 0 && withoutPeriod > 0

  // Company name case/spelling rough: same norm key with different display
  const companyMap = new Map<string, Set<string>>()
  for (const j of resolved.jobs) {
    const raw = j.company.trim()
    if (!raw) continue
    const key = raw.toLowerCase().replace(/[^a-z0-9]+/g, '')
    if (!companyMap.has(key)) companyMap.set(key, new Set())
    companyMap.get(key)!.add(raw)
  }
  const companyVariants = [...companyMap.values()].filter((s) => s.size > 1)

  const skillStrings = [
    ...resolved.skills.hard,
    ...resolved.skills.tools,
    ...resolved.skills.soft,
  ]
  const allCapsSkills = skillStrings.filter(
    (s) => s.length > 3 && s === s.toUpperCase() && /[A-Z]/.test(s),
  )
  const mixedSkillCase =
    skillStrings.length >= 4 &&
    allCapsSkills.length > 0 &&
    allCapsSkills.length < skillStrings.length * 0.8

  const jobsCompleteMeta = resolved.jobs.filter(
    (j) => j.title.trim() && j.company.trim() && j.start.trim(),
  ).length
  const metaConsistent =
    !hasJobs || jobsCompleteMeta === resolved.jobs.length

  const sampleReady = consistencySampleReady(
    datedJobs,
    allBullets.length,
    skillCount,
  )

  // Positive signals (need enough content to demonstrate, not just absence)
  const sharedDateFormat =
    datedJobs >= 2 && dateStyles.size === 1 && !mixedDates
  const parallelOpeners =
    allBullets.length >= 3 &&
    !mixedTense &&
    verbStarts.filter(Boolean).length >= 3
  const skillsUniform =
    skillCount >= 4 && !mixedSkillCase

  const consistencyTips: string[] = []
  let consistencyScore: number

  if (!sampleReady) {
    // Cap sparse drafts — never look "done" at ~100% with ~5 fields
    consistencyScore = 0.15
    if (hasJobs && metaConsistent) consistencyScore += 0.1
    if (allBullets.length > 0 && !mixedTense) consistencyScore += 0.05
    if (dateStyles.size <= 1) consistencyScore += 0.05
    // Hard cap while under sample gate (~35–45%)
    consistencyScore = Math.min(0.45, consistencyScore)
    consistencyTips.push(
      'Add more jobs, bullets, or skills to measure Consistency (need ≥2 dated jobs, ≥3 bullets, or ≥4 skills)',
    )
    if (!hasJobs)
      consistencyTips.push('Add jobs so consistency checks can run')
  } else {
    // Start low; award demonstrated consistency + lack of conflicts
    consistencyScore = 0.1
    if (!mixedDates) consistencyScore += 0.12
    if (sharedDateFormat) consistencyScore += 0.1 // positive: 2+ jobs, one format
    if (!mixedTense) consistencyScore += 0.1
    if (parallelOpeners) consistencyScore += 0.1 // positive: enough bullets, aligned tense
    if (!mixedPeriods) consistencyScore += 0.08
    if (companyVariants.length === 0) consistencyScore += 0.1
    if (!mixedSkillCase) consistencyScore += 0.08
    if (skillsUniform) consistencyScore += 0.05
    if (metaConsistent) consistencyScore += 0.1
    if (hasJobs && allBullets.length > 0) consistencyScore += 0.05

    if (mixedDates)
      consistencyTips.push(
        'Use one date format across jobs (prefer YYYY-MM)',
      )
    if (mixedTense)
      consistencyTips.push(
        'Align bullet tense (past roles → past tense; current → present or past consistently)',
      )
    if (mixedPeriods)
      consistencyTips.push(
        'Pick one style: end all bullets with a period, or none',
      )
    if (companyVariants.length)
      consistencyTips.push(
        'Spell company names the same way every time',
      )
    if (mixedSkillCase)
      consistencyTips.push(
        'Write skills in a consistent style (avoid random ALL CAPS)',
      )
    if (!metaConsistent)
      consistencyTips.push(
        'Give every job a title, company, and start date',
      )
    if (
      !sharedDateFormat &&
      datedJobs < 2 &&
      allBullets.length >= 3
    ) {
      consistencyTips.push(
        'Date 2+ jobs the same way to lock date Consistency',
      )
    }
  }

  const items: ThreeCItem[] = [
    {
      id: 'clarity',
      label: 'Clarity',
      short: 'Skimmable structure',
      score: Math.min(1, clarityScore),
      tips: clarityTips,
      ok: clarityScore >= 0.7,
    },
    {
      id: 'conciseness',
      label: 'Conciseness',
      short: 'Tight, scannable',
      score: Math.min(1, conciseScore),
      tips: conciseTips,
      ok: hasBody && conciseScore >= 0.7,
    },
    {
      id: 'consistency',
      label: 'Consistency',
      short: sampleReady ? 'Parallel & uniform' : 'Need more content',
      score: Math.min(1, consistencyScore),
      tips: consistencyTips,
      // Under sample gate: never "ok" even if local checks pass
      ok: sampleReady && consistencyScore >= 0.65,
    },
  ]

  const overall =
    items.reduce((s, i) => s + i.score, 0) / Math.max(1, items.length)

  return { items, overall }
}
