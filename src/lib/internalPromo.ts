/**
 * Phase 6 — internal promotion helpers (readiness, company filter, summaries).
 * No invented metrics — checklist only verifies structure & honesty prompts.
 */

import type { ResumeApplication } from '../types/application'
import type { Job, ResumeProfile } from '../types/profile'
import { sortJobsReverseChrono } from './jobOrder'

export type ReadinessItem = {
  id: string
  label: string
  ok: boolean
  hint: string
}

export type ReadinessReport = {
  items: ReadinessItem[]
  readyCount: number
  total: number
  /** Fraction complete — not an “ATS score”. */
  progress: number
}

function normCompany(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Loose company name match for filtering history. */
export function companyMatches(jobCompany: string, targetCompany: string): boolean {
  const a = normCompany(jobCompany)
  const b = normCompany(targetCompany)
  if (!a || !b) return false
  if (a === b) return true
  if (a.includes(b) || b.includes(a)) return true
  // Token overlap (e.g. "Acme Industrial" vs "Acme")
  const ta = new Set(a.split(' ').filter((t) => t.length > 2))
  const tb = b.split(' ').filter((t) => t.length > 2)
  if (tb.length === 0) return false
  const hits = tb.filter((t) => ta.has(t)).length
  return hits >= Math.min(2, tb.length) || (tb.length === 1 && hits === 1)
}

export function jobsAtCompany(jobs: Job[], company: string): Job[] {
  if (!company.trim()) return []
  return jobs.filter((j) => companyMatches(j.company, company))
}

export function evaluateInternalReadiness(
  profile: ResumeProfile,
  opts: {
    company: string
    currentTitle: string
    targetTitle: string
    summaryOverride: string
    application?: ResumeApplication | null
  },
): ReadinessReport {
  const company = opts.company.trim()
  const companyJobs = jobsAtCompany(profile.jobs, company)
  const currentMarked = companyJobs.some((j) => j.isCurrentEmployer)
  const hasBullets = companyJobs.some((j) =>
    j.bullets.some((b) => b.trim().length > 20),
  )
  const hasMetrics = companyJobs.some(
    (j) =>
      j.metrics.some((m) => m.label.trim() || m.value.trim()) ||
      j.bullets.some((b) => /\d/.test(b)),
  )
  const bridge =
    opts.summaryOverride.trim() ||
    (opts.application?.summaryOverride?.trim() ?? '') ||
    ''
  const hasBridge = bridge.length >= 40
  const hasTarget = opts.targetTitle.trim().length >= 2
  const hasCurrent = opts.currentTitle.trim().length >= 2
  const hasWorkEmail = Boolean(profile.contact.emailInternal?.trim())
  const hasTools = companyJobs.some((j) => j.tools.length > 0)

  const items: ReadinessItem[] = [
    {
      id: 'company',
      label: 'Target company named',
      ok: company.length >= 2,
      hint: 'Use the exact employer name as on internal postings.',
    },
    {
      id: 'current-title',
      label: 'Current title set',
      ok: hasCurrent,
      hint: 'What you hold today — the bridge starts here.',
    },
    {
      id: 'target-title',
      label: 'Target title set',
      ok: hasTarget,
      hint: 'Role you are promoting into.',
    },
    {
      id: 'company-history',
      label: 'At least one role at this company',
      ok: companyJobs.length > 0,
      hint: 'Mark jobs with matching company name on the Jobs tab.',
    },
    {
      id: 'current-employer',
      label: 'Current employer flagged on a company job',
      ok: currentMarked,
      hint: 'Check “Current employer” on your present role.',
    },
    {
      id: 'bullets',
      label: 'Company jobs have solid bullets',
      ok: hasBullets,
      hint: 'Impact bullets with real scope — not job-description copy.',
    },
    {
      id: 'metrics',
      label: 'At least one real number in company history',
      ok: hasMetrics,
      hint: 'Only real metrics — never invent.',
    },
    {
      id: 'tools',
      label: 'Internal tools named on a company job',
      ok: hasTools,
      hint: 'ERP, MES, plant systems, SOPs — names managers recognize.',
    },
    {
      id: 'bridge',
      label: 'Bridge summary written for this promo',
      ok: hasBridge,
      hint: 'Connect current title → target title with company-specific wins.',
    },
    {
      id: 'work-email',
      label: 'Work / internal email on contact',
      ok: hasWorkEmail,
      hint: 'Optional but useful for internal letterhead-style contact.',
    },
  ]

  const readyCount = items.filter((i) => i.ok).length
  const total = items.length
  return {
    items,
    readyCount,
    total,
    progress: total === 0 ? 0 : readyCount / total,
  }
}

export const INTERNAL_SUMMARY_TEMPLATES: {
  id: string
  title: string
  text: string
}[] = [
  {
    id: 'floor-to-lead',
    title: 'Floor → Team lead / supervisor',
    text: 'Internal candidate for [Target title] with [N] years at [Company]. Currently [Current title] on [area/line]. Proven ownership of [safety / quality / throughput], crew coordination, and standard work. Ready to expand scope from [current scope] to [target scope] with the same numbers and tools leadership already knows.',
  },
  {
    id: 'lead-to-supervisor',
    title: 'Lead → Shift / production supervisor',
    text: 'Applying internally for [Target title] after [N] years as [Current title] at [Company]. Track record on [shift/area]: [one real safety or quality result], [one throughput or training result]. Prepared to own full [shift/department] accountability, cross-shift handoffs, and escalations without relearning the plant.',
  },
  {
    id: 'cross-dept',
    title: 'Same company, new department',
    text: 'Internal move candidate for [Target title] in [dept]. Background as [Current title] at [Company] with transferable strengths in [2 domains managers care about]. Known for [specific company win with real metric]. Seeking to apply plant knowledge and relationships to [target area] without a cold-start learning curve.',
  },
  {
    id: 'ops-coord',
    title: 'Ops / quality / support path',
    text: 'Internal candidate for [Target title] at [Company]. As [Current title], partnered with [teams] on [process/outcome] using [tools]. Bring first-hand floor context plus [documentation / training / audit] ownership. Case for promotion: [one readiness proof with real number], not a generic external resume.',
  },
]

/** Fill template placeholders from wizard fields (leaves unknown tokens). */
export function fillInternalSummaryTemplate(
  template: string,
  fields: {
    company: string
    currentTitle: string
    targetTitle: string
  },
): string {
  return template
    .replace(/\[Target title\]/gi, fields.targetTitle.trim() || '[Target title]')
    .replace(/\[Current title\]/gi, fields.currentTitle.trim() || '[Current title]')
    .replace(/\[Company\]/gi, fields.company.trim() || '[Company]')
}

/**
 * Prefer company jobs first; optional hard filter to company-only.
 * Within each group, order is reverse-chronological by dates.
 */
export function orderJobsForInternal(
  jobs: Job[],
  company: string,
  mode: 'prefer' | 'filter',
): Job[] {
  if (!company.trim()) {
    return sortJobsReverseChrono(jobs)
  }
  const at = sortJobsReverseChrono(
    jobs.filter((j) => companyMatches(j.company, company)),
  )
  const rest = sortJobsReverseChrono(
    jobs.filter((j) => !companyMatches(j.company, company)),
  )
  if (mode === 'filter') {
    return at.length > 0 ? at : sortJobsReverseChrono(jobs)
  }
  // prefer: target-company history first (newest first), then other employers
  return [...at, ...rest]
}
