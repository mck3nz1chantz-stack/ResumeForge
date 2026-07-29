import type { IndustryPack, IndustryPackId } from '../../types/industryPack'
import { corporatePack } from './corporate'
import { customerServicePack } from './customerService'
import { manufacturingPack } from './manufacturing'

export { manufacturingPack } from './manufacturing'
export { corporatePack } from './corporate'
export { customerServicePack } from './customerService'

/** All packs — manufacturing first (beachhead). */
export const INDUSTRY_PACKS: IndustryPack[] = [
  manufacturingPack,
  corporatePack,
  customerServicePack,
]

const BY_ID = new Map(INDUSTRY_PACKS.map((p) => [p.id, p]))

export function isIndustryPackId(id: string): id is IndustryPackId {
  return BY_ID.has(id)
}

export function getPack(id: string | null | undefined): IndustryPack {
  if (id && BY_ID.has(id)) return BY_ID.get(id)!
  return manufacturingPack
}

export function listPacks(): IndustryPack[] {
  return INDUSTRY_PACKS
}

/** Resolve pack for an application, falling back to profile default. */
export function resolvePackId(
  applicationPackId: string | null | undefined,
  profileDefaultId: string | null | undefined,
): string {
  if (applicationPackId && BY_ID.has(applicationPackId)) return applicationPackId
  if (profileDefaultId && BY_ID.has(profileDefaultId)) return profileDefaultId
  return 'manufacturing'
}
