/**
 * Phase 4 — JD keyword extract + profile match (local, no invented ATS scores).
 * Coverage = count of keywords found in profile text, not a vendor “ATS score”.
 */

import { getPack, manufacturingPack } from '../data/packs'
import type { ResumeApplication } from '../types/application'
import type { IndustryPack } from '../types/industryPack'
import type { Job, ResumeProfile, Skills } from '../types/profile'

const STOPWORDS = new Set(
  [
    'a',
    'an',
    'the',
    'and',
    'or',
    'but',
    'if',
    'then',
    'else',
    'when',
    'at',
    'by',
    'for',
    'with',
    'about',
    'against',
    'between',
    'into',
    'through',
    'during',
    'before',
    'after',
    'above',
    'below',
    'to',
    'from',
    'up',
    'down',
    'in',
    'out',
    'on',
    'off',
    'over',
    'under',
    'again',
    'further',
    'once',
    'here',
    'there',
    'all',
    'any',
    'both',
    'each',
    'few',
    'more',
    'most',
    'other',
    'some',
    'such',
    'no',
    'nor',
    'not',
    'only',
    'own',
    'same',
    'so',
    'than',
    'too',
    'very',
    'can',
    'will',
    'just',
    'don',
    'should',
    'now',
    'is',
    'are',
    'was',
    'were',
    'be',
    'been',
    'being',
    'have',
    'has',
    'had',
    'having',
    'do',
    'does',
    'did',
    'doing',
    'would',
    'could',
    'ought',
    'i',
    'you',
    'he',
    'she',
    'it',
    'we',
    'they',
    'me',
    'him',
    'her',
    'us',
    'them',
    'my',
    'your',
    'his',
    'its',
    'our',
    'their',
    'this',
    'that',
    'these',
    'those',
    'what',
    'which',
    'who',
    'whom',
    'how',
    'why',
    'where',
    'as',
    'of',
    'job',
    'jobs',
    'role',
    'roles',
    'position',
    'positions',
    'work',
    'working',
    'team',
    'teams',
    'company',
    'including',
    'include',
    'includes',
    'required',
    'requirements',
    'preferred',
    'preference',
    'ability',
    'able',
    'must',
    'may',
    'using',
    'use',
    'used',
    'ensure',
    'ensuring',
    'provide',
    'providing',
    'support',
    'supporting',
    'related',
    'within',
    'across',
    'also',
    'etc',
    'per',
    'via',
    'etc',
    'year',
    'years',
    'experience',
    'experiences',
    'candidate',
    'candidates',
    'applicant',
    'applicants',
    'responsibilities',
    'responsibility',
    'qualification',
    'qualifications',
    'duties',
    'duty',
    'description',
    'looking',
    'seeking',
    'opportunity',
    'opportunities',
    'please',
    'apply',
    'equal',
    'employer',
    'disability',
    'gender',
    'status',
    'race',
    'color',
    'religion',
    'national',
    'origin',
    'protected',
    'veteran',
    'benefits',
    'salary',
    'compensation',
    'hour',
    'hours',
    'shift',
    'shifts',
    'full',
    'part',
    'time',
    'monday',
    'friday',
    'weekend',
  ].map((w) => w.toLowerCase()),
)

/** Extra multi-word / ATS phrases common in manufacturing JDs */
const EXTRA_PHRASES = [
  'continuous improvement',
  'corrective action',
  'root cause',
  'standard work',
  'lockout tagout',
  'lockout/tagout',
  'first time quality',
  'team lead',
  'team leader',
  'production supervisor',
  'quality control',
  'quality assurance',
  'preventive maintenance',
  'preventative maintenance',
  'cross training',
  'cross-training',
  'lean manufacturing',
  'six sigma',
  'problem solving',
  'process improvement',
  'material handling',
  'inventory control',
  'supply chain',
  'machine shop',
  'assembly line',
  'safety culture',
  'near miss',
  'near-miss',
]

export type KeywordMatch = {
  keyword: string
  matched: boolean
  /** Coarse where found — for UI hints only */
  foundIn: MatchLocation[]
}

export type MatchLocation =
  | 'summary'
  | 'skills'
  | 'jobs'
  | 'tools'
  | 'certs'
  | 'education'
  | 'title'

export type MatchReport = {
  keywords: KeywordMatch[]
  matchedCount: number
  total: number
  /** Honest coverage fraction 0–1 (not an “ATS score”). */
  coverage: number
}

export type BulletHit = {
  jobId: string
  jobLabel: string
  bullet: string
  key: string
  hitCount: number
  hits: string[]
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function normalizeSpace(s: string): string {
  return s.replace(/\s+/g, ' ').trim()
}

/** Content-stable pin key for a bullet under a job. */
export function bulletKey(jobId: string, bullet: string): string {
  const norm = bullet.trim().toLowerCase().replace(/\s+/g, ' ').slice(0, 120)
  return `${jobId}::${norm}`
}

function phraseList(pack?: IndustryPack): string[] {
  const p = pack ?? manufacturingPack
  const bank = [
    ...p.keywordBank,
    ...(p.jdPhrases ?? []),
    ...EXTRA_PHRASES,
  ]
  // Longer phrases first so we prefer multi-word hits
  return [...new Set(bank.map((x) => normalizeSpace(x)).filter(Boolean))].sort(
    (a, b) => b.length - a.length,
  )
}

/**
 * Extract keywords from pasted JD text.
 * Prefers pack phrases + multi-word terms, then solid unigrams. Caps list size.
 */
export function extractKeywordsFromJd(
  jdText: string,
  opts?: {
    max?: number
    extraPhrases?: string[]
    packId?: string
    pack?: IndustryPack
  },
): string[] {
  const max = opts?.max ?? 40
  const pack = opts?.pack ?? getPack(opts?.packId)
  const raw = jdText.replace(/\r\n/g, '\n').trim()
  if (!raw) return []

  const lower = raw.toLowerCase()
  const found: string[] = []
  const seen = new Set<string>()

  const add = (term: string) => {
    const t = normalizeSpace(term)
    if (!t) return
    const key = t.toLowerCase()
    if (seen.has(key)) return
    if (STOPWORDS.has(key)) return
    // Skip pure numbers
    if (/^\d+(\.\d+)?%?$/.test(t)) return
    seen.add(key)
    found.push(t)
  }

  const phrases = [
    ...phraseList(pack),
    ...(opts?.extraPhrases ?? []).map(normalizeSpace),
  ].sort((a, b) => b.length - a.length)

  for (const phrase of phrases) {
    const p = phrase.toLowerCase()
    if (p.length < 2) continue
    if (lower.includes(p)) add(phrase)
  }

  // Acronyms / tools: 2–6 uppercase letters standing alone (OSHA, ERP, OEE, ISO)
  const acronymRe = /\b[A-Z][A-Z0-9]{1,5}\b/g
  let m: RegExpExecArray | null
  while ((m = acronymRe.exec(raw)) !== null) {
    const ac = m[0]
    if (!STOPWORDS.has(ac.toLowerCase())) add(ac)
  }

  // Hyphenated / slash technical tokens
  const techRe = /\b[a-zA-Z][a-zA-Z0-9]*(?:[/-][a-zA-Z0-9]+)+\b/g
  while ((m = techRe.exec(raw)) !== null) {
    add(m[0])
  }

  // Unigram frequency (length >= 4, not stopword)
  const tokens = lower
    .replace(/[^a-z0-9+#./\-\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)

  const freq = new Map<string, number>()
  for (const tok of tokens) {
    if (tok.length < 4) continue
    if (STOPWORDS.has(tok)) continue
    if (/^\d+$/.test(tok)) continue
    // Skip if already covered by a longer phrase we found
    const covered = found.some(
      (f) => f.toLowerCase().includes(tok) && f.toLowerCase() !== tok,
    )
    if (covered) continue
    freq.set(tok, (freq.get(tok) ?? 0) + 1)
  }

  const unigrams = [...freq.entries()]
    .filter(([, n]) => n >= 1)
    .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)
    .map(([w]) => w)

  for (const u of unigrams) {
    if (found.length >= max) break
    add(u)
  }

  return found.slice(0, max)
}

function corpusHas(corpus: string, keyword: string): boolean {
  const k = keyword.toLowerCase().trim()
  if (!k) return false
  // Short / symbolic terms: plain includes
  if (k.length <= 3 || /[/-]/.test(k) || /\d/.test(k)) {
    return corpus.includes(k)
  }
  try {
    const re = new RegExp(
      `(?:^|[^a-z0-9+#])${escapeRegex(k)}(?:[^a-z0-9+#]|$)`,
      'i',
    )
    return re.test(corpus)
  } catch {
    return corpus.includes(k)
  }
}

function joinCorpus(...parts: (string | undefined | null)[]): string {
  return parts
    .filter((p): p is string => Boolean(p && p.trim()))
    .join('\n')
    .toLowerCase()
}

export function buildProfileCorpus(
  profile: ResumeProfile,
  application?: ResumeApplication | null,
): {
  full: string
  byLocation: Record<MatchLocation, string>
} {
  const summary = joinCorpus(profile.baseSummary, application?.summaryOverride)
  const skills = joinCorpus(
    ...profile.skills.hard,
    ...profile.skills.tools,
    ...profile.skills.soft,
  )
  const jobBits: string[] = []
  const toolBits: string[] = []
  const titleBits: string[] = []
  for (const j of profile.jobs) {
    titleBits.push(j.title, j.company, j.department ?? '')
    jobBits.push(
      j.title,
      j.company,
      j.location,
      j.department ?? '',
      ...j.bullets,
      ...j.metrics.map((m) => `${m.label} ${m.value} ${m.unit ?? ''} ${m.context ?? ''}`),
    )
    toolBits.push(...j.tools)
  }
  const jobs = joinCorpus(...jobBits)
  const tools = joinCorpus(...toolBits, ...profile.skills.tools)
  const certs = joinCorpus(
    ...profile.certs.map((c) => `${c.name} ${c.issuer ?? ''} ${c.year ?? ''}`),
  )
  const education = joinCorpus(
    ...profile.education.map(
      (e) => `${e.school} ${e.credential} ${e.year ?? ''} ${e.notes ?? ''}`,
    ),
  )
  const title = joinCorpus(
    ...titleBits,
    application?.targetTitle,
    application?.targetCompany,
  )

  const byLocation: Record<MatchLocation, string> = {
    summary,
    skills,
    jobs,
    tools,
    certs,
    education,
    title,
  }

  const full = joinCorpus(
    summary,
    skills,
    jobs,
    tools,
    certs,
    education,
    title,
    profile.contact.name,
  )

  return { full, byLocation }
}

/** Match curated keywords against master profile (+ app override summary). */
export function matchKeywords(
  keywords: string[],
  profile: ResumeProfile,
  application?: ResumeApplication | null,
): MatchReport {
  const { byLocation } = buildProfileCorpus(profile, application)
  const unique = [
    ...new Map(
      keywords
        .map((k) => normalizeSpace(k))
        .filter(Boolean)
        .map((k) => [k.toLowerCase(), k] as const),
    ).values(),
  ]

  const rows: KeywordMatch[] = unique.map((keyword) => {
    const foundIn: MatchLocation[] = []
    const locs: MatchLocation[] = [
      'summary',
      'skills',
      'jobs',
      'tools',
      'certs',
      'education',
      'title',
    ]
    for (const loc of locs) {
      if (corpusHas(byLocation[loc], keyword)) foundIn.push(loc)
    }
    return {
      keyword,
      matched: foundIn.length > 0,
      foundIn,
    }
  })

  const matchedCount = rows.filter((r) => r.matched).length
  const total = rows.length
  return {
    keywords: rows,
    matchedCount,
    total,
    coverage: total === 0 ? 0 : matchedCount / total,
  }
}

/** Rank experience bullets by how many JD keywords they hit. */
export function rankBulletsByKeywords(
  jobs: Job[],
  keywords: string[],
): BulletHit[] {
  const keys = keywords.map((k) => k.trim()).filter(Boolean)
  if (keys.length === 0) return []

  const hits: BulletHit[] = []
  for (const job of jobs) {
    const jobLabel =
      [job.title, job.company].filter(Boolean).join(' @ ') || 'Untitled role'
    for (const bullet of job.bullets) {
      if (!bullet.trim()) continue
      const lower = bullet.toLowerCase()
      const matched = keys.filter((k) => corpusHas(lower, k))
      if (matched.length === 0) continue
      hits.push({
        jobId: job.id,
        jobLabel,
        bullet,
        key: bulletKey(job.id, bullet),
        hitCount: matched.length,
        hits: matched,
      })
    }
  }
  return hits.sort(
    (a, b) => b.hitCount - a.hitCount || a.jobLabel.localeCompare(b.jobLabel),
  )
}

/** Suggest skills gaps (keywords missing from skills section only). */
export function skillGaps(
  report: MatchReport,
  skills: Skills,
): string[] {
  const skillCorpus = joinCorpus(
    ...skills.hard,
    ...skills.tools,
    ...skills.soft,
  )
  return report.keywords
    .filter((k) => !k.matched || !corpusHas(skillCorpus, k.keyword))
    .filter((k) => !k.matched)
    .map((k) => k.keyword)
}

export function formatCoverage(report: MatchReport): string {
  if (report.total === 0) return 'No keywords yet'
  const pct = Math.round(report.coverage * 100)
  return `${report.matchedCount} of ${report.total} keywords in profile (${pct}%)`
}
