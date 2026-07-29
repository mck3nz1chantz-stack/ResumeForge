import type { ResumeApplication } from '../types/application'
import type { ResumeProfile } from '../types/profile'

export function defaultCoverLetterStub(
  profile: ResumeProfile,
  app: ResumeApplication | null,
): string {
  const name = profile.contact.name.trim() || '[Your name]'
  const title = app?.targetTitle?.trim() || '[Target title]'
  const company = app?.targetCompany?.trim() || '[Company]'
  const current =
    app?.currentTitle?.trim() ||
    profile.jobs.find((j) => j.isCurrentEmployer)?.title?.trim() ||
    '[Current title]'
  const mode = app?.mode === 'internal' ? 'internal' : 'external'

  if (mode === 'internal') {
    return `Dear Hiring Manager / Selection Committee,

I am writing to express my interest in the ${title} role at ${company}. I currently serve as ${current} and know our operation, tools, and standards firsthand.

Over my time here I have focused on [one real domain: safety / quality / throughput / leadership] and delivered [one real result you can stand behind — do not invent numbers]. I am ready to expand scope to ${title} and continue building on results our team already trusts.

I would welcome the chance to discuss readiness, scope, and how I can support the team in this next step.

Respectfully,
${name}`
  }

  return `Dear Hiring Manager,

I am applying for the ${title} position at ${company}. I bring hands-on experience as ${current || 'a manufacturing / operations professional'} with a track record in [2 domains you truly own].

In recent roles I have [one real achievement with a real metric if you have one]. I am motivated by ${company}'s focus on [theme from JD only if true] and would welcome the opportunity to contribute.

Thank you for your consideration.

Sincerely,
${name}`
}

export function downloadCoverLetterTxt(
  text: string,
  label?: string,
): void {
  const slug =
    (label || 'cover-letter')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'cover-letter'
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `resumeforge-${slug}-cover.txt`
  a.click()
  URL.revokeObjectURL(url)
}
