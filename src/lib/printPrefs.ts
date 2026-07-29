import type {
  HeaderAlign,
  NameStyle,
  PageDensity,
  PrintPrefs,
  TemplateId,
  TypeScale,
} from '../types/application'
import { getTemplate } from './templates'

/** Locked type-scale factors (applied to name + body + meta). */
export const TYPE_SCALE_FACTOR: Record<TypeScale, number> = {
  sm: 0.9,
  md: 1,
  lg: 1.08,
}

export const TYPE_SCALE_OPTIONS: { id: TypeScale; label: string; hint: string }[] =
  [
    { id: 'sm', label: 'Small', hint: 'More content per page' },
    { id: 'md', label: 'Medium', hint: 'Default letter scale' },
    { id: 'lg', label: 'Large', hint: 'Easier read, fewer lines' },
  ]

export const NAME_STYLE_OPTIONS: {
  id: NameStyle
  label: string
  hint: string
}[] = [
  { id: 'sans', label: 'Sans', hint: 'Arial / system' },
  { id: 'serif', label: 'Serif', hint: 'Georgia / Times' },
]

export const PAGE_DENSITY_OPTIONS: {
  id: PageDensity
  label: string
  hint: string
}[] = [
  { id: 'roomy', label: 'Roomy', hint: 'More air, larger margins' },
  { id: 'balanced', label: 'Balanced', hint: 'Standard letter packing' },
  { id: 'compact', label: 'Compact', hint: 'Tighter spacing' },
]

export const HEADER_ALIGN_OPTIONS: {
  id: HeaderAlign
  label: string
  hint: string
}[] = [
  {
    id: 'left',
    label: 'Left',
    hint: 'Classic scan · name on left stem',
  },
  {
    id: 'center',
    label: 'Center',
    hint: 'Symmetric name + contact · ATS-safe',
  },
]

const TYPE_SCALES = new Set<TypeScale>(['sm', 'md', 'lg'])
const NAME_STYLES = new Set<NameStyle>(['sans', 'serif'])
const PAGE_DENSITIES = new Set<PageDensity>(['roomy', 'balanced', 'compact'])
const HEADER_ALIGNS = new Set<HeaderAlign>(['left', 'center'])

/** Templates whose skin uses a serif display name by default. */
const SERIF_NAME_TEMPLATES = new Set<TemplateId>([
  'ats-classic',
  'modern-clean',
  'two-page-roomy',
  'timeline',
  'classic-green',
])

/** Templates that ship with a centered header by default. */
const CENTER_HEADER_TEMPLATES = new Set<TemplateId>(['timeline'])

export function isTypeScale(v: unknown): v is TypeScale {
  return typeof v === 'string' && TYPE_SCALES.has(v as TypeScale)
}

export function isNameStyle(v: unknown): v is NameStyle {
  return typeof v === 'string' && NAME_STYLES.has(v as NameStyle)
}

export function isPageDensity(v: unknown): v is PageDensity {
  return typeof v === 'string' && PAGE_DENSITIES.has(v as PageDensity)
}

export function isHeaderAlign(v: unknown): v is HeaderAlign {
  return typeof v === 'string' && HEADER_ALIGNS.has(v as HeaderAlign)
}

export function defaultNameStyle(templateId: TemplateId): NameStyle {
  return SERIF_NAME_TEMPLATES.has(templateId) ? 'serif' : 'sans'
}

export function defaultPageDensity(templateId: TemplateId): PageDensity {
  const d = getTemplate(templateId).density
  if (d === 'roomy') return 'roomy'
  if (d === 'compact' || d === 'dense') return 'compact'
  return 'balanced'
}

export function defaultHeaderAlign(templateId: TemplateId): HeaderAlign {
  return CENTER_HEADER_TEMPLATES.has(templateId) ? 'center' : 'left'
}

export function defaultPrintPrefs(templateId: TemplateId = 'ats-classic'): PrintPrefs {
  return {
    typeScale: 'md',
    nameStyle: defaultNameStyle(templateId),
    pageDensity: defaultPageDensity(templateId),
    headerAlign: defaultHeaderAlign(templateId),
  }
}

/**
 * Resolve locked print prefs for an application + template.
 * Missing / invalid fields fall back to template-aware defaults.
 */
export function resolvePrintPrefs(
  partial: Partial<PrintPrefs> | null | undefined,
  templateId: TemplateId,
): PrintPrefs {
  const base = defaultPrintPrefs(templateId)
  return {
    typeScale: isTypeScale(partial?.typeScale) ? partial.typeScale : base.typeScale,
    nameStyle: isNameStyle(partial?.nameStyle) ? partial.nameStyle : base.nameStyle,
    pageDensity: isPageDensity(partial?.pageDensity)
      ? partial.pageDensity
      : base.pageDensity,
    headerAlign: isHeaderAlign(partial?.headerAlign)
      ? partial.headerAlign
      : base.headerAlign,
  }
}

/** Normalize stored JSON — drop unknown keys / invalid enums. */
export function normalizePrintPrefs(
  raw: unknown,
  templateId: TemplateId,
): PrintPrefs {
  if (!raw || typeof raw !== 'object') return defaultPrintPrefs(templateId)
  return resolvePrintPrefs(raw as Partial<PrintPrefs>, templateId)
}

/** CSS class stack for .ats-resume from resolved prefs. */
export function printPrefsClassNames(prefs: PrintPrefs): string {
  return [
    `ats-scale-${prefs.typeScale}`,
    `ats-name-${prefs.nameStyle}`,
    `ats-page-${prefs.pageDensity}`,
    `ats-header-${prefs.headerAlign}`,
  ].join(' ')
}
