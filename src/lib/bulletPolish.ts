/**
 * Phase 7 — light local “rewrite” assist (no network / no invented metrics).
 * Deterministic phrasing cleanup; user must accept or reject each suggestion.
 */

export type PolishSuggestion = {
  id: string
  original: string
  suggested: string
  reasons: string[]
}

const WEAK_OPENERS: [RegExp, string][] = [
  [/^responsible for\s+/i, 'Owned '],
  [/^duties included\s+/i, 'Delivered '],
  [/^helped (with|to)\s+/i, 'Supported '],
  [/^assisted (with|in)\s+/i, 'Supported '],
  [/^worked on\s+/i, 'Delivered '],
  [/^was in charge of\s+/i, 'Led '],
  [/^tasked with\s+/i, 'Owned '],
  [/^participated in\s+/i, 'Contributed to '],
]

/** Never invent numbers — only rephrase existing text. */
export function polishBullet(text: string): PolishSuggestion | null {
  const original = text.trim()
  if (original.length < 12) return null

  let suggested = original
  const reasons: string[] = []

  for (const [re, replacement] of WEAK_OPENERS) {
    if (re.test(suggested)) {
      suggested = suggested.replace(re, replacement)
      reasons.push('Stronger action opener')
      break
    }
  }

  let beforeFiller = suggested
  suggested = suggested
    .replace(/\bsuccessfully\s+/gi, '')
    .replace(/\bvarious\s+/gi, '')
    .replace(/\bmultiple\s+different\s+/gi, '')
    .replace(/\bin order to\s+/gi, 'to ')
    .replace(/\bdue to the fact that\s+/gi, 'because ')
    .replace(/\bthe ability to\s+/gi, '')
    .replace(/\butilized\b/gi, 'used')
    .replace(/\butilizes\b/gi, 'uses')
    .replace(/\butilize\b/gi, 'use')
  if (suggested !== beforeFiller) {
    reasons.push('Removed filler wording')
  }

  // Collapse spaces
  suggested = suggested.replace(/\s{2,}/g, ' ').trim()

  // Ensure starts with capital
  if (suggested.length > 0) {
    const capped = suggested.charAt(0).toUpperCase() + suggested.slice(1)
    if (capped !== suggested) {
      suggested = capped
      reasons.push('Capitalized start')
    }
  }

  // Prefer past tense “-ed” not forced; strip trailing period then re-add none (resume style often no period)
  suggested = suggested.replace(/\.$/, '')

  // “and also” → “and”
  const also = suggested.replace(/\band also\b/gi, 'and')
  if (also !== suggested) {
    suggested = also
    reasons.push('Tightened conjunctions')
  }

  if (suggested === original || suggested.length < 8) return null
  if (reasons.length === 0) reasons.push('Light cleanup')

  return {
    id: `pol-${hash(original)}`,
    original,
    suggested,
    reasons,
  }
}

function hash(s: string): string {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h).toString(36)
}

/** Polish all non-empty bullets that change. */
export function polishBulletList(bullets: string[]): PolishSuggestion[] {
  const out: PolishSuggestion[] = []
  for (const b of bullets) {
    const s = polishBullet(b)
    if (s) out.push(s)
  }
  return out
}

/** Light summary polish — same rules, no new claims. */
export function polishSummary(text: string): PolishSuggestion | null {
  return polishBullet(text)
}
