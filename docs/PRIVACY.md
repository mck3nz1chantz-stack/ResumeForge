# ResumeForge privacy

**Product rule:** ResumeForge is a **free, local-first** tool. Contact details and career history are **not** collected by a backend for this app.

## What we promise

1. **No account** — you do not sign in to use the core builder.  
2. **On-device storage** — profile and builds are stored in the browser (`localStorage` on that device).  
3. **No resume content upload** — the application code does not post your name, phone, email, jobs, or notes to a ResumeForge server or analytics pipeline.  
4. **You control copies** — leaving the browser only happens when **you** choose:
   - **Export full backup** (JSON download)
   - **Download PDF** / print / copy plain text  
5. **Free to download** — clone the repo and run locally; optional static hosting serves the *app*, not a private resume database.

## What a web host does *not* mean

If someone hosts the static site (e.g. Cloudflare Pages demo):

| Hosted | Not hosted |
|--------|------------|
| HTML/JS/CSS of the app | Your resume JSON in a database |
| Optional public demo URL | Automatic cloud backup of your profile |

Typed data stays in **that visitor’s browser**. The host does not receive resume field payloads from the app’s design.

## Your responsibilities

- Export a backup before clearing site data, switching browsers, or reinstalling.  
- Do not commit personal resume JSON to a **public** Git repository.  
- Treat exported files like any document that contains PII (phone, email, address notes).

## For contributors

Do **not** add without an explicit product decision and user consent design:

- User accounts / OAuth  
- Server-side resume storage or multi-device “sync” of profile content  
- Analytics that send resume text, contact fields, or job history  
- Third-party scripts that can read the page DOM for PII  

App-shell caching (service worker for offline open) only caches **app assets** from the same origin — not a remote PII store.

## In-app

Users see this message in:

- Privacy & backup banner (`DeviceDataBanner`)  
- **How to use** tutorial (Privacy step)  
- Compact line: “On this device only · no account · no resume cloud”

Copy SSOT for the UI: `src/data/privacy.ts`.
