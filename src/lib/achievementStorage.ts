import type { Achievement } from '../types/profile'
import { uid } from './id'

export const ACHIEVEMENTS_KEY = 'resumeforge.achievements.v1'

export function loadAchievements(): Achievement[] {
  try {
    const raw = localStorage.getItem(ACHIEVEMENTS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Achievement[]
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((a) => a && typeof a.text === 'string' && a.text.trim())
      .map((a) => ({
        id: a.id || uid('ach'),
        text: a.text.trim(),
        tags: Array.isArray(a.tags) ? a.tags.filter(Boolean) : [],
        sourceJobId: a.sourceJobId,
        createdAt: a.createdAt || new Date().toISOString(),
      }))
  } catch {
    return []
  }
}

export function saveAchievements(items: Achievement[]): void {
  localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(items))
}

export function createAchievement(
  text: string,
  opts?: { tags?: string[]; sourceJobId?: string },
): Achievement {
  return {
    id: uid('ach'),
    text: text.trim(),
    tags: opts?.tags ?? [],
    sourceJobId: opts?.sourceJobId,
    createdAt: new Date().toISOString(),
  }
}
