/**
 * Per-build skill selection from the master skills bank.
 *
 * Storage (`featuredSkillKeys`):
 * - `[]` (empty) → include **all** master skills
 * - `['__none__']` → include **no** skills
 * - `['hard::cnc', 'tools::sap', …]` → only those keys
 *
 * Key format: `${category}::${normalizedSkill}` where category is hard|tools|soft
 * and skill is trimmed + lowercased for stable matching.
 */

import type { Skills } from '../types/profile'
import { FEATURED_NONE } from './featuredJobs'

export type SkillCategory = 'hard' | 'tools' | 'soft'

export const SKILL_CATEGORIES: {
  id: SkillCategory
  label: string
}[] = [
  { id: 'hard', label: 'Hard / domain' },
  { id: 'tools', label: 'Tools & systems' },
  { id: 'soft', label: 'Soft / leadership' },
]

export function skillKey(cat: SkillCategory, skill: string): string {
  return `${cat}::${skill.trim().toLowerCase()}`
}

export function parseSkillKey(
  key: string,
): { cat: SkillCategory; norm: string } | null {
  const i = key.indexOf('::')
  if (i <= 0) return null
  const cat = key.slice(0, i) as SkillCategory
  if (cat !== 'hard' && cat !== 'tools' && cat !== 'soft') return null
  const norm = key.slice(i + 2).trim().toLowerCase()
  if (!norm) return null
  return { cat, norm }
}

/** Flat list of skill keys in master bank order (hard → tools → soft). */
export function masterSkillKeys(skills: Skills): string[] {
  const keys: string[] = []
  for (const cat of ['hard', 'tools', 'soft'] as SkillCategory[]) {
    for (const s of skills[cat]) {
      const t = s.trim()
      if (!t) continue
      keys.push(skillKey(cat, t))
    }
  }
  return keys
}

/** Effective keys that print on this build. */
export function selectedSkillKeys(
  featuredSkillKeys: string[] | undefined | null,
  allKeys: string[],
): string[] {
  const featured = (featuredSkillKeys ?? []).filter(Boolean)
  if (featured.length === 0) return [...allKeys]
  if (featured.includes(FEATURED_NONE)) return []
  const set = new Set(featured)
  return allKeys.filter((k) => set.has(k))
}

export function isSkillSelected(
  key: string,
  featuredSkillKeys: string[] | undefined | null,
  allKeys: string[],
): boolean {
  return selectedSkillKeys(featuredSkillKeys, allKeys).includes(key)
}

export function isAllSkillsSelected(
  featuredSkillKeys: string[] | undefined | null,
  allKeys: string[],
): boolean {
  if (allKeys.length === 0) return true
  const featured = (featuredSkillKeys ?? []).filter(Boolean)
  if (featured.length === 0) return true
  if (featured.includes(FEATURED_NONE)) return false
  return selectedSkillKeys(featuredSkillKeys, allKeys).length === allKeys.length
}

export function toFeaturedSkillKeys(
  selected: string[],
  allKeys: string[],
): string[] {
  if (allKeys.length === 0) return []
  const set = new Set(selected)
  const ordered = allKeys.filter((k) => set.has(k))
  if (ordered.length === 0) return [FEATURED_NONE]
  if (ordered.length === allKeys.length) return []
  return ordered
}

export function toggleSkillSelection(
  key: string,
  featuredSkillKeys: string[] | undefined | null,
  allKeys: string[],
): string[] {
  const current = selectedSkillKeys(featuredSkillKeys, allKeys)
  const on = current.includes(key)
  const next = on
    ? current.filter((k) => k !== key)
    : allKeys.filter((k) => current.includes(k) || k === key)
  return toFeaturedSkillKeys(next, allKeys)
}

export function selectAllSkills(): string[] {
  return []
}

export function selectNoSkills(): string[] {
  return [FEATURED_NONE]
}

/** Select only one category (e.g. tools-heavy external ATS). */
export function selectSkillCategoryOnly(
  skills: Skills,
  cat: SkillCategory,
): string[] {
  const all = masterSkillKeys(skills)
  const only = all.filter((k) => k.startsWith(`${cat}::`))
  return toFeaturedSkillKeys(only, all)
}

/**
 * Filter master skills for resolve/PDF.
 * Empty featured → all. FEATURED_NONE → empty categories. Else match keys.
 */
export function filterSkillsByFeatured(
  skills: Skills,
  featuredSkillKeys: string[] | undefined | null,
): Skills {
  const featured = (featuredSkillKeys ?? []).filter(Boolean)
  if (featured.length === 0) {
    return {
      hard: [...skills.hard],
      tools: [...skills.tools],
      soft: [...skills.soft],
    }
  }
  if (featured.includes(FEATURED_NONE)) {
    return { hard: [], tools: [], soft: [] }
  }
  const set = new Set(featured)
  const pick = (cat: SkillCategory, list: string[]) =>
    list.filter((s) => s.trim() && set.has(skillKey(cat, s)))
  return {
    hard: pick('hard', skills.hard),
    tools: pick('tools', skills.tools),
    soft: pick('soft', skills.soft),
  }
}

export function countMasterSkills(skills: Skills): number {
  return masterSkillKeys(skills).length
}
