import type { ResolvedResume } from './resolveResume'
import { resolvedToPlainText } from './plainText'

export type PageGuidance = {
  estimatedPages: number
  lineCount: number
  charCount: number
  level: 'tight' | 'ok' | 'long'
  message: string
  tip: string
}

/**
 * Rough length heuristic from plain-text line count.
 * Honest for mid/manager: ~2 pages is often preferred when content earns it
 * (research: two-page materials selected more often for experienced roles).
 * Compact / dense templates allow slightly more lines per page.
 */
export function getPageGuidance(view: ResolvedResume): PageGuidance {
  const text = resolvedToPlainText(view)
  const lines = text.split('\n').filter((l) => l.trim().length > 0)
  const lineCount = lines.length
  const charCount = text.length
  const compactPack =
    view.templateId === 'professional-compact' ||
    view.templateId === 'impact-dense' ||
    view.templateId === 'executive-brief' ||
    view.printPrefs?.pageDensity === 'compact'
  const perPage = compactPack ? 65 : 55
  const estimatedPages = Math.max(1, Math.ceil(lineCount / perPage))

  const jobCount = view.jobs.length
  /** Mid-career / manager signal: enough history or depth-oriented layout */
  const depthRole =
    jobCount >= 3 ||
    view.templateId === 'two-page-roomy' ||
    view.templateId === 'ops-leader' ||
    view.templateId === 'executive-brief' ||
    view.templateId === 'modern-clean' ||
    view.templateId === 'production-lead' ||
    view.templateId === 'timeline'

  // Sparse
  if (lineCount <= perPage * 0.85) {
    return {
      estimatedPages,
      lineCount,
      charCount,
      level: 'tight',
      message:
        estimatedPages === 1
          ? 'Fits a tight 1-page target.'
          : `About ${estimatedPages} page(s) by line count.`,
      tip:
        jobCount >= 3
          ? 'Experienced path: add quantified impact (safety, quality, crew size, throughput) — 2 pages is fine when real.'
          : 'Add 2–4 impact bullets per role with real numbers you can defend.',
    }
  }

  // Healthy 1–2 page band
  if (lineCount <= perPage * 1.95) {
    const twoPage = estimatedPages >= 2
    if (twoPage && depthRole) {
      return {
        estimatedPages,
        lineCount,
        charCount,
        level: 'ok',
        message:
          'About 2 pages — strong for mid-level / manager roles when content earns the space.',
        tip: 'Keep bold titles and dates scannable; cut filler, keep metrics. ATS does not penalize 2 pages.',
      }
    }
    if (twoPage) {
      return {
        estimatedPages,
        lineCount,
        charCount,
        level: 'ok',
        message: 'About 2 pages — fine when every line earns its place.',
        tip: 'Early career can still target 1 page; mid-career often benefits from depth. Trim duty lists first.',
      }
    }
    return {
      estimatedPages,
      lineCount,
      charCount,
      level: 'ok',
      message: 'Solid 1-page length for most applications.',
      tip: depthRole
        ? 'If you have more real wins, a second page is OK for experienced / manager targets.'
        : 'Prefer impact bullets over duty dumps; expand only with real metrics.',
    }
  }

  // Truly long (3+ pages territory)
  return {
    estimatedPages,
    lineCount,
    charCount,
    level: 'long',
    message: `Long (~${estimatedPages} pages). Managers may skim hard after page 2.`,
    tip:
      compactPack || view.printPrefs?.pageDensity === 'compact'
        ? 'Trim older roles to 2 bullets, or feature only relevant jobs on this target.'
        : 'Try Compact density or Professional Compact; keep the last 10–15 years sharp.',
  }
}
