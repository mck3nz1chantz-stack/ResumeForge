# Mobile audit — ResumeForge

**Date:** 2026-07-29  
**Scope:** Phone UX, PWA install, safe areas, touch, public install story  
**Verdict:** **PASS WITH FIXES** (fixes applied this pass)

## Severity rubric

| Sev | Meaning |
|-----|---------|
| Critical | Unusable on phone |
| High | Major friction / broken primary path |
| Medium | Polish / discoverability |
| Low | Nice-to-have |

## Findings

| Sev | ID | Issue | Status |
|-----|-----|--------|--------|
| High | M-NAV-01 | Bottom tabs were Layout/Contact/Summary/More — weak path to Jobs/Build | **Fixed** → Layout · Jobs · Build · More |
| High | M-PWA-01 | No in-app install guidance for home screen | **Fixed** → `MobileInstallBanner` |
| Medium | M-DOC-01 | MOBILE.md outdated (Apps/Jobs tabs, plant-only story) | **Fixed** |
| Medium | M-TUT-01 | Tutorial lacked phone install step | **Fixed** |
| Medium | M-SCROLL-01 | Risk of horizontal overflow on narrow viewports | **Fixed** → `overflow-x: clip` |
| Medium | M-TAP-01 | Bottom tabs lacked touch-action: manipulation | **Fixed** |
| Low | M-MAN-01 | Manifest description outdated | **Fixed** |
| Low | M-PWA-02 | No beforeinstallprompt custom UI | **Deferred** — browser install menu is enough; banner explains iOS/Android |
| Low | M-ICON-01 | Separate maskable-safe art | **Deferred** — reuses 512; OK for MVP |
| Info | M-SYNC-01 | No multi-device sync | **By design** — Export/Import only |

## Already strong (kept)

- Safe-area insets on sticky header + bottom nav + live sheet  
- Sticky PDF on mobile header  
- BuildStepTabs horizontal resume-order chips  
- Live preview bar + sheet  
- `text-base` inputs (iOS zoom mitigation)  
- min-h-11+ primary CTAs  
- SW + manifest present  

## How people install (product truth)

1. **Phone:** open HTTPS app → Add to Home Screen / Install  
2. **Desktop:** clone GitHub + Node  
3. **Share:** GitHub URL primary  

## Residual / later

- Optional `beforeinstallprompt` for Android one-tap  
- Real-device matrix: iOS Safari 17+, Chrome Android (operator)  
- Tablet landscape: dual-pane starts at `lg` — acceptable  

## Operator check (2 min)

1. Phone or DevTools 390px: tabs Layout/Jobs/Build/More  
2. Install banner visible → dismiss → stays dismissed  
3. Live bar → expand sheet → PDF  
4. Step chips scroll; no page-level horizontal scroll  
