# ResumeForge — Cloudflare Pages deploy

**Project name (suggested):** `resumeforge`  
**Output:** `dist/` (static Vite SPA)  
**Auth:** you run Wrangler on your machine — Grok does not log into Cloudflare.

## One-time setup (your Mac)

```bash
cd ~/Desktop/ChantzMediaProjects/ResumeForge
npx wrangler login
npx wrangler pages project create resumeforge --production-branch main
```

If the project already exists, skip `project create`.

## Deploy (preview / personal production)

**Gate (launcher SSOT):** `PERMISSIONS.md` § Cloudflare/Wrangler — say **`APPROVED — preview deploy`**, **`approved - deploy`**, or **`APPROVED — deploy`**.

```bash
cd ~/Desktop/ChantzMediaProjects/ResumeForge
npm run deploy:pages
```

Equivalent:

```bash
npm run build
npx wrangler pages deploy dist --project-name=resumeforge
```

**Stable URL:** `https://resumeforge-81d.pages.dev`  
(Per-deploy hash URLs also work; prefer the stable project URL.)  
First deploy: SSL may take a few minutes.

## After deploy (phone)

1. Open the pages.dev URL on your phone.  
2. Safari/Chrome → **Add to Home Screen**.  
3. Run **Get started** guided onboard once (data stays on that phone’s browser).  
4. Optional: Export JSON from desktop → Import on phone.

## Notes

- No backend — profile is **localStorage on each device**.  
- `_redirects` SPA fallback is in `public/`.  
- `robots` meta is `noindex` (personal tool, not a public marketing site).  
- Custom domain later: Cloudflare dashboard → Pages → Custom domains (**`APPROVED — custom domain`**).
