/**
 * In-app How to use — plain product language for any operator.
 * No studio mission / launcher jargon in UI copy.
 */

import {
  PRIVACY_BULLETS,
  PRIVACY_HEADLINE,
  PRIVACY_HOSTING_NOTE,
} from './privacy'
import { GITHUB_REPO_HINT, GITHUB_REPO_URL } from './projectLinks'

export type TutorialStep = {
  id: string
  title: string
  body: string
  bullets?: string[]
  tip?: string
}

export const TUTORIAL_TITLE = 'How to use ResumeForge'

export const TUTORIAL_SUBTITLE =
  'Free · on your device · no account. One history, many tailored resumes.'

/** Shown in tutorial chrome — primary share link is GitHub, not a demo host. */
export const TUTORIAL_GITHUB = {
  url: GITHUB_REPO_URL,
  label: 'Open source on GitHub',
  hint: GITHUB_REPO_HINT,
} as const

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'What this tool does',
    body: 'ResumeForge is a free resume builder that runs in your browser. Write your career once, then create different versions for different jobs — without retyping everything.',
    bullets: [
      'No sign-up, no subscription, no account to manage',
      'ATS-friendly layouts and a text-selectable PDF for most online applications',
      'Multiple builds (versions) share one master profile',
      `Open source — share ${GITHUB_REPO_URL} so others can clone and run it on their own machine`,
    ],
    tip: 'ATS means Applicant Tracking System — software many employers use to store and search applications. Clear structure and real text matter more than flashy designs. Prefer the GitHub link for public posts (not a temporary demo host).',
  },
  {
    id: 'privacy',
    title: PRIVACY_HEADLINE,
    body: 'Your contact info and work history are personal. This app is built so that content stays with you.',
    bullets: [...PRIVACY_BULLETS],
    tip: PRIVACY_HOSTING_NOTE,
  },
  {
    id: 'master-vs-builds',
    title: 'Master profile vs resumes',
    body: 'Think of two layers. This is the most important idea in the app.',
    bullets: [
      'Master profile = your real history: contact, all jobs, skills, education, certs',
      'Resume = one named iteration for a job or company — which jobs/skills print, summary tone, layout, JD keywords',
      'Use + New resume for each target (for example Jr. Development Tech vs Machine Operator)',
      'Switch resumes with the dropdown at the top — master history stays shared',
    ],
    tip: 'Do not clear your master profile for each application. Create another resume instead.',
  },
  {
    id: 'path',
    title: 'Suggested path (resume order)',
    body: 'Walk the steps roughly in the order they appear on paper. You can jump around anytime.',
    bullets: [
      '1 · Layout — pick a template, type size, name style, name/contact Left or Center',
      '2 · Contact — your name, phone, emails, City/ST (skip full street for most applications)',
      '3 · Summary — short professional summary for this resume (or use the master summary)',
      '4 · Skills — bank of hard / tools / soft skills; each resume can check which print',
      '5 · Experience — every role you might need; jobs auto-sort newest first by dates',
      '6–7 · Education & certs — schools and credentials',
      '8 · This resume — which jobs/skills print, emails, tone for this version',
    ],
    tip: 'Live preview updates as you type. On desktop it sits beside the editor; on phone open the live sheet.',
  },
  {
    id: 'tailor',
    title: 'Tailor for a specific job',
    body: 'When you have a posting (or a clear title), tailor a resume — not a second career history.',
    bullets: [
      'Tap + New resume → set target title/company and a clear name',
      'On This resume, check only the jobs and skills that support that role',
      'Write a summary aimed at that title (honest language only)',
      'Optional: JD keywords — paste the job description and mirror words you can truly claim',
      'Download PDF from that resume — switch resumes later for the next application',
    ],
    tip: 'Aim for solid keyword coverage you can defend in an interview — not 100% stuffing.',
  },
  {
    id: 'quality',
    title: 'Quality that looks human',
    body: 'Templates set format. You own the words. Strong resumes are clear, concise, and consistent — with real details.',
    bullets: [
      'Fill real dates (YYYY-MM preferred) so experience sorts reverse-chronological',
      '2–4 impact bullets per role: action + what + how + result only if true',
      'Never invent metrics — leave a blank rather than a fake number',
      'Use Center under Name & contact if you want a symmetric header (still ATS-safe)',
      'Clarity · Conciseness · Consistency meters are craft tips — not a vendor “ATS score”',
    ],
    tip: 'If a bullet still has [brackets], replace them with your facts before you send the PDF.',
  },
  {
    id: 'mobile',
    title: 'Phone & install',
    body: 'ResumeForge is a mobile web app (PWA-ready). On a phone you edit with bottom tabs + step chips; live preview opens as a sheet.',
    bullets: [
      'Bottom tabs: Jobs · Resumes · Apply · More — full path is also in the horizontal step chips',
      'Live bar above the tabs → expand to full preview; PDF is always in the header',
      'Install: Safari Share → Add to Home Screen (iOS) or Chrome ⋮ → Install / Add to Home screen (Android)',
      'Computer install: clone from GitHub, npm install, npm run dev (needs Node)',
      'Data does not sync phone ↔ desktop — use Export / Import backup JSON',
    ],
    tip: `Share ${GITHUB_REPO_URL} publicly. Optional hosted demos are convenience only; prefer home-screen install or local clone for daily use.`,
  },
  {
    id: 'backup',
    title: 'Backup, phone, and reset',
    body: 'Because nothing is stored in “the cloud” for you, backup is your job — especially before clearing the browser or switching devices.',
    bullets: [
      'Export full backup — one JSON with master profile + all builds (you own the file)',
      'Import that file on another device to restore — still local there',
      'Install as a PWA / Add to Home Screen for quick phone use',
      'Reset only when you mean to wipe this browser’s ResumeForge data',
    ],
    tip: 'After Export, keep the JSON somewhere only you control (encrypted drive, password manager attachment, etc.). Never commit personal resume JSON to a public GitHub repo.',
  },
]

export const TUTORIAL_FOOTER =
  'You can open How to use anytime from the header or More menu.'
