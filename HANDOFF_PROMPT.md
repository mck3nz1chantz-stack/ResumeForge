# ResumeForge — new chat handoff

Copy everything below the line into a **new** Grok / GrokBuild chat.

---

```
ResumeForge

Continue first-party product ResumeForge (ChantzMedia operator resume builder).

## Activate
1. Load skill `ResumeForge` → $LAUNCHER/skills/resume-forge/SKILL.md (or ~/.grok/skills/resume-forge/)
2. Read $LAUNCHER/products/resume-forge/STATUS.md then plan/PHASES.md (context only)
3. App code ONLY under ~/Desktop/ChantzMediaProjects/ResumeForge
4. Program SSOT: $LAUNCHER/products/resume-forge/
5. Read HANDOFF_STATE.json in the app project for openIssues (authoritative for this chat)

## Optional specialist desks (use when helpful — do not invent parallel apps)
- **debug-desk** / DebugPass — only if export regresses
- **final-polish** Visual Craft — token polish if skin colors need tweaking
- **Do not** re-scaffold; do not put code under $LAUNCHER

## What it is
Local-first + Cloudflare Pages resume builder: master profile → applications → live ATS resume.
**Leverage** = offline target-first path (you write language; app formats). Structure & length guides.
Manufacturing-first packs. Mobile PWA. Full backup JSON (profile + apps).
Data: localStorage per device — Export/Import (no cloud sync).

## Live / deploy
- Live: https://resumeforge-81d.pages.dev/
- Last deploy hash: **7ce3bac7** (Path A skin-aware Download PDF)
- Preview: https://7ce3bac7.resumeforge-81d.pages.dev
- Deploy: cd ~/Desktop/ChantzMediaProjects/ResumeForge && npm run deploy:pages
- Project: resumeforge
- Gate: APPROVED — preview deploy | approved - deploy
- SSOT: $LAUNCHER/PERMISSIONS.md § Cloudflare/Wrangler

## Local
- npm run dev → http://127.0.0.1:5181/
- Open ResumeForge.command

## Stack
Vite + React 19 + TS + Tailwind 4 + jsPDF. No backend.
(html2canvas still a transitive dep of jspdf — not used as Download primary)

## Shipped (do not re-scaffold)
### Phases 0–7 + live slices + polish/leverage/UX
Profile, applications, JD tailor, packs, internal promo, achievements, polish accept/reject,
cover letter, dual-pane live build, SectionCoach, tone suggest, PWA/mobile,
ExampleTip, 3-C, full backup, LeverageWizard, SectionGuide, TagInput, RoleMemories,
BuildContinueBar, 12 templates, visual skins (CSS), printPrefs, eye-path coach, scan mode.

### PDF / preview architecture (locked)
**SSOT:** `docs/PDF_ARCHITECTURE.md` — read before any export/preview change.

| Decision | Choice |
|----------|--------|
| Live paper width | **816px** (`.ats-letter-paper`) — zoom = transform only, no reflow |
| **Download PDF** | **jsPDF text + Path A skin draw** (`exportPdf.ts` → `exportPdfText.ts` + `pdfSkin.ts`) |
| Skin accents in PDF | Header rules, section rules, filled bullet discs, ops rail, internal banner |
| **Print** | Full browser CSS (gradients / bands exact WYSIWYG) |
| html2canvas as Download primary | **RETIRED** |
| Path B dual Visual PDF CTA | **Not shipped** — only if Path A still insufficient |

### Product principles (locked)
- **3-C = Clarity · Conciseness · Consistency** (NOT “Compelling”)
- Never invent metrics; scaffolds use [brackets] only
- ATS single-column default
- Operator writes language; app guides structure + format
- App code never under $LAUNCHER

## Operator status
- Path A **live** (7ce3bac7). Compare live paper @ 100% vs Download for Classic / Modern / Internal.
- Token tweaks only in `pdfSkin.ts` if a color is off.

## THIS CHAT’S PRIMARY REQUEST (start here)

1. Read HANDOFF_STATE.json openIssues
2. Operator feedback on Download aesthetics → tweak `pdfSkin.ts` only (minimal)
3. Deploy only after: `approved - deploy`
4. Do not re-litigate letter-locked preview or text-primary architecture
5. Do not bring html2canvas back as silent primary

## Key paths
- **docs/PDF_ARCHITECTURE.md** — locked export/preview decisions (read first)
- src/lib/pdfSkin.ts — **templateId → RGB / rule styles**
- src/lib/exportPdfText.ts — primary PDF layout + skin draw
- src/lib/exportPdf.ts — thin entry
- src/components/ResumeDocument.tsx — paper HTML + skins
- src/index.css — .ats-skin-* (source of truth for CSS; keep pdfSkin in sync)
- docs/drafts/debug-report-preview-pdf.md — audit history
- HANDOFF_STATE.json — openIssues

## Rules
- Never put app code under $LAUNCHER
- Never invent metrics
- Prefer minimal focused fixes over big refactors
```
