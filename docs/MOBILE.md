# ResumeForge on phone

Built for short-notice applications at work (including internal posts with ~1 day to apply).

## What works

| Capability | Notes |
|------------|--------|
| Responsive UI | Bottom nav: Preview · Apps · Jobs · More |
| Sticky **PDF** | Always in header on phone |
| Touch targets | ≥44px primary controls; 16px inputs (no iOS zoom) |
| Safe areas | Notch / home indicator padding |
| PWA install | Manifest + service worker (production / preview) |
| Local data | Profile + applications in **this browser** only |

## Same Wi‑Fi as Mac (dev)

1. Run `Open ResumeForge.command` (or `npm run dev`).
2. Terminal prints **Phone: http://&lt;LAN-IP&gt;:5181/**
3. Open that URL on your phone (same Wi‑Fi).
4. Safari/Chrome: Share → **Add to Home Screen** (optional).

Firewall may block inbound; allow Node if the phone cannot connect.

## Work without Mac nearby

Dev server on your home Mac is **not** reachable from the plant.

Options:

1. **Host a build** (Cloudflare Pages / similar, HTTPS) → open on phone → Add to Home Screen.  
2. Or use phone-only: enter profile once on the phone and keep it there.

## Desktop ↔ phone data

`localStorage` does **not** sync across devices.

1. Desktop: **Export JSON** (profile).  
2. AirDrop / email / Files → phone.  
3. Phone: **More → Import profile JSON**.  
4. Re-create or export applications similarly if needed (each app has JSON export).

## Fast path when they post today

1. Home screen → ResumeForge  
2. **Apps** → open or create target role  
3. Edit summary override / featured jobs if needed  
4. **PDF** → share into email / internal portal  

## Hosted (work, no Mac)

See **`DEPLOY.md`** — Cloudflare Pages `resumeforge.pages.dev`. After first deploy, Add to Home Screen and run **Get started** once on the phone.

## Guided setup

Empty profiles open a step-by-step wizard: path (career vs same company) → contact → **education** → chronological jobs with memory prompts → skills → summary → tailor application. Restart anytime from **More** or desktop sidebar.

## PWA notes

- Service worker registers on **production** builds (`npm run build && npm run preview`).  
- Dev: set `VITE_PWA_DEV=1` to test SW registration.  
- Install prompts require **HTTPS** (or localhost).
