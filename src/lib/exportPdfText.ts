/**
 * Primary ATS letter PDF — text-selectable, professional single-column resume.
 *
 * Path A (2026-07-26): skin-aware jsPDF draw accents (header rules, section
 * underlines, filled bullet discs, ops rail, internal banner) from pdfSkin.ts
 * while keeping selectable text and letter margins. No html2canvas primary.
 *
 * Layout targets CSS balanced/md tokens (preview paper). No invented metrics.
 */
import type { jsPDF } from 'jspdf'
import type { NameStyle, PageDensity, PrintPrefs } from '../types/application'
import { contactEmailsLabeled, contactHeaderBits } from './contactLines'
import type { ResolvedResume, SectionId } from './resolveResume'
import { formatDateRange } from './formatDates'
import { TYPE_SCALE_FACTOR } from './printPrefs'
import { pdfSkinFor, type PdfSkin, type Rgb } from './pdfSkin'

type Layout = {
  marginX: number
  marginY: number
  nameSize: number
  nameLine: number
  bodySize: number
  bodyLine: number
  metaSize: number
  metaLine: number
  sectionSize: number
  sectionLine: number
  sectionGap: number
  jobGap: number
  titleSize: number
  titleLine: number
  companySize: number
  companyLine: number
  gutter: number
  bulletIndent: number
}

/** Aligned to CSS .ats-page-* + .ats-scale-md tokens (inches). */
const DENSITY_BASE: Record<PageDensity, Layout> = {
  roomy: {
    marginX: 0.75,
    marginY: 0.72,
    nameSize: 16.5,
    nameLine: 0.3,
    bodySize: 10.5,
    bodyLine: 0.195,
    metaSize: 9.5,
    metaLine: 0.175,
    sectionSize: 10.5,
    sectionLine: 0.18,
    sectionGap: 0.14,
    jobGap: 0.12,
    titleSize: 11.25,
    titleLine: 0.19,
    companySize: 10.25,
    companyLine: 0.17,
    gutter: 0.16,
    bulletIndent: 0.18,
  },
  balanced: {
    marginX: 0.7,
    marginY: 0.65,
    nameSize: 16.5,
    nameLine: 0.28,
    bodySize: 10.25,
    bodyLine: 0.19,
    metaSize: 9.25,
    metaLine: 0.17,
    sectionSize: 10.25,
    sectionLine: 0.175,
    sectionGap: 0.12,
    jobGap: 0.1,
    titleSize: 11,
    titleLine: 0.185,
    companySize: 10,
    companyLine: 0.165,
    gutter: 0.15,
    bulletIndent: 0.18,
  },
  compact: {
    marginX: 0.58,
    marginY: 0.55,
    nameSize: 15,
    nameLine: 0.25,
    bodySize: 9.75,
    bodyLine: 0.165,
    metaSize: 8.75,
    metaLine: 0.145,
    sectionSize: 9.75,
    sectionLine: 0.16,
    sectionGap: 0.09,
    jobGap: 0.08,
    titleSize: 10.5,
    titleLine: 0.17,
    companySize: 9.5,
    companyLine: 0.15,
    gutter: 0.12,
    bulletIndent: 0.16,
  },
}

function layoutForPrefs(prefs: PrintPrefs): Layout {
  const base = DENSITY_BASE[prefs.pageDensity] ?? DENSITY_BASE.balanced
  const f = TYPE_SCALE_FACTOR[prefs.typeScale] ?? 1
  const s = (n: number) => Math.round(n * f * 100) / 100
  return {
    marginX: base.marginX,
    marginY: base.marginY,
    nameSize: Math.min(18, Math.max(13, s(base.nameSize))),
    nameLine: s(base.nameLine),
    bodySize: s(base.bodySize),
    bodyLine: s(base.bodyLine),
    metaSize: s(base.metaSize),
    metaLine: s(base.metaLine),
    sectionSize: s(base.sectionSize),
    sectionLine: s(base.sectionLine),
    sectionGap: s(base.sectionGap),
    jobGap: s(base.jobGap),
    titleSize: s(base.titleSize),
    titleLine: s(base.titleLine),
    companySize: s(base.companySize),
    companyLine: s(base.companyLine),
    gutter: base.gutter,
    bulletIndent: base.bulletIndent,
  }
}

function nameFont(style: NameStyle): 'helvetica' | 'times' {
  return style === 'serif' ? 'times' : 'helvetica'
}

type DocState = {
  doc: jsPDF
  y: number
  marginX: number
  marginY: number
  contentW: number
  pageH: number
  bodyFont: 'helvetica'
  nameFont: 'helvetica' | 'times'
  skin: PdfSkin
  /** Name + contact block only */
  headerAlign: 'left' | 'center'
}

/** pt → approximate ascent in inches for baseline placement */
function ascentIn(fontSizePt: number): number {
  return (fontSizePt / 72) * 0.8
}

function ensureSpace(state: DocState, needIn: number): void {
  if (state.y + needIn > state.pageH - state.marginY) {
    state.doc.addPage()
    state.y = state.marginY + 0.02
  }
}

function wrapText(
  doc: jsPDF,
  text: string,
  fontSize: number,
  maxW: number,
): string[] {
  doc.setFontSize(fontSize)
  return doc.splitTextToSize(text, maxW) as string[]
}

function textWidth(
  doc: jsPDF,
  text: string,
  fontSize: number,
  font: 'helvetica' | 'times',
  bold: boolean,
): number {
  doc.setFont(font, bold ? 'bold' : 'normal')
  doc.setFontSize(fontSize)
  return doc.getTextWidth(text)
}

function writeLines(
  state: DocState,
  lines: string[],
  fontSize: number,
  lineH: number,
  opts?: {
    bold?: boolean
    color?: Rgb | [number, number, number]
    font?: 'helvetica' | 'times'
    x?: number
    /** jsPDF text align — use center x = margin + contentW/2 */
    align?: 'left' | 'center' | 'right'
  },
): void {
  const { doc } = state
  const font = opts?.font ?? state.bodyFont
  const align = opts?.align ?? 'left'
  const x =
    opts?.x ??
    (align === 'center'
      ? state.marginX + state.contentW / 2
      : align === 'right'
        ? state.marginX + state.contentW
        : state.marginX)
  doc.setFont(font, opts?.bold ? 'bold' : 'normal')
  doc.setFontSize(fontSize)
  if (opts?.color) {
    const c = opts.color
    doc.setTextColor(c[0], c[1], c[2])
  } else {
    const c = state.skin.ink
    doc.setTextColor(c[0], c[1], c[2])
  }

  for (const line of lines) {
    ensureSpace(state, lineH)
    // y is top of line box; draw at baseline
    const baseline = state.y + ascentIn(fontSize)
    if (align === 'left') doc.text(line, x, baseline)
    else doc.text(line, x, baseline, { align })
    state.y += lineH
  }
}

/** Solid horizontal bar (filled rect) — clearer than hairline for print. */
function fillBar(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  color: Rgb,
): void {
  doc.setFillColor(color[0], color[1], color[2])
  doc.rect(x, y, w, h, 'F')
}

/**
 * Header rule under name — mirrors .ats-header-rule per skin.
 * Advances state.y past the rule + gap.
 */
function drawHeaderRule(state: DocState): void {
  const { doc, skin, marginX, contentW, headerAlign } = state
  const { header } = skin
  const gapAfter = 0.1
  let y = state.y + 0.04
  const barX = (w: number) =>
    headerAlign === 'center' ? marginX + (contentW - w) / 2 : marginX

  switch (header.style) {
    case 'short': {
      const w = header.shortWidthIn ?? 0.55
      fillBar(doc, barX(w), y, w, header.heightIn, skin.accent)
      state.y = y + header.heightIn + gapAfter
      break
    }
    case 'double': {
      // Classic: thick navy + thin slate below (full width either align)
      fillBar(doc, marginX, y, contentW, header.heightIn, skin.rule)
      const y2 = y + header.heightIn + 0.012
      fillBar(
        doc,
        marginX,
        y2,
        contentW,
        0.01,
        header.secondary ?? skin.rule,
      )
      state.y = y2 + 0.01 + gapAfter
      break
    }
    case 'double-gap': {
      // Executive: thin — gap — thin
      fillBar(doc, marginX, y, contentW, header.heightIn, skin.rule)
      const y2 = y + header.heightIn + 0.035
      fillBar(doc, marginX, y2, contentW, header.heightIn, skin.rule)
      state.y = y2 + header.heightIn + gapAfter
      break
    }
    case 'stacked-ops': {
      fillBar(doc, marginX, y, contentW, header.heightIn, skin.accent)
      const y2 = y + header.heightIn + 0.01
      fillBar(
        doc,
        marginX,
        y2,
        contentW,
        0.012,
        header.secondary ?? skin.accent,
      )
      state.y = y2 + 0.012 + gapAfter
      break
    }
    case 'stacked-tech': {
      fillBar(doc, marginX, y, contentW, 0.02, skin.accent)
      const y2 = y + 0.02
      fillBar(
        doc,
        marginX,
        y2,
        contentW,
        0.02,
        header.secondary ?? skin.accent,
      )
      state.y = y2 + 0.02 + gapAfter
      break
    }
    case 'full':
    default: {
      fillBar(doc, marginX, y, contentW, header.heightIn, skin.rule)
      state.y = y + header.heightIn + gapAfter
      break
    }
  }
}

/**
 * Section underline under H2 — mirrors .ats-section-rule per skin.
 */
function drawSectionRule(state: DocState): void {
  const { doc, skin, marginX, contentW } = state
  const { section } = skin
  const y = state.y + 0.04
  const h = section.heightIn

  switch (section.style) {
    case 'gradient': {
      // Approximate CSS linear-gradient(accent → slate) with 3 segments
      const slate: Rgb = [203, 213, 225] // #cbd5e1
      const mid: Rgb = [
        Math.round((skin.accent[0] + slate[0]) / 2),
        Math.round((skin.accent[1] + slate[1]) / 2),
        Math.round((skin.accent[2] + slate[2]) / 2),
      ]
      const w1 = contentW * 0.35
      const w2 = contentW * 0.35
      const w3 = contentW - w1 - w2
      fillBar(doc, marginX, y, w1, h, skin.accent)
      fillBar(doc, marginX + w1, y, w2, h, mid)
      fillBar(doc, marginX + w1 + w2, y, w3, h, slate)
      break
    }
    case 'dashed': {
      // Early-career: repeating dashes
      const dash = 0.08
      const gap = 0.05
      let x = marginX
      const end = marginX + contentW
      while (x < end) {
        const w = Math.min(dash, end - x)
        fillBar(doc, x, y, w, h, skin.sectionRule)
        x += dash + gap
      }
      break
    }
    case 'full':
    default: {
      fillBar(doc, marginX, y, contentW, h, skin.sectionRule)
      break
    }
  }

  state.y = y + h + 0.08
}

function sectionHeader(state: DocState, title: string, layout: Layout): void {
  ensureSpace(state, layout.sectionLine + layout.sectionGap + 0.14)
  state.y += layout.sectionGap

  const titleColor: Rgb =
    state.skin.sectionTitleColor === 'accent'
      ? state.skin.accent
      : state.skin.ink

  const baseline = state.y + ascentIn(layout.sectionSize)
  state.doc.setFont(state.bodyFont, 'bold')
  state.doc.setFontSize(layout.sectionSize)
  state.doc.setTextColor(titleColor[0], titleColor[1], titleColor[2])
  state.doc.text(title.toUpperCase(), state.marginX, baseline)
  state.y += layout.sectionLine

  drawSectionRule(state)
}

/**
 * Title left + dates right on one baseline; never overlap.
 * Location/department go under company (HTML meta split).
 */
function writeJobHead(
  state: DocState,
  layout: Layout,
  title: string,
  company: string,
  dates: string,
  locationDept: string,
  opts?: { textX?: number; contentW?: number },
): void {
  const doc = state.doc
  const xL = opts?.textX ?? state.marginX
  const contentW = opts?.contentW ?? state.contentW
  const xR = xL + contentW
  const gutter = layout.gutter
  const companyRgb: Rgb =
    state.skin.companyColor === 'accent'
      ? state.skin.accent
      : ([55, 55, 55] as const)

  if (title || dates) {
    const rightW = dates
      ? textWidth(doc, dates, layout.metaSize, state.bodyFont, false)
      : 0
    let leftMax = contentW
    if (dates && rightW > 0) {
      leftMax = Math.max(contentW * 0.45, contentW - rightW - gutter)
    }

    // If dates rail is absurdly wide, stack
    if (dates && rightW > contentW * 0.42) {
      if (title) {
        writeLines(
          state,
          wrapText(doc, title, layout.titleSize, contentW),
          layout.titleSize,
          layout.titleLine,
          { bold: true, x: xL },
        )
      }
      writeLines(state, [dates], layout.metaSize, layout.metaLine, {
        color: state.skin.muted,
        x: xL,
      })
    } else {
      const titleLines = title
        ? wrapText(doc, title, layout.titleSize, leftMax)
        : ['']
      ensureSpace(state, layout.titleLine * Math.max(1, titleLines.length))

      // Line 0: title + dates
      const baseline = state.y + ascentIn(layout.titleSize)
      if (titleLines[0]) {
        doc.setFont(state.bodyFont, 'bold')
        doc.setFontSize(layout.titleSize)
        doc.setTextColor(state.skin.ink[0], state.skin.ink[1], state.skin.ink[2])
        doc.text(titleLines[0], xL, baseline)
      }
      if (dates) {
        doc.setFont(state.bodyFont, 'normal')
        doc.setFontSize(layout.metaSize)
        doc.setTextColor(
          state.skin.muted[0],
          state.skin.muted[1],
          state.skin.muted[2],
        )
        doc.text(dates, xR, baseline, { align: 'right' })
      }
      state.y += layout.titleLine

      for (let i = 1; i < titleLines.length; i++) {
        ensureSpace(state, layout.titleLine)
        const b = state.y + ascentIn(layout.titleSize)
        doc.setFont(state.bodyFont, 'bold')
        doc.setFontSize(layout.titleSize)
        doc.setTextColor(state.skin.ink[0], state.skin.ink[1], state.skin.ink[2])
        doc.text(titleLines[i]!, xL, b)
        state.y += layout.titleLine
      }
    }
  }

  if (company) {
    writeLines(
      state,
      wrapText(doc, company, layout.companySize, contentW),
      layout.companySize,
      layout.companyLine,
      { bold: false, color: companyRgb, x: xL },
    )
  }

  if (locationDept) {
    writeLines(
      state,
      wrapText(doc, locationDept, layout.metaSize, contentW),
      layout.metaSize,
      layout.metaLine,
      { color: state.skin.muted, x: xL },
    )
  }
}

function writeBullets(
  state: DocState,
  layout: Layout,
  items: string[],
  opts?: { textX?: number; contentW?: number },
): void {
  const doc = state.doc
  const indent = layout.bulletIndent
  const x0 = opts?.textX ?? state.marginX
  const maxW = (opts?.contentW ?? state.contentW) - indent - 0.05
  const discR = 0.028 // ~2pt filled circle (matches CSS disc marker)

  for (const raw of items) {
    const t = raw.trim()
    if (!t) continue
    const lines = wrapText(doc, t, layout.bodySize, maxW)
    // Keep bullet block together when possible
    ensureSpace(state, layout.bodyLine * Math.min(lines.length, 3))

    for (let i = 0; i < lines.length; i++) {
      ensureSpace(state, layout.bodyLine)
      const baseline = state.y + ascentIn(layout.bodySize)
      doc.setFont(state.bodyFont, 'normal')
      doc.setFontSize(layout.bodySize)
      doc.setTextColor(state.skin.ink[0], state.skin.ink[1], state.skin.ink[2])
      if (i === 0) {
        // Filled disc in accent (CSS ::marker color: var(--ats-accent))
        const cy = baseline - ascentIn(layout.bodySize) * 0.35
        const a = state.skin.accent
        doc.setFillColor(a[0], a[1], a[2])
        doc.circle(x0 + discR + 0.01, cy, discR, 'F')
      }
      doc.text(lines[i]!, x0 + indent, baseline)
      state.y += layout.bodyLine
    }
  }
}

function writeSummary(
  state: DocState,
  view: ResolvedResume,
  layout: Layout,
  doc: jsPDF,
  contentW: number,
) {
  if (!view.summary.trim()) return
  sectionHeader(state, 'Professional Summary', layout)
  writeLines(
    state,
    wrapText(doc, view.summary.trim(), layout.bodySize, contentW),
    layout.bodySize,
    layout.bodyLine,
  )
}

function writeSkills(
  state: DocState,
  view: ResolvedResume,
  layout: Layout,
  doc: jsPDF,
  contentW: number,
) {
  const { skills } = view
  const skillBlocks: string[] = []
  const skillLabels: Record<'hard' | 'tools' | 'soft', string> = {
    hard: 'Hard skills',
    tools: 'Tools',
    soft: 'Leadership / soft',
  }
  for (const cat of view.skillCategoryOrder ?? ['hard', 'tools', 'soft']) {
    const list = skills[cat]
    if (list.length) skillBlocks.push(`${skillLabels[cat]}: ${list.join(', ')}`)
  }
  if (!skillBlocks.length) return
  sectionHeader(state, 'Skills', layout)
  for (const block of skillBlocks) {
    writeLines(
      state,
      wrapText(doc, block, layout.bodySize, contentW),
      layout.bodySize,
      layout.bodyLine,
    )
  }
}

function writeExperience(
  state: DocState,
  view: ResolvedResume,
  layout: Layout,
  _doc: jsPDF,
  _contentW: number,
) {
  if (!view.jobs.length) return
  sectionHeader(state, 'Experience', layout)

  const rail = state.skin.jobLeftRail
  const railW = 0.028
  const railPad = 0.08
  const jobTextX = rail ? state.marginX + railW + railPad : state.marginX
  const jobContentW = rail
    ? state.contentW - railW - railPad
    : state.contentW

  for (const job of view.jobs) {
    ensureSpace(state, layout.titleLine * 3 + layout.bodyLine)

    const pageAtStart = state.doc.getNumberOfPages()
    const jobStartY = state.y
    const title = job.title.trim()
    const company = job.company.trim()
    const dates = formatDateRange(job.start, job.end)
    const locationDept = [job.location.trim(), (job.department ?? '').trim()]
      .filter(Boolean)
      .join('  ·  ')

    writeJobHead(state, layout, title, company, dates, locationDept, {
      textX: jobTextX,
      contentW: jobContentW,
    })

    if (view.showInternalBanner && job.isCurrentEmployer) {
      writeLines(state, ['Current employer'], layout.metaSize, layout.metaLine, {
        color: state.skin.muted,
        x: jobTextX,
      })
    }

    if (job.tools.length) {
      writeLines(
        state,
        wrapText(
          state.doc,
          `Tools: ${job.tools.join(', ')}`,
          layout.metaSize,
          jobContentW,
        ),
        layout.metaSize,
        layout.metaLine,
        { color: [55, 55, 55], x: jobTextX },
      )
    }

    const bullets: string[] = []
    for (const b of job.bullets) {
      if (b.trim()) bullets.push(b.trim())
    }
    for (const m of job.metrics) {
      if (!m.label.trim() && !m.value.trim()) continue
      const unit = m.unit?.trim() ? ` ${m.unit.trim()}` : ''
      const ctx = m.context?.trim() ? ` (${m.context.trim()})` : ''
      bullets.push(`${m.label.trim()}: ${m.value.trim()}${unit}${ctx}`.trim())
    }
    writeBullets(state, layout, bullets, {
      textX: jobTextX,
      contentW: jobContentW,
    })

    // Ops left rail — only when job stayed on one page (avoids cross-page artifacts)
    if (rail && state.doc.getNumberOfPages() === pageAtStart) {
      const railH = Math.max(0.08, state.y - jobStartY - 0.02)
      // Soft mix of accent + stone (CSS color-mix ~55%)
      const railColor: Rgb = [
        Math.round(state.skin.accent[0] * 0.55 + 231 * 0.45),
        Math.round(state.skin.accent[1] * 0.55 + 229 * 0.45),
        Math.round(state.skin.accent[2] * 0.55 + 228 * 0.45),
      ]
      fillBar(state.doc, state.marginX, jobStartY, railW, railH, railColor)
    }

    state.y += layout.jobGap
  }
}

function writeListSection(
  state: DocState,
  layout: Layout,
  title: string,
  items: string[],
) {
  if (!items.length) return
  sectionHeader(state, title, layout)
  writeBullets(state, layout, items)
}

const SECTION_WRITERS: Record<
  SectionId,
  (
    state: DocState,
    view: ResolvedResume,
    layout: Layout,
    doc: jsPDF,
    contentW: number,
  ) => void
> = {
  summary: writeSummary,
  skills: writeSkills,
  experience: writeExperience,
  certs: (state, view, layout) => {
    const items = view.certs
      .map((c) =>
        [c.name.trim(), c.issuer?.trim(), c.year?.trim()]
          .filter(Boolean)
          .join(' — '),
      )
      .filter(Boolean)
    writeListSection(state, layout, 'Certifications', items)
  },
  education: (state, view, layout) => {
    const items = view.education
      .map((ed) =>
        [ed.credential.trim(), ed.school.trim(), ed.year?.trim()]
          .filter(Boolean)
          .join(' — '),
      )
      .filter(Boolean)
    writeListSection(state, layout, 'Education', items)
  },
}

/**
 * Professional text-selectable US Letter resume PDF.
 * Skin accents drawn from templateId (Path A) — selectable text preserved.
 */
export function downloadTextAtsPdf(
  view: ResolvedResume,
  jsPDF: typeof import('jspdf').jsPDF,
  filename: string,
): void {
  const prefs = view.printPrefs
  const layout = layoutForPrefs(prefs)
  const skin = pdfSkinFor(view.templateId)
  const pageW = 8.5
  const pageH = 11
  const contentW = pageW - layout.marginX * 2
  const doc = new jsPDF({ unit: 'in', format: 'letter' })

  const headerAlign = prefs.headerAlign === 'center' ? 'center' : 'left'

  // Start below top margin so glyphs sit inside padding (not into the edge)
  const state: DocState = {
    doc,
    y: layout.marginY + 0.02,
    marginX: layout.marginX,
    marginY: layout.marginY,
    contentW,
    pageH,
    bodyFont: 'helvetica',
    nameFont: nameFont(prefs.nameStyle),
    skin,
    headerAlign,
  }

  const { contact } = view
  let name = contact.name.trim() || 'Name'
  if (skin.nameUppercase) name = name.toUpperCase()

  writeLines(state, [name], layout.nameSize, layout.nameLine, {
    bold: true,
    font: state.nameFont,
    align: headerAlign,
  })

  // Target title under name (matches live paper when not internal banner)
  if (view.targetTitle?.trim() && !view.showInternalBanner) {
    writeLines(
      state,
      [view.targetTitle.trim()],
      layout.metaSize + 0.5,
      layout.metaLine,
      {
        bold: true,
        color: skin.accent,
        align: headerAlign,
      },
    )
  }

  // Header rule (skin-colored)
  drawHeaderRule(state)

  if (
    view.showInternalBanner &&
    (view.targetTitle || view.targetCompany || view.currentTitle)
  ) {
    const parts = ['Internal application']
    if (view.currentTitle) parts.push(`From: ${view.currentTitle}`)
    if (view.targetTitle || view.targetCompany) {
      parts.push(
        `Target: ${[view.targetTitle, view.targetCompany].filter(Boolean).join(' — ')}`,
      )
    }
    const bannerText = parts.join(' · ')
    const bannerLines = wrapText(doc, bannerText, layout.metaSize, contentW)
    const bandH =
      layout.metaLine * bannerLines.length + 0.08
    ensureSpace(state, bandH + 0.04)

    if (skin.bannerBand && skin.bannerBorder) {
      fillBar(
        doc,
        state.marginX,
        state.y,
        contentW,
        bandH,
        skin.bannerBand,
      )
      fillBar(
        doc,
        state.marginX,
        state.y,
        0.04,
        bandH,
        skin.bannerBorder,
      )
    }

    state.y += 0.04
    if (headerAlign === 'center') {
      writeLines(state, bannerLines, layout.metaSize, layout.metaLine, {
        bold: true,
        color: skin.accent,
        align: 'center',
      })
    } else {
      const textX = skin.bannerBorder
        ? state.marginX + 0.1
        : state.marginX
      writeLines(state, bannerLines, layout.metaSize, layout.metaLine, {
        bold: true,
        color: skin.accent,
        x: textX,
      })
    }
    state.y += 0.04
  }

  const emailInclude = {
    professional: view.includeProfessionalEmail,
    internal: view.includeInternalEmail,
  }
  const labeledEmails = contactEmailsLabeled(contact, view.mode, emailInclude)
  const bothEmailsPrinted = labeledEmails.length >= 2
  if (bothEmailsPrinted) {
    const base = [
      (contact.location ?? '').trim(),
      (contact.phone ?? '').trim(),
      (contact.linkedin ?? '').trim(),
      (contact.portfolio ?? '').trim(),
    ]
      .filter(Boolean)
      .join('  ·  ')
    if (base) {
      writeLines(
        state,
        wrapText(doc, base, layout.metaSize, contentW),
        layout.metaSize,
        layout.metaLine,
        { color: skin.muted, align: headerAlign },
      )
    }
    const emails = labeledEmails.join('  ·  ')
    writeLines(
      state,
      wrapText(doc, emails, layout.metaSize, contentW),
      layout.metaSize,
      layout.metaLine,
      { color: skin.muted, align: headerAlign },
    )
  } else {
    const contactLine = contactHeaderBits(
      contact,
      view.mode,
      emailInclude,
    ).join('  ·  ')
    if (contactLine) {
      writeLines(
        state,
        wrapText(doc, contactLine, layout.metaSize, contentW),
        layout.metaSize,
        layout.metaLine,
        { color: skin.muted, align: headerAlign },
      )
    }
  }
  state.y += 0.1

  for (const sid of view.sectionOrder) {
    SECTION_WRITERS[sid](state, view, layout, doc, contentW)
  }

  doc.save(filename)
}
