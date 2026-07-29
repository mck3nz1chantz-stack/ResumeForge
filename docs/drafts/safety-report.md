# Safety Desk Report — ResumeForge

**Mode:** gate (VibeAndSafety · SafetyGate)  
**Target:** `~/Desktop/ChantzMediaProjects/ResumeForge`  
**Authority:** SUPERCEDE active  
**As-of:** 2026-07-29  
**Operational:** **CONDITIONAL** (controls listed — no silent skip)  
**GrokLaw:** **none** (no formal PASS/WARN/BLOCK filed this session — formal claims stay Law-only)

## Scope

| Surface | Present? | Notes |
|---------|----------|--------|
| Auth / accounts | No | By design — free local tool |
| Payments | No | — |
| Secrets / API keys | No P0 | No `.env` / live secrets in tree |
| PII | **Yes — on device** | Contact, phone, email, jobs in `localStorage` |
| Public bind | Optional Pages demo | Static SPA |
| Compliance marketing claims | Careful | Prefer ATS-safe; Law owns formal claims |
| LAN / multi-tenant | No | — |

## Findings

| Sev | ID | Area | Issue | Evidence | Required action |
|-----|-----|------|-------|----------|-----------------|
| S0 | — | secrets / auth | No open P0 secrets or auth bypass | CLI + tree scan | **CLEAR** for P0 block rule |
| S1 | SAF-PRV-001/003 | privacy | App **stores PII locally** | `storage.ts`, `applicationStorage.ts`, etc. | **OK with control:** disclosure in UI (`DeviceDataBanner`, tutorial privacy step, `docs/PRIVACY.md`); export/delete via user; no third-party share from app |
| S1 | SAF-WS | transport | Public HTTPS site should send HSTS | was missing in `_headers` | **Fixed** this session |
| S2 | SAF-WS | disclosure | `security.txt` missing | public host | **Fixed** this session (Contact URL placeholder until GitHub) |
| S2 | SAF-PRV-004 | claims | Risk of “ATS compliant / certified” marketing | product/session language | **Do not ship formal compliance claims** without **GrokLaw**; product uses craft language only |
| S2 | SAF-PRV | retention | Browser data survives until clear/export | localStorage | Documented; Reset + Export are user controls |

### Security-compliance

- No backend to harden.  
- Edge headers: frame deny, nosniff, referrer, permissions-policy, **HSTS**, baseline **CSP**.  
- SW: same-origin shell cache only (`public/sw.js`); no remote PII store.  
- Dependencies known/registry-checked; small surface.

### Privacy-compliance

| Control | Status |
|---------|--------|
| Purpose disclosure (local tool) | Present |
| No third-party resume upload | Present (no fetch of profile) |
| User-controlled export | Present |
| User wipe (Reset) | Present |
| No children’s product positioning | N/A / not claimed |
| Formal GDPR/CCPA “compliant” badge | **Absent** (correct — Law only) |

**Isolation:** PII never designed to leave device except **user-initiated** download (JSON/PDF/print/clipboard).

## Desk directives

| Desk | Directive |
|------|-----------|
| lean-desk | **FROZEN** on removing privacy banner / privacy docs / export path |
| debug-desk | Must not add remote logging of profile fields |
| final-polish / growth | No “certified compliant” / ATS guarantee badges without GrokLaw |
| GrokBuild | May ship static tool under CONDITIONAL controls below |
| vibe-desk | Pair complete; no P0 open |

## GrokLaw

- **No formal verdict** issued this session.  
- If operator wants marketing claims (GDPR, “enterprise ATS compliant,” etc.) → file **GrokLaw** consult; safety will **HALT** those claims until Law path.  
- Operational gate does **not** substitute PASS/WARN/BLOCK tables.

## Residual risk / operator decision

**CONDITIONAL CLEAR for public static ship** when all of the following hold:

1. No open **P0** secrets/auth (**met**).  
2. Privacy notice remains visible/exportable (**met**).  
3. No account/cloud sync of resume content introduced (**met**).  
4. Deploy includes updated `_headers` + `security.txt` (**met in source** — redeploy required for live).  
5. Formal compliance marketing deferred to **GrokLaw** (**met** by policy).  

**Not a HALT.** Redeploy to activate header/security.txt on live Pages.

## Operational outcome

| Outcome | Value |
|---------|--------|
| **Operational** | **CONDITIONAL** |
| **P0 secrets/auth block** | **PASS** (none open) |
| **Public ship** | Allowed under residual ACK + redeploy |
| **GrokLaw** | none / not required for local-only free tool without formal claims |
