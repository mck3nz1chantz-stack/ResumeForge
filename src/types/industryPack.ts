/** IndustryPack.v1 — embedded app copy of program industry-packs/*.json */

export type MetricPrompt = {
  id: string
  prompt: string
  exampleBullet: string
}

export type SkillSuggestions = {
  hard: string[]
  tools: string[]
  soft: string[]
}

/** Which skill category line prints first on the resume. */
export type SkillCategoryOrder = Array<'hard' | 'tools' | 'soft'>

export type IndustryPack = {
  id: string
  displayName: string
  /** Short badge label */
  shortName: string
  description: string
  /** Beachhead pack gets primary positioning */
  beachhead?: boolean
  managerScanNotes: string[]
  metricPrompts: MetricPrompt[]
  keywordBank: string[]
  bulletSkeletons: string[]
  preferredSkillClusters: string[]
  skillSuggestions: SkillSuggestions
  /** Category print order on export (pack-driven, not just colors). */
  skillCategoryOrder: SkillCategoryOrder
  summaryFormula: string
  /** Extra multi-word phrases for JD extract */
  jdPhrases?: string[]
}

export type IndustryPackId =
  | 'manufacturing'
  | 'corporate'
  | 'customer-service'
