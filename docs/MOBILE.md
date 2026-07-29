# ResumeForge on phone (mobile + PWA)

Mobile-first responsive UI + installable **PWA**. Resume data stays in **this browser only** (no account sync).

## Install options

| Path | Who | Steps |
|------|-----|--------|
| **Home screen (PWA)** | Phone / tablet | Open the app in Safari or Chrome → **Add to Home Screen** / Install app |
| **Local clone** | Computer | `git clone` + `npm install` + `npm run dev` — see [README](../README.md) |
| **Optional demo host** | Try before clone | Open a hosted build (e.g. Pages) → then install to home screen |

**Public share link:** https://github.com/mck3nz1chantz-stack/ResumeForge  

### iOS (Safari)

1. Open ResumeForge in **Safari** (not an in-app browser if possible).  
2. Tap **Share** → **Add to Home Screen**.  
3. Open from the icon (standalone chrome).  

### Android (Chrome)

1. Open ResumeForge in **Chrome**.  
2. Menu **⋮** → **Install app** or **Add to Home screen**.  

Install requires **HTTPS** (or localhost). Service worker registers on production builds.

## Phone UI map

| Chrome | Purpose |
|--------|---------|
| Header **PDF** | Always available download |
| Header **GH** | Open-source repo |
| **Layout · Jobs · Build · More** | Bottom tabs (safe-area padded) |
| Horizontal **step chips** | Full resume order (Contact → … → This build) |
| **Live** bar above tabs | Expand sheet preview of the paper |
| **Install** banner | Dismissible home-screen tip (hidden when already installed) |

## What works (audit baseline)

| Capability | Notes |
|------------|--------|
| Responsive layout | Bottom nav + dual-pane desktop |
| Touch targets | Primary controls ≥ ~44px |
| Inputs | 16px base text (reduces iOS focus zoom) |
| Safe areas | Notch / home indicator on header & bottom nav |
| PWA | Manifest + SW (prod); icons 192/512 |
| Overflow | `overflow-x: clip` on app shell |
| Local data | Profile + builds on this device only |

## Desktop ↔ phone data

`localStorage` does **not** sync.

1. **Export full backup** (JSON).  
2. AirDrop / email / Files → other device.  
3. **Import backup** there.

## Dev on phone (same Wi‑Fi as Mac)

1. `npm run dev` (or `Open ResumeForge.command`).  
2. Open the printed **LAN** URL on the phone.  
3. Optional: Add to Home Screen (may need `VITE_PWA_DEV=1` to test SW).

## Fast path when a job posts today

1. Home screen → ResumeForge  
2. **Build** tab → open/create target version  
3. Adjust summary / jobs on this resume  
4. **PDF** → share to email / portal  

## Related

- Privacy: [PRIVACY.md](PRIVACY.md)  
- Tutorial: [TUTORIAL.md](TUTORIAL.md)  
- Deploy: [../DEPLOY.md](../DEPLOY.md)  
- Audit notes: [drafts/mobile-audit.md](drafts/mobile-audit.md)
