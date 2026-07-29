import type { ResolvedResume } from './resolveResume'
import { contactEmailsLabeled, contactHeaderBits } from './contactLines'
import { formatDateRange } from './formatDates'

/** ATS-style plain text (standard headers, single column, no tables). */
export function resolvedToPlainText(view: ResolvedResume): string {
  const lines: string[] = []
  const { contact, summary, jobs, skills, education, certs } = view

  const name = contact.name.trim() || 'Name'
  lines.push(name)

  if (
    view.showInternalBanner &&
    (view.targetTitle || view.targetCompany || view.currentTitle)
  ) {
    const bits = ['Internal application']
    if (view.currentTitle) bits.push(`From: ${view.currentTitle}`)
    const target = [view.targetTitle, view.targetCompany]
      .filter(Boolean)
      .join(' — ')
    if (target) bits.push(`Target: ${target}`)
    lines.push(bits.join(' · '))
  }

  const emailInclude = {
    professional: view.includeProfessionalEmail,
    internal: view.includeInternalEmail,
  }
  const labeled = contactEmailsLabeled(contact, view.mode, emailInclude)
  const bothEmailsPrinted = labeled.length >= 2
  if (bothEmailsPrinted) {
    // Location / phone / links, then labeled emails for clarity
    const base = [
      (contact.location ?? '').trim(),
      (contact.phone ?? '').trim(),
      (contact.linkedin ?? '').trim(),
      (contact.portfolio ?? '').trim(),
    ].filter(Boolean)
    if (base.length) lines.push(base.join(' | '))
    lines.push(labeled.join(' | '))
  } else {
    const contactBits = contactHeaderBits(contact, view.mode, emailInclude)
    if (contactBits.length) lines.push(contactBits.join(' | '))
  }
  lines.push('')

  if (summary.trim()) {
    lines.push('PROFESSIONAL SUMMARY')
    lines.push(summary.trim())
    lines.push('')
  }

  const skillLabels: Record<'hard' | 'tools' | 'soft', string> = {
    hard: 'Hard skills',
    tools: 'Tools',
    soft: 'Leadership / soft',
  }
  const skillParts: string[] = []
  const catOrder = view.skillCategoryOrder ?? ['hard', 'tools', 'soft']
  for (const cat of catOrder) {
    const list = skills[cat]
    if (list.length) skillParts.push(`${skillLabels[cat]}: ${list.join(', ')}`)
  }
  if (skillParts.length) {
    lines.push('SKILLS')
    for (const p of skillParts) lines.push(p)
    lines.push('')
  }

  if (jobs.length) {
    lines.push('EXPERIENCE')
    for (const job of jobs) {
      const titleCompany = [job.title.trim(), job.company.trim()]
        .filter(Boolean)
        .join(' — ')
      if (titleCompany) lines.push(titleCompany)
      const meta = [
        formatDateRange(job.start, job.end),
        job.location.trim(),
        (job.department ?? '').trim(),
      ]
        .filter(Boolean)
        .join(' | ')
      if (meta) lines.push(meta)
      if (job.tools.length) lines.push(`Tools: ${job.tools.join(', ')}`)
      for (const b of job.bullets) {
        const t = b.trim()
        if (t) lines.push(`• ${t}`)
      }
      for (const m of job.metrics) {
        if (!m.label.trim() && !m.value.trim()) continue
        const unit = m.unit?.trim() ? m.unit.trim() : ''
        const ctx = m.context?.trim() ? ` (${m.context.trim()})` : ''
        lines.push(
          `• Metric: ${m.label.trim()} ${m.value.trim()}${unit}${ctx}`.trim(),
        )
      }
      lines.push('')
    }
  }

  if (certs.length) {
    lines.push('CERTIFICATIONS')
    for (const c of certs) {
      const bits = [c.name.trim(), c.issuer?.trim(), c.year?.trim()]
        .filter(Boolean)
        .join(' — ')
      if (bits) lines.push(`• ${bits}`)
    }
    lines.push('')
  }

  if (education.length) {
    lines.push('EDUCATION')
    for (const ed of education) {
      const bits = [ed.credential.trim(), ed.school.trim(), ed.year?.trim()]
        .filter(Boolean)
        .join(' — ')
      if (bits) lines.push(`• ${bits}`)
    }
    lines.push('')
  }

  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n'
}

export function downloadPlainText(
  view: ResolvedResume,
  fileBase?: string,
): void {
  const text = resolvedToPlainText(view)
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const slug =
    (fileBase || view.contact.name || view.label)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'resume'
  a.href = url
  a.download = `${slug}-ats.txt`
  a.click()
  URL.revokeObjectURL(url)
}
