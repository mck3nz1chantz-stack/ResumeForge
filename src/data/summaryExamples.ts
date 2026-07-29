/** Professional summary formula + examples for tooltip / help UI. */

export type SummaryExample = {
  id: string
  title: string
  audience: string
  text: string
}

export const SUMMARY_FORMULA =
  '[Title / years on floor] + [2–3 domains: safety, quality, throughput/leadership] + [one quantified result].'

export const SUMMARY_TIPS = [
  '2–4 sentences max — recruiters skim in seconds.',
  'Lead with the role you want, not every job you’ve held.',
  'Prefer one real number over adjectives (“hard worker”).',
  'For internal promo: bridge current title → target title.',
  'Mirror a few keywords from the posting (only if true).',
]

export const SUMMARY_EXAMPLES: SummaryExample[] = [
  {
    id: 'mfg-lead',
    title: 'Production / team lead',
    audience: 'Plant floor leadership',
    text: 'Production Team Lead with 4+ years on high-volume assembly. Strong in safety culture, standard work, and quality ownership. Reduced scrap 18% on Line 2 by standardizing setup checks while leading a crew of 12 across two shifts.',
  },
  {
    id: 'mfg-operator',
    title: 'Operator / multi-skill',
    audience: 'Hands-on manufacturing',
    text: 'Manufacturing operator with multi-station experience and a safety-first mindset. Skilled in standard work, in-process quality, and cross-training. Consistently met rate targets and flagged defects early to cut rework loops.',
  },
  {
    id: 'internal-promo',
    title: 'Internal promotion',
    audience: 'Same company, next level',
    text: 'Internal candidate for Production Supervisor with 5 years at Example Industrial Co. Proven ownership of Line 2 throughput, daily safety talks, and new-hire training. Ready to expand scope from team lead to full shift accountability.',
  },
  {
    id: 'supervisor',
    title: 'Supervisor / ops',
    audience: 'Shift or area supervision',
    text: 'Operations-focused manufacturing supervisor experienced in crew leadership, quality systems, and continuous improvement. Track record of measurable gains in scrap reduction and incident-free days while coordinating cross-shift handoffs.',
  },
  {
    id: 'career-change',
    title: 'Career bridge (adjacent)',
    audience: 'Moving into a related plant role',
    text: 'Manufacturing professional transitioning into quality-focused work. Background in production and root-cause thinking with hands-on SPC exposure. Combines floor credibility with a drive to improve first-time quality and documentation discipline.',
  },
]
