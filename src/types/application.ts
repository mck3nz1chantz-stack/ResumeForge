/** ResumeApplication.v1 — mirrors program data-model/schema.v1.md */

export type ApplicationMode = 'external' | 'internal'

/**
 * Template stack — all single-column ATS-safe; differ by density, section order,
 * and emphasis so peers can pick a look without multi-column gimmicks.
 */
export type TemplateId =
  | 'ats-classic'
  | 'professional-compact'
  | 'internal-promotion'
  | 'skills-first'
  | 'impact-dense'
  | 'ops-leader'
  | 'modern-clean'
  | 'executive-brief'
  | 'tech-ops'
  | 'two-page-roomy'
  | 'quality-focus'
  | 'early-career'
  /** Reference pack (reference resumes/) — still single-column ATS-safe */
  | 'floor-worker' // red header band — factory / assembly floor
  | 'production-lead' // bold caps + orange titles — supervisor
  | 'mfg-associate' // steel-blue industrial — associate / line
  | 'timeline' // purple timeline rail — engineer narrative
  | 'engineer-entry' // violet experience-first — early engineer
  | 'classic-green' // forest double rules — school / first job

/**
 * Style / tone for the target role (maps to template + writing guidance).
 * See data/tones.ts
 */
export type ResumeToneId =
  | 'ats-external'
  | 'internal-promo'
  | 'ops-impact'
  | 'skills-forward'
  | 'compact-pro'

export type TemplateMeta = {
  id: TemplateId
  name: string
  short: string
  description: string
  /** Who this layout serves */
  bestFor: string
  /** Visual density tag for gallery */
  density: 'roomy' | 'balanced' | 'compact' | 'dense'
  atsSafe: boolean
  /** Always shown in gallery (vs unlock extras) — full stack is always available now */
  core: boolean
}

/** Locked type size for letter paper (no freeform px). */
export type TypeScale = 'sm' | 'md' | 'lg'

/** Name font family only — body stays system sans for ATS. */
export type NameStyle = 'sans' | 'serif'

/** Page padding / line-height overlay (can refine template density). */
export type PageDensity = 'roomy' | 'balanced' | 'compact'

/**
 * Name + contact block alignment.
 * Not an ATS requirement — left is classic scan; center is fine for selectable text.
 */
export type HeaderAlign = 'left' | 'center'

/**
 * Per-target print / PDF preferences — locked enums only.
 * Applied to live paper CSS vars AND exportPdf layout.
 */
export type PrintPrefs = {
  typeScale: TypeScale
  nameStyle: NameStyle
  pageDensity: PageDensity
  headerAlign: HeaderAlign
}

export type ResumeApplication = {
  schema: 'ResumeApplication.v1'
  applicationId: string
  profileId: string
  label: string
  targetTitle: string
  targetCompany: string
  /** Phase 6 — title you hold now (internal promo bridge). */
  currentTitle: string
  mode: ApplicationMode
  industryPackId: string
  /** Live-build tone — drives layout + writing guidance */
  tone: ResumeToneId
  templateId: TemplateId
  /**
   * Print professional / personal email on this version’s header.
   * Master profile always keeps both addresses; this only controls the resume.
   */
  includeProfessionalEmail: boolean
  /**
   * Print work / internal email on this version’s header.
   * Default off for external versions, on for internal.
   */
  includeInternalEmail: boolean
  /** If non-empty: these jobs first (and only these). Empty = all jobs. */
  featuredJobIds: string[]
  /**
   * Skills on this resume. Empty = all master skills.
   * Keys: `hard::name` | `tools::name` | `soft::name` (lowercased).
   * `__none__` = no skills printed.
   */
  featuredSkillKeys: string[]
  summaryOverride: string
  jobDescription: string
  jdKeywords: string[]
  pinnedBulletKeys: string[]
  internalCompanyFilter: boolean
  coverLetter: string
  /** Locked font / density dials for paper + PDF */
  printPrefs: PrintPrefs
  updatedAt: string
}
