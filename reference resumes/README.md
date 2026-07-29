# Reference resumes

Operator-collected layout samples used to design **visual signatures** for ResumeForge templates.

## Rules

- **Inspiration only** — never copy proprietary copy, names, or metrics into app defaults.
- **ATS-safe output** — ResumeForge stays **single-column**; multi-column ref images become single-column skins (colors, rules, section order, density).
- App templates live in `src/lib/templates.ts` + CSS `.ats-skin-*` + `src/lib/pdfSkin.ts`.

## Map: sample → template

| File (approx) | ResumeForge template id | Signature |
|---------------|-------------------------|-----------|
| Factory-Worker / Harry Taylor red header | `floor-worker` | Red header band, white name ink (preview) |
| production-supervisor / Sophia Kim | `production-lead` | Caps name, orange company/title |
| manufacturing_resume / Elijah Dean | `mfg-associate` | Steel-blue + skills band |
| manuresume / Sebastian Binder timeline | `timeline` | Purple job rail / dots |
| entry-level-manufacturing-engineer | `engineer-entry` | Violet, experience-first |
| First-Job-High-School / green classic | `classic-green` | Twin green rules, centered name |
| assembly-line navy sidebar | *(partial)* → skills-first / ops + floor-worker accents | Sidebars not cloned (ATS) |
| IT-resume cream sections | *(partial)* → tech-ops / modern-clean | Multi-col skills → single-col skills |
| Maverick olive box | *(partial)* → classic-green / executive | Boxed header → twin rules |

When adding new samples, drop files here and extend the template stack (types → templates.ts → CSS → pdfSkin → sectionOrder).
