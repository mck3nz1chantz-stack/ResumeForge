/**
 * Skin tokens for Download PDF (jsPDF text path).
 *
 * Locked SSOT: docs/PDF_ARCHITECTURE.md
 *
 * Path A (locked 2026-07-26): skin-aware draw accents in exportPdfText —
 * header rules, section underlines, bullet discs, optional ops rail /
 * internal banner. Mirrors CSS `.ats-skin-*` accent/rule colors.
 * Text stays selectable; letter geometry unchanged.
 * When CSS skin hex changes, update RGB here in the same change.
 */
import type { TemplateId } from '../types/application'

export type Rgb = readonly [number, number, number]

export type HeaderRuleStyle =
  | 'full'
  | 'short'
  | 'double' // classic: thick + slate thin
  | 'double-gap' // executive: thin — gap — thin
  | 'stacked-ops' // thick accent + thin peach
  | 'stacked-tech' // accent + cyan

export type SectionRuleStyle = 'full' | 'gradient' | 'dashed'

export type PdfSkin = {
  accent: Rgb
  rule: Rgb
  sectionRule: Rgb
  muted: Rgb
  ink: Rgb
  header: {
    style: HeaderRuleStyle
    /** Primary bar thickness (inches) */
    heightIn: number
    /** modern / early short accent bar */
    shortWidthIn?: number
    secondary?: Rgb
  }
  section: {
    style: SectionRuleStyle
    heightIn: number
  }
  /** Section H2 ink vs accent (modern / tech / early) */
  sectionTitleColor: 'ink' | 'accent'
  nameUppercase: boolean
  companyColor: 'muted' | 'accent'
  /** Ops leader left rail on each job */
  jobLeftRail: boolean
  /** Internal promo banner band */
  bannerBand?: Rgb
  bannerBorder?: Rgb
}

const INK: Rgb = [20, 20, 20]
const MUTED_DEFAULT: Rgb = [70, 70, 70]

function hex(r: number, g: number, b: number): Rgb {
  return [r, g, b] as const
}

/**
 * templateId → PDF draw tokens (from index.css .ats-skin-*).
 * Keep in sync when CSS skin accents change.
 */
const SKINS: Record<TemplateId, PdfSkin> = {
  'ats-classic': {
    accent: hex(26, 54, 93), // #1a365d
    rule: hex(26, 54, 93),
    sectionRule: hex(26, 54, 93),
    muted: MUTED_DEFAULT,
    ink: INK,
    header: {
      style: 'double',
      heightIn: 0.028,
      secondary: hex(148, 163, 184), // #94a3b8
    },
    section: { style: 'full', heightIn: 0.014 },
    sectionTitleColor: 'ink',
    nameUppercase: false,
    companyColor: 'muted',
    jobLeftRail: false,
  },
  'professional-compact': {
    accent: hex(41, 37, 36), // #292524
    rule: hex(68, 64, 60), // #44403c
    sectionRule: hex(68, 64, 60),
    muted: hex(87, 83, 78), // #57534e
    ink: INK,
    header: { style: 'full', heightIn: 0.01 },
    section: { style: 'full', heightIn: 0.01 },
    sectionTitleColor: 'ink',
    nameUppercase: false,
    companyColor: 'muted',
    jobLeftRail: false,
  },
  'internal-promotion': {
    accent: hex(146, 64, 14), // #92400e
    rule: hex(120, 53, 15), // #78350f
    sectionRule: hex(217, 119, 6), // #d97706
    muted: MUTED_DEFAULT,
    ink: INK,
    header: { style: 'full', heightIn: 0.028 },
    section: { style: 'full', heightIn: 0.014 },
    sectionTitleColor: 'ink',
    nameUppercase: false,
    companyColor: 'muted',
    jobLeftRail: false,
    bannerBand: hex(255, 251, 235), // #fffbeb
    bannerBorder: hex(146, 64, 14),
  },
  'skills-first': {
    accent: hex(15, 118, 110), // #0f766e
    rule: hex(17, 94, 89), // #115e59
    sectionRule: hex(17, 94, 89), // general sections; skills band is CSS-only
    muted: MUTED_DEFAULT,
    ink: INK,
    header: { style: 'full', heightIn: 0.02 },
    section: { style: 'full', heightIn: 0.014 },
    sectionTitleColor: 'ink',
    nameUppercase: false,
    companyColor: 'muted',
    jobLeftRail: false,
  },
  'impact-dense': {
    accent: hex(51, 65, 85), // #334155
    rule: hex(100, 116, 139), // #64748b
    sectionRule: hex(100, 116, 139),
    muted: MUTED_DEFAULT,
    ink: INK,
    header: { style: 'full', heightIn: 0.01 },
    section: { style: 'full', heightIn: 0.01 },
    sectionTitleColor: 'ink',
    nameUppercase: true,
    companyColor: 'muted',
    jobLeftRail: false,
  },
  'ops-leader': {
    accent: hex(154, 52, 18), // #9a3412
    rule: hex(124, 45, 18), // #7c2d12
    sectionRule: hex(124, 45, 18),
    muted: MUTED_DEFAULT,
    ink: INK,
    header: {
      style: 'stacked-ops',
      heightIn: 0.035,
      secondary: hex(253, 186, 116), // #fdba74
    },
    section: { style: 'full', heightIn: 0.014 },
    sectionTitleColor: 'ink',
    nameUppercase: false,
    companyColor: 'accent',
    jobLeftRail: true,
  },
  'modern-clean': {
    accent: hex(30, 58, 138), // #1e3a8a
    rule: hex(30, 58, 138),
    sectionRule: hex(30, 58, 138),
    muted: hex(71, 85, 105), // #475569
    ink: INK,
    header: {
      style: 'short',
      heightIn: 0.028,
      shortWidthIn: 0.55, // ~3.2rem at letter scale
    },
    section: { style: 'gradient', heightIn: 0.014 },
    sectionTitleColor: 'accent',
    nameUppercase: false,
    companyColor: 'muted',
    jobLeftRail: false,
  },
  'executive-brief': {
    accent: hex(113, 63, 18), // #713f12
    rule: hex(161, 98, 7), // #a16207
    sectionRule: hex(214, 211, 209), // #d6d3d1
    muted: hex(68, 64, 60), // #44403c
    ink: INK,
    header: {
      style: 'double-gap',
      heightIn: 0.012,
      secondary: hex(161, 98, 7),
    },
    section: { style: 'full', heightIn: 0.01 },
    sectionTitleColor: 'ink',
    nameUppercase: true,
    companyColor: 'muted',
    jobLeftRail: false,
  },
  'tech-ops': {
    accent: hex(14, 116, 144), // #0e7490
    rule: hex(21, 94, 117), // #155e75
    sectionRule: hex(103, 232, 249), // #67e8f9
    muted: hex(51, 65, 85), // #334155
    ink: INK,
    header: {
      style: 'stacked-tech',
      heightIn: 0.028,
      secondary: hex(103, 232, 249),
    },
    section: { style: 'full', heightIn: 0.014 },
    sectionTitleColor: 'accent',
    nameUppercase: true,
    companyColor: 'muted',
    jobLeftRail: false,
  },
  'two-page-roomy': {
    accent: hex(30, 41, 59), // #1e293b
    rule: hex(15, 23, 42), // #0f172a
    sectionRule: hex(15, 23, 42),
    muted: MUTED_DEFAULT,
    ink: INK,
    header: { style: 'full', heightIn: 0.01 },
    section: { style: 'full', heightIn: 0.01 },
    sectionTitleColor: 'ink',
    nameUppercase: false,
    companyColor: 'muted',
    jobLeftRail: false,
  },
  'quality-focus': {
    accent: hex(20, 83, 45), // #14532d
    rule: hex(22, 101, 52), // #166534
    sectionRule: hex(74, 222, 128), // #4ade80
    muted: MUTED_DEFAULT,
    ink: INK,
    header: { style: 'full', heightIn: 0.024 },
    section: { style: 'full', heightIn: 0.014 },
    sectionTitleColor: 'ink',
    nameUppercase: false,
    companyColor: 'muted',
    jobLeftRail: false,
  },
  'early-career': {
    accent: hex(55, 48, 163), // #3730a3
    rule: hex(67, 56, 202), // #4338ca
    sectionRule: hex(165, 180, 252), // #a5b4fc
    muted: hex(75, 85, 99), // #4b5563
    ink: INK,
    header: {
      style: 'short',
      heightIn: 0.028,
      shortWidthIn: 0.67, // ~4rem
    },
    section: { style: 'dashed', heightIn: 0.01 },
    sectionTitleColor: 'accent',
    nameUppercase: false,
    companyColor: 'muted',
    jobLeftRail: false,
  },
  // —— Reference pack ——
  'floor-worker': {
    accent: hex(185, 28, 28), // #b91c1c
    rule: hex(153, 27, 27), // #991b1b
    sectionRule: hex(252, 165, 165), // #fca5a5
    muted: hex(87, 83, 78),
    ink: INK,
    header: { style: 'full', heightIn: 0.032 },
    section: { style: 'full', heightIn: 0.014 },
    sectionTitleColor: 'accent',
    nameUppercase: false,
    companyColor: 'muted',
    jobLeftRail: false,
  },
  'production-lead': {
    accent: hex(234, 88, 12), // #ea580c
    rule: hex(28, 25, 23), // #1c1917
    sectionRule: hex(28, 25, 23),
    muted: hex(87, 83, 78),
    ink: INK,
    header: { style: 'full', heightIn: 0.022 },
    section: { style: 'full', heightIn: 0.018 },
    sectionTitleColor: 'ink',
    nameUppercase: true,
    companyColor: 'accent',
    jobLeftRail: false,
  },
  'mfg-associate': {
    accent: hex(30, 64, 175), // #1e40af
    rule: hex(37, 99, 235), // #2563eb
    sectionRule: hex(147, 197, 253), // #93c5fd
    muted: hex(71, 85, 105),
    ink: INK,
    header: { style: 'full', heightIn: 0.018 },
    section: { style: 'full', heightIn: 0.012 },
    sectionTitleColor: 'accent',
    nameUppercase: false,
    companyColor: 'muted',
    jobLeftRail: false,
  },
  timeline: {
    accent: hex(162, 28, 175), // #a21caf
    rule: hex(192, 38, 211), // #c026d3
    sectionRule: hex(233, 213, 255), // #e9d5ff
    muted: hex(87, 83, 78),
    ink: INK,
    header: {
      style: 'short',
      heightIn: 0.028,
      shortWidthIn: 0.42,
    },
    section: { style: 'full', heightIn: 0.008 },
    sectionTitleColor: 'accent',
    nameUppercase: false,
    companyColor: 'muted',
    jobLeftRail: true,
  },
  'engineer-entry': {
    accent: hex(109, 40, 217), // #6d28d9
    rule: hex(124, 58, 237), // #7c3aed
    sectionRule: hex(196, 181, 253), // #c4b5fd
    muted: hex(100, 116, 139),
    ink: INK,
    header: { style: 'full', heightIn: 0.008 },
    section: { style: 'full', heightIn: 0.012 },
    sectionTitleColor: 'accent',
    nameUppercase: false,
    companyColor: 'muted',
    jobLeftRail: false,
  },
  'classic-green': {
    accent: hex(22, 101, 52), // #166534
    rule: hex(21, 128, 61), // #15803d
    sectionRule: hex(34, 197, 94), // #22c55e
    muted: hex(87, 83, 78),
    ink: INK,
    header: {
      style: 'double-gap',
      heightIn: 0.014,
      secondary: hex(22, 101, 52),
    },
    section: { style: 'full', heightIn: 0.014 },
    sectionTitleColor: 'accent',
    nameUppercase: true,
    companyColor: 'muted',
    jobLeftRail: false,
  },
}

export function pdfSkinFor(templateId: TemplateId): PdfSkin {
  return SKINS[templateId] ?? SKINS['ats-classic']
}
