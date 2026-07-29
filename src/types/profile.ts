/** ResumeProfile.v1 — mirrors $LAUNCHER/products/resume-forge/data-model/schema.v1.md */

export type Metric = {
  label: string
  value: string
  unit?: string
  context?: string
}

export type Contact = {
  name: string
  /** Professional / personal email (external applications) */
  email: string
  /** Work / company email (internal applications) */
  emailInternal?: string
  phone: string
  location: string
  linkedin?: string
  portfolio?: string
}

export type Job = {
  id: string
  company: string
  title: string
  start: string
  end: string | null
  /**
   * Worksite city/region printed on the resume (e.g. "Muskegon, MI").
   * Prefer City, ST — not a full street address (ATS-safe).
   */
  location: string
  department?: string
  /**
   * Optional plant / site street address for your bank only.
   * Not printed on the resume by default (street addresses rarely help ATS).
   */
  employerStreet?: string
  /**
   * Optional worksite or HR phone for your notes.
   * Not printed on the resume — your personal phone lives on Contact.
   */
  employerPhone?: string
  bullets: string[]
  metrics: Metric[]
  tools: string[]
  isCurrentEmployer: boolean
}

export type Skills = {
  hard: string[]
  tools: string[]
  soft: string[]
}

export type Education = {
  id: string
  school: string
  credential: string
  year?: string
  notes?: string
}

export type Cert = {
  id: string
  name: string
  issuer?: string
  year?: string
  expires?: string
}

/** Phase 7 — reusable achievement bullet (also mirrored in achievements localStorage). */
export type Achievement = {
  id: string
  text: string
  tags: string[]
  sourceJobId?: string
  createdAt: string
}

export type ResumeProfile = {
  schema: 'ResumeProfile.v1'
  profileId: string
  updatedAt: string
  defaultIndustryPackId: string
  contact: Contact
  baseSummary: string
  jobs: Job[]
  skills: Skills
  education: Education[]
  certs: Cert[]
}

export type NavSection =
  | 'preview'
  | 'applications'
  | 'jd-tailor'
  | 'internal-promo'
  | 'library'
  | 'cover-letter'
  | 'contact'
  | 'summary'
  | 'jobs'
  | 'skills'
  | 'education'
  | 'certs'
  | 'industry-pack'
  /** @deprecated use industry-pack */
  | 'mfg-prompts'
