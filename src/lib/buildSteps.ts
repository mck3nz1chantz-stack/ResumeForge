import type { NavSection } from '../types/profile'

/**
 * Primary build path — matches resume paper order (top → bottom).
 * Layout first so the operator picks structure before filling content.
 */
export const RESUME_FLOW: { id: NavSection; label: string; short: string }[] = [
  { id: 'preview', label: '1 · Layout', short: 'Layout' },
  { id: 'contact', label: '2 · Contact', short: 'Contact' },
  { id: 'summary', label: '3 · Summary', short: 'Summary' },
  { id: 'skills', label: '4 · Skills', short: 'Skills' },
  { id: 'jobs', label: '5 · Experience', short: 'Experience' },
  { id: 'education', label: '6 · Education', short: 'Edu' },
  { id: 'certs', label: '7 · Certs', short: 'Certs' },
  { id: 'applications', label: '8 · This build', short: 'Build' },
]

/** Extra steps when a build is active (target tools). */
const TARGET_TOOLS: { id: NavSection; label: string; short: string }[] = [
  { id: 'jd-tailor', label: 'JD keywords', short: 'JD' },
  { id: 'internal-promo', label: 'Internal promo', short: 'Promo' },
  { id: 'cover-letter', label: 'Cover letter', short: 'Cover' },
]

const EXTRA_TOOLS: { id: NavSection; label: string; short: string }[] = [
  { id: 'library', label: 'Achievements', short: 'Wins' },
  { id: 'industry-pack', label: 'Industry pack', short: 'Pack' },
]

export function buildStepsFor(hasActiveApp: boolean): {
  id: NavSection
  label: string
}[] {
  return [
    ...RESUME_FLOW.map((s) => ({ id: s.id, label: s.short })),
    ...(hasActiveApp
      ? TARGET_TOOLS.map((s) => ({ id: s.id, label: s.short }))
      : []),
  ]
}

/** Ordered list of primary flow section ids (for Continue bar). */
export const FLOW_SECTION_IDS: NavSection[] = RESUME_FLOW.map((s) => s.id)

/**
 * Next step in resume-order flow. Loops to Layout after last step.
 */
export function nextFlowSection(section: NavSection): {
  id: NavSection
  label: string
} {
  const i = FLOW_SECTION_IDS.indexOf(section)
  if (i < 0) {
    // Off-path tools → jump back into content at Summary
    return { id: 'summary', label: '← Back to Summary' }
  }
  if (i >= FLOW_SECTION_IDS.length - 1) {
    return { id: 'preview', label: '← Back to Layout / export' }
  }
  const next = RESUME_FLOW[i + 1]
  return { id: next.id, label: `Continue → ${next.short}` }
}

export function sectionStepLabel(section: NavSection): string {
  const hit = RESUME_FLOW.find((s) => s.id === section)
  if (hit) return hit.label
  const tool = [...TARGET_TOOLS, ...EXTRA_TOOLS].find((s) => s.id === section)
  return tool?.label ?? section
}

/** @deprecated use buildStepsFor */
export const BUILD_STEPS = buildStepsFor(false)
