/**
 * Style / tone for the application you’re building toward.
 * Picks layout + writing guidance — never invents your metrics.
 * 3-C SSOT: Clarity · Conciseness · Consistency
 */

import type { TemplateId } from '../types/application'

export type ResumeToneId =
  | 'ats-external'
  | 'internal-promo'
  | 'ops-impact'
  | 'skills-forward'
  | 'compact-pro'

export type ResumeTone = {
  id: ResumeToneId
  label: string
  short: string
  description: string
  /** Maps to layout template */
  templateId: TemplateId
  /** Voice guidance for summaries/bullets */
  voice: string
  threeCFocus: string
  bestFor: string
}

export const RESUME_TONES: ResumeTone[] = [
  {
    id: 'ats-external',
    label: 'External · ATS Classic',
    short: 'ATS',
    description:
      'Clear single-column default for online applications. Standard headers, generous skim room.',
    templateId: 'ats-classic',
    voice: 'Plain, professional, keyword-honest. Lead with title fit, then proof.',
    threeCFocus: 'Clarity of structure; Consistency of headers and dates.',
    bestFor: 'External job boards, recruiter ATS, cold applications',
  },
  {
    id: 'internal-promo',
    label: 'Internal · Leadership',
    short: 'Internal',
    description:
      'In-company promotion case. Current employer first, readiness language, known tools.',
    templateId: 'internal-promotion',
    voice: 'Ready-now, company-specific wins. Bridge current title → target.',
    threeCFocus: 'Clarity of From→Target; Consistency with company naming.',
    bestFor: 'Internal postings, promotion packets, skip-level asks',
  },
  {
    id: 'ops-impact',
    label: 'Ops · Impact forward',
    short: 'Ops',
    description:
      'Experience-first layout for floor leads and supervisors. Throughput, safety, crew scope.',
    templateId: 'ops-leader',
    voice: 'Numbers and ownership. Safety / quality / rate language when true.',
    threeCFocus: 'Conciseness of impact bullets; Consistency of metrics style.',
    bestFor: 'Supervisor, team lead, production, quality lead roles',
  },
  {
    id: 'skills-forward',
    label: 'Skills · Screening first',
    short: 'Skills',
    description:
      'Skills block near top for keyword / skills-based screening.',
    templateId: 'skills-first',
    voice: 'Named methods and tools first; bullets prove them.',
    threeCFocus: 'Clarity of skill clusters; Consistency of skill naming.',
    bestFor: 'Roles that list many hard skills / tools in the JD',
  },
  {
    id: 'compact-pro',
    label: 'Compact · Dense pro',
    short: 'Compact',
    description:
      'Tighter spacing for more history on 1–2 pages without multi-column risk.',
    templateId: 'professional-compact',
    voice: 'Concise. Cut filler; keep only high-signal bullets.',
    threeCFocus: 'Conciseness first — every line earns its place.',
    bestFor: 'Mid-career histories that still need one-page skim',
  },
]

export function getTone(id: string | null | undefined): ResumeTone {
  return RESUME_TONES.find((t) => t.id === id) ?? RESUME_TONES[0]
}

export function isToneId(v: string): v is ResumeToneId {
  return RESUME_TONES.some((t) => t.id === v)
}

/** Infer tone from existing template when migrating old apps. */
export function toneFromTemplate(templateId: TemplateId): ResumeToneId {
  const hit = RESUME_TONES.find((t) => t.templateId === templateId)
  return hit?.id ?? 'ats-external'
}
