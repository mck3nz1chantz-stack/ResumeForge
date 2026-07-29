/**
 * Slice 2 — expert draft scaffolds / section coaches.
 * Placeholders only — never invent the operator’s real metrics or history.
 */

export type ExpertScaffold = {
  id: string
  section:
    | 'contact'
    | 'summary'
    | 'jobs'
    | 'skills'
    | 'education'
    | 'certs'
    | 'applications'
  title: string
  /** Which 3-C this coach emphasizes most */
  threeC: 'Clarity' | 'Conciseness' | 'Consistency' | 'All'
  blurb: string
  checklist: string[]
  /** Fill-in patterns with [brackets] — operator replaces with truth */
  fillIns: { label: string; text: string }[]
}

export const EXPERT_SCAFFOLDS: ExpertScaffold[] = [
  {
    id: 'contact',
    section: 'contact',
    title: 'Contact — Clarity first',
    threeC: 'Clarity',
    blurb:
      'Header must be unmistakable. One name, easy reach, city/state is enough (no full street address on modern ATS resumes).',
    checklist: [
      'Name as you use professionally',
      'Phone + at least one email',
      'Professional email for external; work email for internal',
      'LinkedIn only if current and useful',
    ],
    fillIns: [
      {
        label: 'Header line pattern',
        text: '[Full Name] · [City, ST] · [phone] · [email]',
      },
    ],
  },
  {
    id: 'summary',
    section: 'summary',
    title: 'Summary — Concise + clear target',
    threeC: 'Conciseness',
    blurb:
      '2–4 sentences. Who you are for the role you want + 2 domains of strength + one real proof if you have it. No adjective soup.',
    checklist: [
      'Lead with target-level title / years (honest)',
      'Name 2–3 domains managers care about',
      'One real result only if true — leave blank otherwise',
      'Match tone of the application (external vs internal)',
    ],
    fillIns: [
      {
        label: 'External / ATS',
        text: '[Target-level title] with [N]+ years in [domain]. Strong in [skill 1], [skill 2], and [skill 3]. [One real result with number only if true].',
      },
      {
        label: 'Internal promo bridge',
        text: 'Internal candidate for [Target title] as current [Current title] at [Company]. Proven in [domain 1] and [domain 2]. Ready to expand scope to [target scope] with results leadership already knows.',
      },
      {
        label: 'Ops / floor leadership',
        text: '[Team Lead / Supervisor path] on [area/line]. Focus on safety, quality, and throughput with real ownership of [crew / stations / process].',
      },
    ],
  },
  {
    id: 'jobs',
    section: 'jobs',
    title: 'Experience — Clarity + consistency',
    threeC: 'All',
    blurb:
      'Reverse-chronological by dates (auto-sorted — newest / Present first). Same date style everywhere. 2–4 bullets: Action + what + how + result. Never invent numbers — use [X] until you plug real ones.',
    checklist: [
      'Most recent role first (sorted by end then start date)',
      'Title + company + dates on every role',
      'Worksite as City, ST (not full street) — prints with dates',
      'Your phone is on Contact — not employer main number per job',
      'YYYY-MM dates (or same style for all)',
      'Bullets parallel (same tense family, same period style)',
      'Tools named the way the plant / office says them',
    ],
    fillIns: [
      {
        label: 'Safety / quality',
        text: 'Contributed to [N] days without a recordable on [line/cell] through [daily talks / audits / LOTO checks].',
      },
      {
        label: 'Throughput',
        text: 'Improved [output / changeover / uptime] from [A] to [B] on [line] by [method you actually used].',
      },
      {
        label: 'Leadership scope',
        text: 'Led crew of [N] across [Z] shifts on [area]; owned standard work for [stations].',
      },
      {
        label: 'Training',
        text: 'Trained [N] new hires on [PPE / quality criteria / stations] using [checklist / SOP].',
      },
      {
        label: 'Corporate / process',
        text: 'Owned [process / report] for [audience]; cut cycle time from [A] to [B] by [handoff / checklist].',
      },
      {
        label: 'Customer service',
        text: 'Handled [N] [calls/chats/tickets] per [shift] while meeting [quality / CSAT] standards on [channel].',
      },
    ],
  },
  {
    id: 'skills',
    section: 'skills',
    title: 'Skills — Consistency of naming',
    threeC: 'Consistency',
    blurb:
      'Mirror the job’s language only when true. Group hard / tools / soft. Same capitalization style. Soft skills belong in bullets too if claimed.',
    checklist: [
      'Hard = what you can do in the role',
      'Tools = named systems, methods, machines',
      'Soft = leadership / people — prove in bullets',
      'Avoid duplicate near-synonyms cluttering the list',
    ],
    fillIns: [
      {
        label: 'Manufacturing cluster example pattern',
        text: 'Hard: Standard work, Root cause, Cross-training · Tools: 5S, MES, ERP · Soft: Crew coaching',
      },
    ],
  },
  {
    id: 'education',
    section: 'education',
    title: 'Education — Keep it clean',
    threeC: 'Clarity',
    blurb:
      'School · credential · year. Near the bottom once you have solid experience. GPA only if recent and strong.',
    checklist: [
      'Credential name clear (certificate, diploma, degree)',
      'Year optional if older — stay consistent across entries',
      'No essay paragraphs here',
    ],
    fillIns: [
      {
        label: 'Line pattern',
        text: '[Credential] — [School] — [Year]',
      },
    ],
  },
  {
    id: 'certs',
    section: 'certs',
    title: 'Certifications — Named proof',
    threeC: 'Clarity',
    blurb:
      'OSHA, forklift, lean belts, trades cards — exact names employers search. Include issuer/year when it helps.',
    checklist: [
      'Use official cert names',
      'Note expiry only if relevant',
      'Don’t list trainings that aren’t real certs unless labeled',
    ],
    fillIns: [
      {
        label: 'Line pattern',
        text: '[Cert name] — [Issuer] — [Year]',
      },
    ],
  },
  {
    id: 'applications',
    section: 'applications',
    title: 'Target application — Direction control',
    threeC: 'All',
    blurb:
      'One named application per role. Set tone/layout for that target. Live resume follows. Consistency across the file still comes from the master profile.',
    checklist: [
      'Label = role @ company',
      'Pick tone (ATS / internal / ops / skills / compact)',
      'Bridge summary only when it differs from master',
      'Featured jobs when history is long',
    ],
    fillIns: [
      {
        label: 'Label pattern',
        text: '[Target title] @ [Company]',
      },
    ],
  },
]

export function scaffoldFor(
  section: ExpertScaffold['section'],
): ExpertScaffold | undefined {
  return EXPERT_SCAFFOLDS.find((s) => s.section === section)
}
