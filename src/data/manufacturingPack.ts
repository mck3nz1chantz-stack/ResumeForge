/**
 * Back-compat re-export — prefer `data/packs` or `getPack()`.
 * Full manufacturing pack lives in `data/packs/manufacturing.ts`.
 */
export type { IndustryPack, MetricPrompt } from '../types/industryPack'
export { manufacturingPack } from './packs/manufacturing'
