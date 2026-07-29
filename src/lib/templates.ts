import type { TemplateId, TemplateMeta } from '../types/application'

/** Full professional stack — all single-column ATS-safe. */
export const TEMPLATES: TemplateMeta[] = [
  {
    id: 'ats-classic',
    name: 'ATS Classic',
    short: 'Classic',
    description:
      'Georgia name, navy double rule, classic ATS single-column — safe default.',
    bestFor: 'Most external job boards & recruiter ATS',
    density: 'balanced',
    atsSafe: true,
    core: true,
  },
  {
    id: 'professional-compact',
    name: 'Professional Compact',
    short: 'Compact',
    description: 'Charcoal thin rules, tighter type — more history per page.',
    bestFor: 'Mid-career with more history to fit',
    density: 'compact',
    atsSafe: true,
    core: true,
  },
  {
    id: 'internal-promotion',
    name: 'Internal Promotion',
    short: 'Internal',
    description:
      'Warm amber accent + internal banner — reads “in-house candidate.”',
    bestFor: 'Internal postings & promotion packets',
    density: 'balanced',
    atsSafe: true,
    core: true,
  },
  {
    id: 'skills-first',
    name: 'Skills First',
    short: 'Skills',
    description:
      'Teal skills band first — tools jump off for skills-based screens.',
    bestFor: 'JDs heavy on tools / systems lists',
    density: 'balanced',
    atsSafe: true,
    core: true,
  },
  {
    id: 'impact-dense',
    name: 'Impact Dense',
    short: 'Dense',
    description:
      'Uppercase name, minimal chrome — max content density, still ATS.',
    bestFor: 'Longer histories that must stay scannable',
    density: 'dense',
    atsSafe: true,
    core: true,
  },
  {
    id: 'ops-leader',
    name: 'Ops / Floor Leader',
    short: 'Ops',
    description:
      'Burnt-orange rules + left rail on jobs — leadership weight on titles.',
    bestFor: 'Team lead, supervisor, production leadership',
    density: 'balanced',
    atsSafe: true,
    core: true,
  },
  {
    id: 'modern-clean',
    name: 'Modern Clean',
    short: 'Modern',
    description:
      'Large serif name, short accent rule, gradient section lines — standout clean.',
    bestFor: 'Standing out while staying recruiter-safe',
    density: 'roomy',
    atsSafe: true,
    core: true,
  },
  {
    id: 'executive-brief',
    name: 'Executive Brief',
    short: 'Brief',
    description:
      'Spaced caps name, double gold rule — confident leadership skim path.',
    bestFor: 'Supervisor path, internal leadership asks',
    density: 'compact',
    atsSafe: true,
    core: true,
  },
  {
    id: 'tech-ops',
    name: 'Tech / Machine Ops',
    short: 'Tech ops',
    description:
      'Cyan/slate tech look, mono dates — skills + experience first for floor tech.',
    bestFor: 'Technical Machine Operator, tech, multi-skill floor',
    density: 'balanced',
    atsSafe: true,
    core: true,
  },
  {
    id: 'two-page-roomy',
    name: 'Two-Page Roomy',
    short: 'Roomy',
    description:
      'Airy serif name and open spacing — breathes when you have real depth.',
    bestFor: '10+ years or multi-plant history',
    density: 'roomy',
    atsSafe: true,
    core: true,
  },
  {
    id: 'quality-focus',
    name: 'Quality & Certs',
    short: 'Quality',
    description:
      'Forest green + highlighted certs band — quality/safety credentials pop.',
    bestFor: 'Quality, safety, ISO, OSHA-heavy roles',
    density: 'balanced',
    atsSafe: true,
    core: true,
  },
  {
    id: 'early-career',
    name: 'Early Career',
    short: 'Early',
    description:
      'Indigo soft bands on education — friendly for apprentices & newer ops.',
    bestFor: 'Newer operators, apprentices, first plant roles',
    density: 'balanced',
    atsSafe: true,
    core: true,
  },
  // —— Reference pack (visual signatures from reference resumes/) ——
  {
    id: 'floor-worker',
    name: 'Floor Worker',
    short: 'Floor',
    description:
      'Bold red name band + white ink — factory / assembly floor impact (ref: Harry Taylor style).',
    bestFor: 'Factory worker, assembly, dispatch, hands-on plant roles',
    density: 'balanced',
    atsSafe: true,
    core: true,
  },
  {
    id: 'production-lead',
    name: 'Production Lead',
    short: 'Lead',
    description:
      'Heavy caps name, orange company/title accents — supervisor skim path (ref: Sophia Kim style).',
    bestFor: 'Production supervisor, shift lead, automotive ops',
    density: 'balanced',
    atsSafe: true,
    core: true,
  },
  {
    id: 'mfg-associate',
    name: 'Mfg Associate',
    short: 'Associate',
    description:
      'Steel-blue rules + skills band — clean industrial associate layout (ref: Elijah Dean style).',
    bestFor: 'Manufacturing associate, food mfg, GMP / quality line',
    density: 'balanced',
    atsSafe: true,
    core: true,
  },
  {
    id: 'timeline',
    name: 'Timeline Engineer',
    short: 'Timeline',
    description:
      'Purple job rail + airy name — narrative engineer timeline (ref: Sebastian Binder style).',
    bestFor: 'Manufacturing engineer, process engineer, technical path',
    density: 'roomy',
    atsSafe: true,
    core: true,
  },
  {
    id: 'engineer-entry',
    name: 'Engineer Entry',
    short: 'Eng entry',
    description:
      'Violet experience-first layout — early engineer / projects weight (ref: entry mfg engineer).',
    bestFor: 'Entry manufacturing engineer, intern → engineer path',
    density: 'balanced',
    atsSafe: true,
    core: true,
  },
  {
    id: 'classic-green',
    name: 'Classic Green',
    short: 'Green',
    description:
      'Centered serif name, twin green rules — first-job / school-friendly classic (ref: high-school sample).',
    bestFor: 'First job, student, admin, library, light customer service',
    density: 'roomy',
    atsSafe: true,
    core: true,
  },
]

export const CORE_TEMPLATES = TEMPLATES.filter((t) => t.core)
export const EXTRA_TEMPLATES = TEMPLATES.filter((t) => !t.core)

export function getTemplate(id: TemplateId): TemplateMeta {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0]
}

export function isTemplateId(v: string): v is TemplateId {
  return TEMPLATES.some((t) => t.id === v)
}

const EXTRA_UNLOCK_KEY = 'resumeforge.templates.extrasUnlocked.v1'

/** Full stack is always available (legacy key still honored if set to lock). */
export function loadExtrasUnlocked(): boolean {
  try {
    const v = localStorage.getItem(EXTRA_UNLOCK_KEY)
    if (v === '0') return false
    return true
  } catch {
    return true
  }
}

export function saveExtrasUnlocked(on: boolean): void {
  try {
    localStorage.setItem(EXTRA_UNLOCK_KEY, on ? '1' : '0')
  } catch {
    /* ignore */
  }
}

export function visibleTemplates(_extrasUnlocked?: boolean): TemplateMeta[] {
  // Always return full stack so operators can compare peers' looks
  return TEMPLATES
}
