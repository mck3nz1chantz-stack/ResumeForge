# How to use ResumeForge

ResumeForge is a **free, local-first** resume builder: enter your career once, then create **named builds** (versions) for different jobs. Layouts are single-column and **ATS-friendly** (selectable PDF text, standard headers).

**Privacy:** your contact info and history stay **on this device**. No account. No cloud sync of resume content. See [PRIVACY.md](PRIVACY.md).

**Share / open source:** https://github.com/mck3nz1chantz-stack/ResumeForge — prefer this over any temporary demo host when posting publicly.

The same guide lives **in the app** under **How to use** (header, sidebar, More menu, or first-run start screen).

## Core idea

| Layer | What it is |
|--------|------------|
| **Master profile** | Contact, all jobs, skills, education, certs |
| **Build / version** | One tailored resume: target title, which jobs/skills print, summary, layout, JD keywords |

Use **+ New Build** for each application target. Do **not** wipe the master profile to start over for each job.

## Quick path

1. **Layout** — template + type size + name style + **Name & contact** Left/Center  
2. **Contact** — name, phone, email(s), City/ST  
3. **Summary** — short, honest professional summary  
4. **Skills** — hard / tools / soft bank  
5. **Experience** — jobs (auto-sorted reverse-chronological by dates)  
6. **Education & certs**  
7. **This build** — check jobs/skills for *this* version  
8. Optional: **JD keywords** — paste a posting; mirror language you can claim  
9. **Download PDF**

## Tailoring tips

- One build per target role (e.g. Jr. Development Tech vs Machine Operator).  
- Uncheck jobs/skills that do not support that role.  
- Prefer real numbers; never invent metrics.  
- Solid JD keyword coverage beats stuffing every word.  

## Data & backup

- Storage is **this browser / device only** (no cloud account by default).  
- **Export full backup** → JSON (profile + all builds).  
- **Import** on another device to restore.  
- Export before clearing site data or switching browsers.  

## Dev / run locally

```bash
cd ResumeForge
npm install
npm run dev
```

See root `README.md` for deploy and project layout.
