/**
 * Slice 3 — tone auto-suggest from mode, target title, JD text/keywords, history size.
 * Never overwrites without user accept. Never invents content.
 */

import type {
  ApplicationMode,
  ResumeToneId,
} from '../types/application'
import { getTone } from '../data/tones'

export type ToneConfidence = 'high' | 'medium' | 'low'

export type ToneSuggestion = {
  toneId: ResumeToneId
  confidence: ToneConfidence
  reasons: string[]
  /** Relative scores for debugging / secondary hints */
  scores: Record<ResumeToneId, number>
  /** True when suggested tone differs from current */
  differsFromCurrent: boolean
}

const OPS_TERMS = [
  'supervisor',
  'team lead',
  'team leader',
  'production',
  'manufacturing',
  'assembly',
  'throughput',
  'oee',
  'scrap',
  'uptime',
  'changeover',
  'smed',
  'line lead',
  'shift lead',
  'floor',
  'plant',
  'quality lead',
  'crew',
  'loto',
  'lockout',
  '5s',
  'kaizen',
  'standard work',
  'forklift',
  'machin',
  'maintenance',
  'tpm',
]

const SKILLS_TERMS = [
  'required skills',
  'qualifications',
  'proficiency',
  'proficient',
  'must have',
  'competenc',
  'certification',
  'software',
  'systems',
  'tools',
  'erp',
  'mes',
  'crm',
  'excel',
  'sap',
  'skill set',
  'skillset',
  'technical skills',
  'hard skills',
]

const INTERNAL_TERMS = [
  'internal applicant',
  'internal candidate',
  'internal only',
  'internal posting',
  'current employee',
  'promotion',
  'promotional',
  'in-house',
  'from within',
]

const COMPACT_TERMS = [
  '10+ years',
  '15+ years',
  'senior',
  'extensive experience',
  'multiple roles',
  'progressive',
]

function countHits(haystack: string, terms: string[]): { n: number; hits: string[] } {
  const hits: string[] = []
  for (const t of terms) {
    if (haystack.includes(t)) hits.push(t)
  }
  return { n: hits.length, hits: hits.slice(0, 6) }
}

export type SuggestToneInput = {
  mode?: ApplicationMode | null
  targetTitle?: string
  targetCompany?: string
  jobDescription?: string
  jdKeywords?: string[]
  /** Master profile job count — denser history → compact bias */
  jobCount?: number
  currentTone?: ResumeToneId | null
}

/**
 * Score tones and pick the best match for this application context.
 */
export function suggestTone(input: SuggestToneInput): ToneSuggestion {
  const mode = input.mode === 'internal' ? 'internal' : 'external'
  const title = (input.targetTitle ?? '').toLowerCase()
  const company = (input.targetCompany ?? '').toLowerCase()
  const jd = (input.jobDescription ?? '').toLowerCase()
  const keywords = (input.jdKeywords ?? []).map((k) => k.toLowerCase()).join(' ')
  const corpus = `${title} ${company} ${jd} ${keywords}`
  const jobCount = input.jobCount ?? 0
  const current = input.currentTone ?? 'ats-external'

  const scores: Record<ResumeToneId, number> = {
    'ats-external': 8, // baseline for external
    'internal-promo': 0,
    'ops-impact': 0,
    'skills-forward': 0,
    'compact-pro': 0,
  }
  const reasons: string[] = []

  // Mode wins hard for internal
  if (mode === 'internal') {
    scores['internal-promo'] += 40
    reasons.push('Application mode is internal')
  } else {
    scores['ats-external'] += 4
  }

  const internalHits = countHits(corpus, INTERNAL_TERMS)
  if (internalHits.n > 0) {
    scores['internal-promo'] += 12 + internalHits.n * 3
    reasons.push(`JD/title signals internal path (${internalHits.hits[0]})`)
  }

  const opsHits = countHits(corpus, OPS_TERMS)
  if (opsHits.n > 0) {
    scores['ops-impact'] += 6 + opsHits.n * 4
    reasons.push(
      `Ops / floor language (${opsHits.hits.slice(0, 3).join(', ')})`,
    )
  }
  // Title-only supervisor/lead boost
  if (
    /\b(supervisor|team lead|team leader|shift lead|production lead|foreman)\b/i.test(
      title,
    )
  ) {
    scores['ops-impact'] += 10
    reasons.push('Target title looks like floor / ops leadership')
  }

  const skillHits = countHits(corpus, SKILLS_TERMS)
  if (skillHits.n > 0) {
    scores['skills-forward'] += 5 + skillHits.n * 3
  }
  // Dense keyword lists often mean skills screening
  const kwCount = input.jdKeywords?.length ?? 0
  if (kwCount >= 12) {
    scores['skills-forward'] += 8
    reasons.push(`${kwCount} JD keywords — skills-first screening layout helps`)
  } else if (skillHits.n >= 2) {
    reasons.push('JD emphasizes skills / qualifications lists')
  }

  const compactHits = countHits(corpus, COMPACT_TERMS)
  if (compactHits.n > 0) {
    scores['compact-pro'] += 6 + compactHits.n * 3
  }
  if (jobCount >= 5) {
    scores['compact-pro'] += 10
    reasons.push(`${jobCount} roles on profile — compact layout fits denser history`)
  } else if (jobCount >= 4) {
    scores['compact-pro'] += 5
  }

  // Long JD without strong ops/internal → keep ATS clear
  if (jd.length > 800 && scores['ops-impact'] < 10 && mode === 'external') {
    scores['ats-external'] += 5
    reasons.push('Long external JD — classic ATS clarity default')
  }

  // If nothing special and external, ensure ATS is competitive
  if (mode === 'external' && scores['ops-impact'] < 8 && scores['skills-forward'] < 8) {
    scores['ats-external'] += 6
    if (!reasons.some((r) => r.includes('ATS') || r.includes('external'))) {
      reasons.push('Default external application → ATS classic')
    }
  }

  // Pick winner
  let toneId: ResumeToneId = 'ats-external'
  let best = -1
  for (const [id, s] of Object.entries(scores) as [ResumeToneId, number][]) {
    if (s > best) {
      best = s
      toneId = id
    }
  }

  // Confidence from margin vs runner-up
  const sorted = Object.values(scores).sort((a, b) => b - a)
  const margin = (sorted[0] ?? 0) - (sorted[1] ?? 0)
  let confidence: ToneConfidence = 'low'
  if (margin >= 15 || (mode === 'internal' && toneId === 'internal-promo')) {
    confidence = 'high'
  } else if (margin >= 6) {
    confidence = 'medium'
  }

  // Dedupe / trim reasons; if empty, add label-based
  const uniqueReasons = [...new Set(reasons)].slice(0, 4)
  if (uniqueReasons.length === 0) {
    uniqueReasons.push(`Best fit: ${getTone(toneId).label}`)
  }

  return {
    toneId,
    confidence,
    reasons: uniqueReasons,
    scores,
    differsFromCurrent: toneId !== current,
  }
}

/** Short label for UI chips */
export function confidenceLabel(c: ToneConfidence): string {
  if (c === 'high') return 'Strong match'
  if (c === 'medium') return 'Good match'
  return 'Soft match'
}
