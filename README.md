# ResumeForge

**Free, private, local-first resume builder** — one master career profile, many tailored builds (versions), ATS-safe single-column templates, text-selectable PDF export.

Ideal for job seekers who want **industry-ready formatting** without retyping their history for every application — and **without creating an account or uploading their resume to a SaaS**.

## Privacy (non-negotiable product rule)

| Promise | Meaning |
|---------|---------|
| **On your device** | Name, phone, email, jobs, and notes live in **this browser’s local storage** |
| **No account** | No login, no multi-tenant cloud profile |
| **No resume telemetry** | The app does not send your resume content to analytics or a backend |
| **You move data** | Only **Export backup** (JSON) or **Download PDF** leaves the browser — files you control |
| **Free to run** | Clone/download and use locally; optional static host is only the *app shell* |

If you open a hosted demo, page files may load from a server. **Your typed resume content is not uploaded with those loads.** Clearing site data erases local resumes unless you exported a backup.

See [docs/PRIVACY.md](docs/PRIVACY.md).

## Features

- **Master profile** — contact, experience, skills, education, certifications  
- **Multiple builds** — named versions per target role/company (jobs & skills checkboxes, summary override, tone, layout)  
- **ATS-friendly defaults** — single column, standard section headers, selectable PDF text  
- **Live preview** — paper updates as you type  
- **JD keyword tailor** — paste a job description; honest coverage checklist  
- **Industry packs** — manufacturing-first prompts; corporate & customer service too  
- **Print dials** — type size, name sans/serif, page density, **name/contact Left or Center**  
- **On-device only** — localStorage; full JSON backup export/import  
- **PWA-ready** — install / Add to Home Screen on phone  

## How to use (short)

1. Fill **Contact** and **Experience** (master history). Jobs sort **newest first by dates**.  
2. **+ New Build** for each job you apply to.  
3. On **This build**, choose which jobs and skills print; write a targeted summary.  
4. Optional: **JD keywords** from the posting.  
5. **Download PDF**.  

In the running app: open **How to use** anytime for a step-by-step tutorial.  
Also see [docs/TUTORIAL.md](docs/TUTORIAL.md).

### Master vs build

| | Master | Build |
|--|--------|--------|
| Purpose | Your real career bank | One resume for one target |
| Edit when | History changes | You apply to a new role |
| Shared? | Yes — once | Many per master |

## Run locally

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (default **http://127.0.0.1:5181/**).

| Script | Purpose |
|--------|---------|
| `npm run dev` | Local development |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build |
| `npm run deploy:pages` | Build + deploy to Cloudflare Pages (if configured) |

## Tech

- React + TypeScript + Vite  
- Tailwind CSS  
- jsPDF (text PDF export)  
- No required backend  

## Contributing / GitHub

This project is intended as a **free tool anyone can download** and run for their own career — not a cloud product that holds user PII.

1. Fork or clone the repo  
2. `npm install` · `npm run dev`  
3. Keep changes focused; avoid inventing metrics in scaffolds or UI copy  
4. **Do not add auth, accounts, remote resume sync, or analytics that send resume fields** without an explicit product decision  
5. Open a PR with a clear description  

Suggested repo hygiene before a public push:

- Do **not** commit personal resume JSON exports or real contact info  
- Prefer `noindex` on personal demo hosts  
- Keep tutorial + privacy copy aligned (`src/data/privacy.ts`, `src/data/tutorial.ts`, `docs/PRIVACY.md`, `docs/TUTORIAL.md`)  

## License

[MIT](LICENSE) — free to use, modify, and share. Your resume content stays on your device; this license covers the software only.

**Repo:** https://github.com/mck3nz1chantz-stack/ResumeForge

## Docs

| Doc | Topic |
|-----|--------|
| [docs/PRIVACY.md](docs/PRIVACY.md) | Local-only privacy promises |
| [docs/TUTORIAL.md](docs/TUTORIAL.md) | End-user how-to |
| [docs/MOBILE.md](docs/MOBILE.md) | Phone / PWA notes |
| [docs/PDF_ARCHITECTURE.md](docs/PDF_ARCHITECTURE.md) | PDF / preview decisions |
| [DEPLOY.md](DEPLOY.md) | Cloudflare Pages deploy |
