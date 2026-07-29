/**
 * PDF export — professional ATS letter resume (text-selectable).
 *
 * Locked SSOT: docs/PDF_ARCHITECTURE.md
 *
 * Architecture (expert audit + Path A aesthetics 2026-07-26):
 * - Download PDF = jsPDF text layout (exportPdfText) — selectable, letter structure.
 * - Path A: skin-aware draw accents (pdfSkin.ts) — header rules, section rules,
 *   filled bullet discs, ops rail, internal banner — mapped from templateId.
 * - Live paper locked to letter width (816px); zoom is transform-only.
 * - Print (browser) = full CSS skins (true WYSIWYG for any remaining CSS-only cues).
 * - html2canvas image PDFs are retired as primary (wrong tool for ATS resumes).
 * - Path B (optional dual “Visual PDF”) not shipped — Path A is the single Download path.
 */
import type { ResolvedResume } from './resolveResume'
import { downloadTextAtsPdf } from './exportPdfText'

export type PdfExportResult = {
  /** Always text layout for Download PDF (skin-aware accents drawn) */
  mode: 'text'
  filename: string
  pageCount?: number
}

function fileSlug(view: ResolvedResume): string {
  const base =
    view.label.trim() ||
    view.contact.name.trim() ||
    [view.targetTitle, view.targetCompany].filter(Boolean).join(' ')
  return (
    base
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'resume'
  )
}

/**
 * Download a US Letter ATS PDF (selectable text + skin-aware accents).
 * Matches preview structure and primary skin aesthetics (Path A).
 */
export async function downloadAtsPdf(
  view: ResolvedResume,
): Promise<PdfExportResult> {
  const { jsPDF } = await import('jspdf')
  const filename = `${fileSlug(view)}-${view.templateId}.pdf`
  downloadTextAtsPdf(view, jsPDF, filename)
  return { mode: 'text', filename }
}

/**
 * Optional operator banner after export.
 * Text + skin draw is intentional (not a fallback) — no warning banner.
 */
export function pdfResultMessage(_result: PdfExportResult): string | null {
  return null
}
