import type { ReactNode } from 'react'
import type { TemplateId } from '../types/application'
import type { ResolvedResume, SectionId } from '../lib/resolveResume'
import { contactHeaderBits } from '../lib/contactLines'
import { formatDateRange } from '../lib/formatDates'
import { printPrefsClassNames } from '../lib/printPrefs'

type Props = {
  view: ResolvedResume
  className?: string
  id?: string
  /** Compact mini-preview for gallery cards */
  mini?: boolean
  /**
   * Coach-only: highlight manager first-pass fields (name, titles, companies,
   * dates, education). Does not affect PDF export.
   */
  scanMode?: boolean
}

/**
 * Single-column ATS-safe resume body.
 * Templates differ by density, section order, and visual signature (rules,
 * type, header treatment) — never multi-column / text-as-image.
 */
export function ResumeDocument({
  view,
  className = '',
  id,
  mini,
  scanMode = false,
}: Props) {
  const {
    contact,
    summary,
    jobs,
    skills,
    skillCategoryOrder,
    education,
    certs,
    templateId,
    showInternalBanner,
    targetTitle,
    targetCompany,
    currentTitle,
    sectionOrder,
  } = view

  const name = contact.name.trim() || 'Your Name'
  const contactBits = contactHeaderBits(contact, view.mode, {
    professional: view.includeProfessionalEmail,
    internal: view.includeInternalEmail,
  })

  const hasSkills =
    skills.hard.length > 0 || skills.tools.length > 0 || skills.soft.length > 0

  const skin = templateSkin(templateId)
  const prefsClass = printPrefsClassNames(view.printPrefs)

  const skillLines: Record<'hard' | 'tools' | 'soft', ReactNode> = {
    hard:
      skills.hard.length > 0 ? (
        <p className="ats-skills" key="hard">
          <span className="ats-skill-label">Hard skills: </span>
          {skills.hard.join(', ')}
        </p>
      ) : null,
    tools:
      skills.tools.length > 0 ? (
        <p className="ats-skills" key="tools">
          <span className="ats-skill-label">Tools: </span>
          {skills.tools.join(', ')}
        </p>
      ) : null,
    soft:
      skills.soft.length > 0 ? (
        <p className="ats-skills" key="soft">
          <span className="ats-skill-label">Leadership / soft: </span>
          {skills.soft.join(', ')}
        </p>
      ) : null,
  }

  const order = skillCategoryOrder ?? ['hard', 'tools', 'soft']

  const sections: Record<SectionId, ReactNode> = {
    summary: summary.trim() ? (
      <section className="ats-section ats-section-summary" key="summary">
        <SectionHeading>Professional Summary</SectionHeading>
        <p className="ats-summary">{summary.trim()}</p>
      </section>
    ) : null,
    skills: hasSkills ? (
      <section className="ats-section ats-section-skills" key="skills">
        <SectionHeading>Skills</SectionHeading>
        <div className="ats-skills-block">{order.map((cat) => skillLines[cat])}</div>
      </section>
    ) : null,
    experience:
      jobs.length > 0 ? (
        <section className="ats-section ats-section-experience" key="experience">
          <SectionHeading>Experience</SectionHeading>
          {jobs.map((job) => {
            const title = job.title.trim()
            const company = job.company.trim()
            const meta = [
              formatDateRange(job.start, job.end),
              job.location.trim(),
              (job.department ?? '').trim(),
            ]
              .filter(Boolean)
              .join('  ·  ')
            const bullets = job.bullets.map((b) => b.trim()).filter(Boolean)
            const metrics = job.metrics.filter(
              (m) => m.label.trim() || m.value.trim(),
            )
            const showBullets = mini ? bullets.slice(0, 2) : bullets

            return (
              <div key={job.id} className="ats-job">
                <div className="ats-job-head">
                  <div className="ats-job-head-main">
                    {title && <h3 className="ats-job-title">{title}</h3>}
                    {company && <p className="ats-job-company">{company}</p>}
                  </div>
                  {meta && <p className="ats-job-meta">{meta}</p>}
                </div>
                {showInternalBanner && job.isCurrentEmployer && (
                  <p className="ats-job-badge">Current employer</p>
                )}
                {!mini && job.tools.length > 0 && (
                  <p className="ats-job-tools">
                    <span className="ats-job-tools-label">Tools: </span>
                    {job.tools.join(', ')}
                  </p>
                )}
                {(showBullets.length > 0 || (!mini && metrics.length > 0)) && (
                  <ul className="ats-bullets">
                    {showBullets.map((b, i) => (
                      <li key={`b-${i}`}>{b}</li>
                    ))}
                    {!mini &&
                      metrics.map((m, i) => {
                        const unit = m.unit?.trim() ? m.unit.trim() : ''
                        const ctx = m.context?.trim()
                          ? ` (${m.context.trim()})`
                          : ''
                        return (
                          <li key={`m-${i}`}>
                            {m.label.trim()}: {m.value.trim()}
                            {unit}
                            {ctx}
                          </li>
                        )
                      })}
                  </ul>
                )}
              </div>
            )
          })}
        </section>
      ) : null,
    certs:
      !mini && certs.length > 0 ? (
        <section className="ats-section ats-section-certs" key="certs">
          <SectionHeading>Certifications</SectionHeading>
          <ul className="ats-bullets">
            {certs.map((c) => {
              const bits = [c.name.trim(), c.issuer?.trim(), c.year?.trim()]
                .filter(Boolean)
                .join(' — ')
              if (!bits) return null
              return <li key={c.id}>{bits}</li>
            })}
          </ul>
        </section>
      ) : null,
    education:
      education.length > 0 ? (
        <section className="ats-section ats-section-education" key="education">
          <SectionHeading>Education</SectionHeading>
          <ul className="ats-bullets">
            {education.map((ed) => {
              const bits = [
                ed.credential.trim(),
                ed.school.trim(),
                ed.year?.trim(),
              ]
                .filter(Boolean)
                .join(' — ')
              if (!bits) return null
              return <li key={ed.id}>{bits}</li>
            })}
          </ul>
        </section>
      ) : null,
  }

  const body = sectionOrder.map((sid) => sections[sid]).filter(Boolean)

  return (
    <article
      id={id}
      className={`ats-resume ${skin} ${prefsClass} ${mini ? 'ats-mini' : ''} ${scanMode && !mini ? 'ats-scan-mode' : ''} ${className}`}
    >
      <header className="ats-header">
        <h1 className="ats-name">{name}</h1>
        {/* Target title under name — common on modern industrial / supervisor refs */}
        {targetTitle && !showInternalBanner ? (
          <p className="ats-target-title">{targetTitle}</p>
        ) : null}
        <div className="ats-header-rule" aria-hidden />
        {showInternalBanner &&
          (targetTitle || targetCompany || currentTitle) && (
            <p className="ats-internal-banner">
              Internal application
              {currentTitle ? ` · From: ${currentTitle}` : ''}
              {targetTitle || targetCompany
                ? ` · Target: ${[targetTitle, targetCompany].filter(Boolean).join(' — ')}`
                : ''}
            </p>
          )}
        {contactBits.length > 0 && (
          <p className="ats-contact">{contactBits.join('  ·  ')}</p>
        )}
      </header>

      {body}

      {!summary.trim() &&
        !hasSkills &&
        jobs.length === 0 &&
        certs.length === 0 &&
        education.length === 0 && (
          <p className="ats-empty">
            Fill contact, jobs, and skills — preview updates live.
          </p>
        )}
    </article>
  )
}

/**
 * Section title + real DOM rule (not border-bottom / ::after).
 * html2canvas often paints CSS borders/pseudos through following text;
 * a separate rule element stays clear of body copy on screen and in PDF.
 */
function SectionHeading({ children }: { children: string }) {
  return (
    <div className="ats-section-head">
      <h2 className="ats-h2">{children}</h2>
      <div className="ats-section-rule" aria-hidden />
    </div>
  )
}

/** Density + visual signature class stack for each template. */
function templateSkin(templateId: TemplateId): string {
  const map: Record<TemplateId, string> = {
    'ats-classic': 'ats-skin-classic ats-density-balanced',
    'professional-compact': 'ats-skin-compact ats-density-compact',
    'internal-promotion': 'ats-skin-internal ats-density-balanced',
    'skills-first': 'ats-skin-skills ats-density-balanced',
    'impact-dense': 'ats-skin-dense ats-density-dense',
    'ops-leader': 'ats-skin-ops ats-density-balanced',
    'modern-clean': 'ats-skin-modern ats-density-roomy',
    'executive-brief': 'ats-skin-executive ats-density-compact',
    'tech-ops': 'ats-skin-tech ats-density-balanced',
    'two-page-roomy': 'ats-skin-roomy ats-density-roomy',
    'quality-focus': 'ats-skin-quality ats-density-balanced',
    'early-career': 'ats-skin-early ats-density-balanced',
    'floor-worker': 'ats-skin-floor ats-density-balanced',
    'production-lead': 'ats-skin-prodlead ats-density-balanced',
    'mfg-associate': 'ats-skin-mfgassoc ats-density-balanced',
    timeline: 'ats-skin-timeline ats-density-roomy',
    'engineer-entry': 'ats-skin-engentry ats-density-balanced',
    'classic-green': 'ats-skin-green ats-density-roomy',
  }
  return map[templateId] ?? 'ats-skin-classic ats-density-balanced'
}
