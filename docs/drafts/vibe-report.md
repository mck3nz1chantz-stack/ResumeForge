# Vibe Desk Report — ResumeForge

**Mode:** gate (VibeAndSafety · VibeGate)  
**Target:** `~/Desktop/ChantzMediaProjects/ResumeForge`  
**As-of:** 2026-07-29  
**Summary:** Local-first SPA; no P0 secrets/auth; web-surface hygiene remediated in-session; ship OK for public static tool with residual notes.  
**Sign-off:** **VIBE-CLEARED-WITH-NOTES**

## Scope (gate agents)

| Agent / class | Focus |
|---------------|--------|
| secret-sprawl (VC-SS) | Live secrets, env files |
| ai-vuln (VC-AV) | XSS / injection / auth gaps |
| slopsquat (VC-SQ) | Registry-real deps |
| saas-friction (VC-SF) | Claims, isolation, client liability |
| review-gate (VC-RG) | Risk-surface review |
| web-surface (VC-WS) | security.txt, HSTS |

CLI: `node $LAUNCHER/scripts/vibe-cli.js gate` — 116 files; npm registry 14 packages exist; P0=0.

## Findings

| Sev | ID | Agent | Defect | Evidence | Propose | Status |
|-----|-----|-------|--------|----------|---------|--------|
| P0 | — | — | None | No hardcoded secrets / `.env` / auth bypass | — | **clear** |
| P1 | VC-WS-001 | saas-friction / CLI | `security.txt` missing | expected `public/.well-known/security.txt` | Add Contact + Expires + Canonical | **fixed** (this session) |
| P1 | VC-WS-002 | saas-friction / CLI | HSTS missing | `public/_headers` | Add Strict-Transport-Security | **fixed** (this session) |
| P2 | VC-GL-001 | secret-sprawl | gitleaks not on PATH | operator machine | `brew install gitleaks` optional deeper scan | **open** (optional) |
| P2 | VC-SF-note | saas-friction | Marketing “ATS compliant” language | Idea Structurer pack / casual copy | Prefer **ATS-safe / ATS-friendly** in product; formal compliance → **GrokLaw only** | **residual ACK** |
| P2 | VC-WS-CSP | web-surface | CSP not previously set | headers | Baseline CSP added with style-src unsafe-inline for React inline styles | **fixed** (this session) |

### Secret sprawl

- No `.env*`, credentials files, or secret-like strings in app tree (excl. `node_modules`).  
- No API keys in source.  
- **P0 secrets: 0** → does **not** block ship under “Block ship on open P0 secrets/auth.”

### AI vuln / auth

- No `fetch` / XHR / WebSocket for resume content.  
- No auth, OAuth, sessions, or backend routes.  
- No `dangerouslySetInnerHTML` / `eval` / `innerHTML` sinks in `src/`.  
- User content rendered as React text nodes (XSS posture favorable for SPA).

### Slopsquat

- Runtime deps: `react`, `react-dom`, `jspdf`, `html2canvas` — registry smoke OK.  
- Dev: vite, tailwind, wrangler, typescript — registry OK.

### SaaS / isolation

- Product model: **localStorage only** for PII; privacy copy SSOT `src/data/privacy.ts`.  
- No multi-tenant cloud.  
- Hosted demo = app shell only (documented).  
- **Do not claim** GDPR/SOC2/“certified ATS” without GrokLaw.

### Review gate

- Risk surfaces (privacy, headers, SW) reviewed this session.  
- Public GitHub still needs LICENSE + security Contact URL update when repo exists.

## Escalations

| Item | Desk |
|------|------|
| Formal compliance / legal claims | **GrokLaw only** (not this desk) |
| P0 if secrets ever introduced | **safety-desk HALT** |

## Residual / operator ACK

1. Optional: install gitleaks and re-scan before first public GitHub push.  
2. Update `security.txt` Contact to GitHub Security Advisories or real mailbox when public.  
3. Keep product copy **ATS-safe/friendly**, not “guaranteed compliant.”  
4. Never commit personal resume JSON exports.

## Sign-off language

**VIBE-CLEARED-WITH-NOTES** — no open P0; P1 web headers remediated; optional gitleaks + Contact URL remain notes.
