/**
 * Offline section guides — structure + length for operator-written copy.
 * Never invent metrics; guides only describe shape and craft targets.
 */

export type SectionGuideId =
  | 'contact'
  | 'summary'
  | 'jobs'
  | 'skills'
  | 'education'
  | 'certs'
  | 'applications'
  | 'leverage-story'

export type SectionGuideSpec = {
  id: SectionGuideId
  title: string
  /** Hard length target for the operator */
  length: string
  /** Ordered structure blocks */
  structure: string[]
  tips: string[]
  avoid: string[]
  /** 3-C emphasis */
  threeC: string
}

export const SECTION_GUIDES: Record<SectionGuideId, SectionGuideSpec> = {
  contact: {
    id: 'contact',
    title: 'Contact header',
    length: 'One line of truth — name + 1–2 reach methods',
    structure: [
      'Full professional name',
      'Phone (mobile you answer)',
      'Email for this path (professional and/or work)',
      'City, ST (optional — no street address)',
    ],
    tips: [
      'Use the name managers already know you by.',
      'External apps → personal email; internal → work email is fine.',
    ],
    avoid: ['Full street address', 'Unprofessional email handles'],
    threeC: 'Clarity',
  },
  summary: {
    id: 'summary',
    title: 'Professional summary',
    length: '2–4 sentences · about 40–90 words · under ~4 lines on paper',
    structure: [
      'Who you are for the role you want (title level + domain)',
      '2–3 strengths that match the target',
      'One real proof only if true (number optional — leave out if unsure)',
      'Internal path: bridge current title → target title',
    ],
    tips: [
      'Write in first person implied (no “I am…” needed on most ATS resumes).',
      'Lead with the job you want, not your whole career story.',
      'Mirror 1–2 real keywords from the posting only if they are true for you.',
      'Edit on the live paper — if it wraps to half a page, cut.',
    ],
    avoid: [
      'Adjective piles (“hardworking, dedicated team player…”)',
      'Invented metrics or years',
      'Listing every past job title',
    ],
    threeC: 'Conciseness + Clarity',
  },
  jobs: {
    id: 'jobs',
    title: 'Master career bank',
    length: '2–4 strong bullets per role · each bullet ~1–2 lines (~12–28 words)',
    structure: [
      'Bank every role you might need (internal + external)',
      'Order is reverse-chronological by dates (auto-sorted — not typing order)',
      'Title + company + dates (YYYY-MM preferred, same style everywhere)',
      'Worksite on resume = City, ST only (not full street)',
      'Your phone/email = Contact tab — not employer switchboard on each job',
      'Bullet = Action verb + what you did + how/tools + result if real',
    ],
    tips: [
      'Fill start/end dates — the list reorders newest first when dates change.',
      'Add external jobs here even if your current version is internal — uncheck them on that version.',
      'Employer street / plant phone can sit in optional notes fields — they do not print.',
      'Start with owned, led, ran, trained, reduced, improved — not “responsible for”.',
      'If you don’t have a number, stop at the action + scope (no fake %s).',
    ],
    avoid: [
      'Full street addresses on the resume line (use City, ST)',
      'Putting your cell phone under employer phone',
      'Duty dumps of 8+ weak lines',
      'Invented throughput / safety numbers',
    ],
    threeC: 'Clarity + Consistency',
  },
  skills: {
    id: 'skills',
    title: 'Skills',
    length: '6–14 items total across hard / tools / soft · short phrases',
    structure: [
      'Hard = processes, methods, quality/safety systems',
      'Tools = machines, software, gauges you actually run',
      'Soft = leadership / communication only if demonstrated on the job',
    ],
    tips: [
      'Match spelling to the job posting when true (e.g. “LOTO” vs “Lockout/Tagout”).',
      'Prefer concrete tools over vague “Microsoft Office”.',
    ],
    avoid: ['Random ALL CAPS on some skills only', 'Skills you cannot speak to in an interview'],
    threeC: 'Consistency',
  },
  education: {
    id: 'education',
    title: 'Education',
    length: '1–3 entries · one line each (school · credential · year)',
    structure: ['School / program', 'Credential or focus', 'Year or range (optional if incomplete)'],
    tips: ['List highest or most relevant first.', 'Trade school and apprenticeships count — include them.'],
    avoid: ['GPA unless asked or exceptional', 'Padding with short workshops better as certs'],
    threeC: 'Clarity',
  },
  certs: {
    id: 'certs',
    title: 'Certifications',
    length: 'Only current / relevant · name + issuer + year if known',
    structure: ['Cert name as printed', 'Issuer (optional)', 'Year or expiry if useful'],
    tips: ['OSHA, forklift, lean, quality certs are high signal in manufacturing.'],
    avoid: ['Expired certs without noting expired', 'Fake or incomplete cert names'],
    threeC: 'Clarity',
  },
  applications: {
    id: 'applications',
    title: 'Resume versions',
    length: 'One named version per role you apply to',
    structure: [
      'Version name you recognize (Title @ Company)',
      'Target title + company',
      'Mode: external vs internal',
      'Tone + layout for that path',
    ],
    tips: [
      'Master profile holds history; versions re-weight for each target.',
      'Use the top Save / dropdown to load versions anytime.',
      'Paste JD on JD keywords step when you have a posting.',
    ],
    avoid: ['One giant resume trying to serve every job'],
    threeC: 'Clarity',
  },
  'leverage-story': {
    id: 'leverage-story',
    title: 'Leverage story (target-first)',
    length: '5 short fields · plain language · 1–3 sentences each',
    structure: [
      'Mode: internal or external',
      'Target title (what you are applying for)',
      'Current title + company/plant',
      'Skills / tools you use (comma list)',
      'Daily work + what you have helped with (real only)',
    ],
    tips: [
      'Write like you would tell a lead — the app structures it into resume format.',
      'Leave numbers blank if you are unsure — never guess.',
      'After this path, polish wording on Summary / Jobs with Structure tips open.',
    ],
    avoid: ['Copying a whole JD as your experience', 'Inflating title or inventing results'],
    threeC: 'Clarity first — then Conciseness on polish',
  },
}

export function sectionGuide(id: SectionGuideId): SectionGuideSpec {
  return SECTION_GUIDES[id]
}
