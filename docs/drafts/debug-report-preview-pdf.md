# Debug Desk Report — ResumeForge preview ↔ PDF (architecture fix)

**Mode:** audit + bounded fix (expert panel)  
**Date:** 2026-07-26  
**Build / lint:** green · 0 oxlint issues  

## Root cause (not a CSS typo)

Download PDF was a **screenshot** (html2canvas) of a **second** letter sheet, while live preview often **reflowed** at fluid column width. Shared component ≠ shared geometry ≠ selectable text.

| Path | Reality |
|------|---------|
| Live / Layouts | Fluid or scaled paper |
| html2canvas PDF | Image of forced 816px remount — soft type, no ATS text |
| Text fallback | Different layout engine when capture failed |

## Expert fix (shipped this pass)

### 1. One letter layout width everywhere
- Preview paper locked to **`.ats-letter-paper` = 816px**
- Live zoom (Fit / 90 / 100) = **`transform: scale` only** — never reflow line wraps

### 2. Download PDF = professional **text** letter (primary)
- `exportPdf.ts` → `downloadTextAtsPdf` only
- Selectable text, ATS-friendly, deterministic
- Title left + **dates right** with measured width (no overlap)
- Location/dept under company
- Line boxes aligned to CSS balanced/md tokens
- Section order, skills labels, printPrefs respected

### 3. Print = exact skins
- Browser print still uses CSS skins / colors

### 4. Retired html2canvas as primary
- Image PDF path removed from Download (wrong tool for ATS product)

### 5. Path A — skin-aware draw (follow-up 2026-07-26)
- **Choice:** Path A only (not Path B dual visual capture, not UX-only labels)
- `pdfSkin.ts` maps `templateId` → RGB + rule styles from `.ats-skin-*`
- `exportPdfText.ts` draws: colored header rules (full/short/double/stacked), section underlines (full/gradient/dashed), filled accent bullet discs, ops left rail, internal banner band
- Text remains selectable; letter geometry unchanged
- CSS-only bands (skills/certs background fills) stay Print-primary; not drawn in text PDF
- **Locked SSOT:** `docs/PDF_ARCHITECTURE.md` (promoted out of drafts)

## Manual verify

1. Live pane at Fit and 100% — line wraps should stay the same (only size changes)  
2. Download PDF — full letter margins, title|dates no collision, clean sections  
3. Download vs live (100%): **ATS Classic**, **Modern Clean**, **Internal** — rules + bullet color  
4. Print — full CSS skins match screen  

## Deploy

Await `approved - deploy`.
