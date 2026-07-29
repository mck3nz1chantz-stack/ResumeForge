# ResumeForge — PDF / preview architecture (locked)

**Status:** locked · **Date:** 2026-07-26 · **Deploy ref:** Path A live (`7ce3bac7`+)

This is the single decision record for export and live paper. Read before changing PDF, skins, or preview geometry.

## One sentence

**Download PDF = selectable letter text + drawn skin accents. Print = full CSS. Live paper = 816px letter; zoom = scale only. Never make html2canvas the silent Download primary.**

## Locked decisions

| Surface | Choice | Why |
|---------|--------|-----|
| Live paper width | **816px** (`.ats-letter-paper`) | Same line wraps as letter; zoom does not reflow |
| Live zoom | **`transform: scale` only** | Fit / 90 / 100 must not change wraps |
| **Download PDF** | **jsPDF text** + **Path A skin draw** | Selectable, ATS-friendly, skin rules/bullets |
| Skin accents in PDF | Header rules, section rules, filled bullet discs, ops rail, internal banner | Match preview without screenshots |
| **Print** | Browser CSS (`.ats-skin-*`) | Exact gradients / bands / full WYSIWYG |
| html2canvas as Download primary | **RETIRED** | Soft type, dual geometry, not ATS text |
| Path B “Visual PDF” dual CTA | **Not shipped** | Only if Path A is still insufficient; never silent default |
| Column model | **Single-column** ATS default | Multi-column is out of product |

## Code map (touch these, not parallel apps)

| File | Role |
|------|------|
| `src/lib/exportPdf.ts` | Thin Download entry → text path only |
| `src/lib/exportPdfText.ts` | Letter layout + Path A draw helpers |
| `src/lib/pdfSkin.ts` | `templateId` → RGB / rule styles (PDF tokens) |
| `src/index.css` | `.ats-skin-*` CSS tokens (preview + Print) |
| `src/components/ResumeDocument.tsx` | Paper HTML + `templateSkin()` |
| `src/components/LivePreviewPane.tsx` | 816 paper + scale zoom |
| `src/lib/printPrefs.ts` | typeScale / nameStyle / pageDensity (CSS + PDF) |
| `src/lib/mountResumeExport.tsx` | Legacy capture mount — **not** Download primary |

## Change discipline

1. **Skin color change** — edit CSS `--ats-accent` / `--ats-rule` (etc.) **and** mirror RGB in `pdfSkin.ts` in the same change.
2. **New template** — add CSS skin **and** a full `pdfSkin` entry (`Record<TemplateId, PdfSkin>` enforces completeness).
3. **Layout / spacing** — prefer shared density tokens already aligned to CSS; re-smoke letter margins and title\|dates.
4. **Do not** invent a second Download engine or put app code under `$LAUNCHER`.

## 60-second smoke (after any PDF or skin change)

1. **ATS Classic** — navy double header, navy section rules, navy discs  
2. **Modern Clean** — short accent bar, accent H2, gradient section rule, blue discs  
3. **Internal** — amber header, cream banner, orange section rules, accent discs  
4. Title left \| dates right — **no overlap**  
5. PDF text is **selectable**

## Explicit non-goals

- Screenshot-as-primary Download  
- Fluid reflow of live paper for “fit” (breaks letter lock)  
- Multi-column layouts  
- Invented metrics in copy/scaffolds  
- Freeform font sizes outside `printPrefs` dials  

## History / audit

- Expert dual-geometry audit: `docs/drafts/debug-report-preview-pdf.md`  
- Path A shipped after operator feedback: structure OK, monochrome PDF not acceptable  

## Deploy

Gate: `approved - deploy` (see `$LAUNCHER/PERMISSIONS.md` § Cloudflare/Wrangler).  
Command: `npm run deploy:pages` from app project only.
