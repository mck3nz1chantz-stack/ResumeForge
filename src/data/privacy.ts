/**
 * Product privacy promises — UI copy SSOT.
 * Resume/contact data must stay on-device; never invent a cloud account path.
 */

export const PRIVACY_HEADLINE = 'Private by design · lives on your device'

export const PRIVACY_SHORT =
  'Your resume and contact details stay in this browser only. No account. No cloud sync. No tracking of your content.'

export const PRIVACY_BULLETS = [
  'Free to use offline once loaded — no login required',
  'Name, phone, email, jobs, and notes are stored only in this browser’s local storage',
  'ResumeForge does not upload your resume content to a server or analytics service',
  'Only you can move data: Export full backup (JSON) or Download PDF on your machine',
  'Clearing site data or switching browsers removes local resumes unless you exported a backup',
] as const

export const PRIVACY_HOSTING_NOTE =
  'If you open a web demo, the app files may load from a host — that is the app shell only. Your typed resume content is not sent with those page loads.'

export const PRIVACY_COMPACT_LINE =
  'On this device only · no account · no resume cloud'
