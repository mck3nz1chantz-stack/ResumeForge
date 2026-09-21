# ResumeForge GuiPass + streamline spec

**Date:** 2026-09-21  
**Mode:** GuiPass (audit + ranked proposals). No GuiFix this turn.  
**Surfaces:** live product `https://resumeforge-81d.pages.dev/` (desktop + 390×844 mobile emulation).  
**Code SSOT:** GitHub `mck3nz1chantz-stack/ResumeForge` (`src/App.tsx`). Local `~/ChantzMedia/ChantzMediaProjects/ResumeForge` currently holds only `build-state.json` + this docs tree — restore the repo before implementation.  
**Sign-off:** **CONDITIONAL** — CTAs work; the default path is too heavy for “see a job on my phone → tailored PDF.”

Operator jobs this pass must serve:

1. Load jobs quickly.  
2. Select jobs easily.  
3. Create multiple resume iterations and compare them.  
4. On a phone, paste/target a posting and walk out with a specific resume.

---

## Summary

The product already has a master job bank, named builds, per-build job/skill checkboxes, JD tailor, 18 ATS layouts, live paper, PDF, PWA install, and backup export. The GUI stacks **onboarding, privacy, install, version chrome, continue-bar, 3-C coaching, and 18 templates** in front of those jobs. Mobile starts on **Layout**, not **Jobs** or **this posting**. Phone and desktop **do not share localStorage**, so a field apply only works if the career bank already lives on that phone.

---

## Findings

| Sev | ID | Agent | Defect | Evidence | Propose | Status |
|-----|-----|-------|--------|----------|---------|--------|
| P0 | GUI-AS-001 | action-surface | Field apply is not the primary path. Phone home = Layout (18 templates) + install + privacy + builds strip. JD tailor sits under Tune / More. | Live 390px: bottom tabs Layout · Jobs · Build · More; main heading “Step 1 · Layout (18 templates)”; `docs/MOBILE.md` “fast path” still says Build tab first. | Slice **RF.1** Apply-now: posting → jobs on this resume → PDF in ≤4 taps once a bank exists. | open |
| P0 | GUI-AS-002 | action-surface | Phone data is a separate browser store. Seeing a job on the phone with the bank only on the Mac means an empty workspace unless Import backup ran earlier. | Privacy copy + MOBILE.md “localStorage does not sync”; first-run still offers Skip empty workspace. | Slice **RF.0** restore local repo; **RF.2** first-run “Import backup” as equal CTA; persistent “this device has N jobs / N builds”; optional later encrypted file/iCloud-user-moved backup (no account). | open |
| P1 | GUI-SL-001 | slop-surface | Chrome stack above the editor: privacy compact, PWA install, VersionSwitcher (New Build + Save + Save as + Edit + helper paragraph), BuildContinueBar, 3-C/GitHub sentence, then step chips, then 18 layout cards + 3-C + eye-path. GitHub appears in header, sentence, nav. | A11y tree after Skip; `App.tsx` header + `DeviceDataBanner` + `MobileInstallBanner` + `VersionSwitcher` + `BuildContinueBar`. | Slice **RF.3** one header row: current build · + Resume · PDF. Collapse privacy/install/3-C behind first-run or More. | open |
| P1 | GUI-AS-003 | action-surface | Job selection is not a first-class phone screen. Master jobs live on Experience; per-resume include lives on “This build” / Edit build. Operator must know the master vs build split. | Nav: 5 · Experience vs 8 · This build; VersionSwitcher helper: “Each build checkboxes which jobs appear.” | Slice **RF.4** Jobs screen = bank list + include-on-this-resume toggles on the same list. | open |
| P1 | GUI-AS-004 | action-surface | Iterations exist (Save as, Dup, family/revision from 2026-08-12 STATUS) but there is no compare gallery. Load is a single combobox “Master only…” / named builds. | Combobox `Load a saved build`; ApplicationsPanel is step 8. | Slice **RF.5** Resumes list: cards with target, date, PDF, Dup, open; optional two-up compare on desktop. | open |
| P2 | GUI-DC-001 | dead-cta | Type/density dials are disabled until a layout creates a Working draft. Copy says pick a layout first — easy to read as broken on an empty master. | Buttons Small/Medium/Large etc. `disableable disabled` until draft. | After RF.1, create draft implicitly on + Resume, enable dials. | open |
| P2 | GUI-SL-002 | slop-surface | 18 layout marketing cards compete with apply. Density filters + Best-for copy on every card. | PreviewPanel 18 buttons with long names. | Keep 3 featured layouts on Apply-now; full gallery under Layout. | open |
| P2 | GUI-AK-001 | a11y-keyboard | Mobile: sticky live bar + 4-tab nav + header + step chips = overlapping chrome; content height is small. | `pb-36` + live bar above tabs + safe-area. | Apply-now uses one sticky PDF + tabs Jobs / This resume / More. | open |
| P2 | GUI-FG-001 | false-green | 3-C “Need work / Need more content” on empty draft is truthful but reads like a product score before the user has jobs. | 3-C expanders on empty workspace. | Hide 3-C until ≥1 job exists. | open |

**Launcher gui-desk FMs skipped (out of product scope):** registry-drift, map-console-split, desk-opener-gap.

---

## Target UX (locked for this spec)

**Mental model (keep, rename in UI):**

| Word in UI | Meaning |
|------------|---------|
| **Jobs** | Master career bank (enter once). |
| **Resume** | One named iteration for one posting (was Build / version / application). |
| **This resume** | Which jobs/skills/summary print on the open Resume. |

**Phone Apply-now (happy path, bank already on device):**

1. Open PWA.  
2. **New resume** → title + company (optional paste JD).  
3. **Jobs** list: toggle which roles print (defaults: current + last 1–2).  
4. Glance live paper (sheet).  
5. **PDF** → share sheet.

**Desktop:** same objects; live paper stays in the right column. Layout gallery and 3-C stay available, not first.

---

## Implementation slices (wait for `begin RF.n`)

Do not implement until the operator says `begin RF.n`. Code only under `~/ChantzMedia/ChantzMediaProjects/ResumeForge` after the GitHub tree is restored there.

### RF.0 — Restore app tree ✅ 2026-09-21

Clone/pull `https://github.com/mck3nz1chantz-stack/ResumeForge` into `ChantzMediaProjects/ResumeForge`. Confirm `npm run dev` → `http://127.0.0.1:5181/`. Do not leave the only copy on Desktop/iCloud.

**Done:** `git clone` `c1685de` → `~/ChantzMedia/ChantzMediaProjects/ResumeForge`. GuiPass spec kept. Opener `ROOT` retargeted off Desktop. Next: `begin RF.1`.

### RF.1 — Apply-now home (mobile default) ✅ 2026-09-21

- If `jobs.length ≥ 1`, skip layout-first; land on **New resume** or last resume.  
- Primary: **New resume**, **Jobs**, **PDF**.  
- Paste JD on the new-resume sheet (reuse `JdTailorPanel` extract; do not add a cloud LLM).  
- Featured layouts: ATS Classic, Professional Compact, Internal Promotion.  
- Bottom nav: **Jobs · Resumes · Apply · More**.

**Done:** `ApplyNowPanel` + `NavSection apply`; bottom tabs Jobs/Resumes/Apply/More; New resume dialog paste + 3 layouts; default featured jobs; land on Apply. Full gallery remains on Layout. Next: `begin RF.2`.

### RF.2 — Device bank honesty ✅ 2026-09-21

- Banner only if jobs = 0: **Import backup** + **Add a job**.  
- Show “This phone: N jobs · M resumes”.  
- How-to: AirDrop JSON once; then field apply works.

**Done:** Empty device card (AirDrop steps) before layouts; Apply empty CTAs Import / Add a job; compact count line after a bank exists; import lands on Apply. Sample file `docs/fixtures/rf2-sample-backup.json`. Next: `begin RF.3`.

### RF.3 — Chrome diet ✅ 2026-09-21

- One sticky header: RF mark, current resume name, New resume, PDF.  
- Privacy/install: first session or More.  
- Remove duplicate GitHub / How to use / New Build from continue-bar + nav footer.  
- Hide 3-C and eye-path until there is content.

**Done:** Slim header; privacy only when empty; install in More; no GH/How-to strip; 3-C gated on content. Next: `begin RF.4`.

### RF.4 — Unified job list ✅ 2026-09-21

- Each row: title, company, dates, **On this resume** switch, expand to edit bullets.  
- Add job at top.  
- Selecting jobs writes `featuredJobIds` on the active resume (create one if none).

**Done:** Jobs tab rows + switch; first toggle creates Working draft. Next: `begin RF.5`.

### RF.5 — Resume iterations ✅ 2026-09-21

- Resumes tab: list of named iterations (label, company, updated).  
- Actions: Open, Duplicate, PDF, Delete.  
- Duplicate = current `duplicateApplication` / Save as.  
- Desktop optional: pick two → side-by-side paper.

**Done:** Resumes list + Open→Apply, Duplicate, PDF, Delete; desktop Compare two-up. Streamline RF.0–RF.5 complete.

### RF.6 — Residual chrome ✅ 2026-09-21

- VersionSwitcher titled **Resumes** (Load a resume · Edit resume).
- Continue bar **This resume**; nav **8 · This resume**; sidebar **Tune this resume**.
- Resumes tab: long editor collapsed behind **Edit details**.

**Done:** Copy + collapsed editor. Pages deployed 2026-09-21 hash **5843aee9** → https://resumeforge-81d.pages.dev/

### Later (not this streamline)

- DOCX, cloud sync, accounts, LLM rewrite. Privacy lock stays: no resume telemetry.

---

## Accept (when RF.1–RF.5 land)

| Check | Pass |
|-------|------|
| Phone 390px, bank present | New resume → toggle jobs → PDF without opening Layout gallery |
| Jobs | One list: load/edit + include-on-resume |
| Iterations | ≥2 named resumes, switch and PDF each |
| Empty phone | Import backup is visible before 18 templates |
| Desktop | Live paper still updates; PDF still selectable text |

---

## Continue

Phrase: `ResumeForgeContinue` · `begin RF.0` (restore) then `begin RF.1`.  
GuiFix was not requested; this file is the desk report + spec.
