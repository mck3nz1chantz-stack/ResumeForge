import type { IndustryPack, SkillCategoryOrder } from '../types/industryPack'
import type { Skills } from '../types/profile'

/** Score skill higher if it appears in the pack keyword bank / suggestions. */
function skillScore(skill: string, pack: IndustryPack): number {
  const s = skill.toLowerCase()
  let score = 0
  for (const k of pack.keywordBank) {
    const kk = k.toLowerCase()
    if (s === kk) score += 3
    else if (s.includes(kk) || kk.includes(s)) score += 1
  }
  for (const list of [
    pack.skillSuggestions.hard,
    pack.skillSuggestions.tools,
    pack.skillSuggestions.soft,
  ]) {
    for (const sug of list) {
      if (s === sug.toLowerCase()) score += 2
    }
  }
  return score
}

function sortSkills(arr: string[], pack: IndustryPack): string[] {
  return [...arr].sort((a, b) => {
    const d = skillScore(b, pack) - skillScore(a, pack)
    if (d !== 0) return d
    return a.localeCompare(b)
  })
}

/**
 * Reorder skills within categories by pack relevance.
 * Category print order is separate (skillCategoryOrder on pack).
 */
export function orderSkillsForPack(skills: Skills, pack: IndustryPack): Skills {
  return {
    hard: sortSkills(skills.hard, pack),
    tools: sortSkills(skills.tools, pack),
    soft: sortSkills(skills.soft, pack),
  }
}

export function categoryOrderForPack(pack: IndustryPack): SkillCategoryOrder {
  return pack.skillCategoryOrder ?? ['hard', 'tools', 'soft']
}
