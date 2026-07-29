import { useEffect, useMemo, useState } from 'react'
import type { ResumeApplication } from '../types/application'
import type { ResumeProfile } from '../types/profile'
import { CtaButton } from './CtaButton'
import {
  defaultLabel,
  emptyApplication,
  withTone,
} from '../lib/applicationFactory'
import {
  evaluateInternalReadiness,
  fillInternalSummaryTemplate,
  INTERNAL_SUMMARY_TEMPLATES,
  jobsAtCompany,
} from '../lib/internalPromo'

type Props = {
  profile: ResumeProfile
  application: ResumeApplication | null
  applications: ResumeApplication[]
  onProfileChange: (profile: ResumeProfile) => void
  onApplicationChange: (app: ResumeApplication) => void
  onCreateApplication: (app: ResumeApplication) => void
  onSelectApplication: (id: string) => void
  onOpenPreview: () => void
}

/**
 * Phase 6 — internal promotion path: company · titles · filter · readiness · templates.
 */
export function InternalPromoPanel({
  profile,
  application,
  applications: _applications,
  onProfileChange,
  onApplicationChange,
  onCreateApplication,
  onSelectApplication,
  onOpenPreview,
}: Props) {
  const company =
    application?.targetCompany?.trim() ||
    profile.jobs.find((j) => j.isCurrentEmployer)?.company ||
    ''
  const currentTitle =
    application?.currentTitle?.trim() ||
    profile.jobs.find((j) => j.isCurrentEmployer)?.title ||
    ''
  const targetTitle = application?.targetTitle?.trim() || ''

  const [draftCompany, setDraftCompany] = useState(company)
  const [draftCurrent, setDraftCurrent] = useState(currentTitle)
  const [draftTarget, setDraftTarget] = useState(targetTitle)
  const [filterOnly, setFilterOnly] = useState(
    Boolean(application?.featuredJobIds?.length),
  )

  // Re-seed drafts only when switching applications (not on every field keystroke)
  useEffect(() => {
    setDraftCompany(
      application?.targetCompany?.trim() ||
        profile.jobs.find((j) => j.isCurrentEmployer)?.company ||
        '',
    )
    setDraftCurrent(
      application?.currentTitle?.trim() ||
        profile.jobs.find((j) => j.isCurrentEmployer)?.title ||
        '',
    )
    setDraftTarget(application?.targetTitle?.trim() || '')
    setFilterOnly(Boolean(application?.featuredJobIds?.length))
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- re-seed only on app switch
  }, [application?.applicationId])

  const companyJobs = useMemo(
    () => jobsAtCompany(profile.jobs, draftCompany),
    [profile.jobs, draftCompany],
  )

  const readiness = useMemo(
    () =>
      evaluateInternalReadiness(profile, {
        company: draftCompany,
        currentTitle: draftCurrent,
        targetTitle: draftTarget,
        summaryOverride: application?.summaryOverride ?? '',
        application,
      }),
    [profile, draftCompany, draftCurrent, draftTarget, application],
  )

  const progressPct = Math.round(readiness.progress * 100)

  const writeApp = (partial: Partial<ResumeApplication>) => {
    const baseFields: Partial<ResumeApplication> = {
      mode: 'internal',
      tone: 'internal-promo',
      templateId: 'internal-promotion',
      targetCompany: draftCompany.trim(),
      targetTitle: draftTarget.trim(),
      currentTitle: draftCurrent.trim(),
      ...partial,
    }

    if (application) {
      // Slice 3: internal path always maps to internal-promo tone + layout
      onApplicationChange(
        withTone(
          {
            ...application,
            ...baseFields,
            mode: 'internal',
          },
          'internal-promo',
        ),
      )
      return
    }

    const app = withTone(
      emptyApplication(profile, {
        ...baseFields,
        label:
          defaultLabel(draftTarget, draftCompany, 'internal') ||
          'Internal promotion',
      }),
      'internal-promo',
    )
    onCreateApplication(app)
    onSelectApplication(app.applicationId)
  }

  const applyWizard = () => {
    const featuredJobIds = filterOnly ? companyJobs.map((j) => j.id) : []
    const label = defaultLabel(draftTarget, draftCompany, 'internal')
    writeApp({
      featuredJobIds,
      internalCompanyFilter: filterOnly,
      label:
        application?.label &&
        application.label !== 'General application' &&
        application.label !== 'Internal promotion'
          ? application.label
          : label,
    })
  }

  const markJobsCurrent = () => {
    const firstCompany = companyJobs[0]
    if (!firstCompany) return
    const next = profile.jobs.map((j) => {
      if (j.id === firstCompany.id) {
        return {
          ...j,
          isCurrentEmployer: true,
          company: j.company || draftCompany,
        }
      }
      if (companyJobs.some((c) => c.id === j.id) && j.id !== firstCompany.id) {
        return { ...j, isCurrentEmployer: false }
      }
      return j
    })
    onProfileChange({
      ...profile,
      jobs: next,
      updatedAt: new Date().toISOString(),
    })
  }

  const applySummaryTemplate = (text: string) => {
    const filled = fillInternalSummaryTemplate(text, {
      company: draftCompany,
      currentTitle: draftCurrent,
      targetTitle: draftTarget,
    })
    writeApp({ summaryOverride: filled })
  }

  return (
    <div className="space-y-4">
      <header>
        <h2 className="text-lg font-semibold text-slate-50">
          Internal promotion
        </h2>
        <p className="text-sm text-slate-400">
          Build a case for a next-level role at your current company — filter
          history, check readiness, write a bridge summary. Not a generic
          external resume.
        </p>
      </header>

      <div className="rf-card space-y-3">
        <h3 className="text-sm font-semibold text-amber-300/90">
          1 · Company & titles
        </h3>
        <label>
          <span className="rf-label">Company</span>
          <input
            className="rf-input"
            value={draftCompany}
            onChange={(e) => setDraftCompany(e.target.value)}
            placeholder="Employer legal / plant name"
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label>
            <span className="rf-label">Current title</span>
            <input
              className="rf-input"
              value={draftCurrent}
              onChange={(e) => setDraftCurrent(e.target.value)}
              placeholder="Team Lead"
            />
          </label>
          <label>
            <span className="rf-label">Target title</span>
            <input
              className="rf-input"
              value={draftTarget}
              onChange={(e) => setDraftTarget(e.target.value)}
              placeholder="Production Supervisor"
            />
          </label>
        </div>
        <label className="flex cursor-pointer items-start gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            className="mt-1 size-4 rounded border-slate-600 bg-slate-900 text-amber-500"
            checked={filterOnly}
            onChange={(e) => setFilterOnly(e.target.checked)}
          />
          <span>
            Limit this application to roles at this company only
            <span className="block text-xs text-slate-500">
              Sets featured jobs from matching company history (
              {companyJobs.length} match
              {companyJobs.length === 1 ? '' : 'es'}).
            </span>
          </span>
        </label>
        <div className="flex flex-wrap gap-2">
          <CtaButton
            variant="primary"
            className="min-h-11"
            actionLabels={{ busy: '…', done: 'Applied ✓' }}
            onAsyncClick={async () => {
              applyWizard()
            }}
          >
            {application ? 'Apply to application' : 'Create internal application'}
          </CtaButton>
          {companyJobs.length > 0 && (
            <CtaButton className="min-h-11" onClick={markJobsCurrent}>
              Flag top match as current employer
            </CtaButton>
          )}
        </div>
      </div>

      <div className="rf-card space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">
              2 · Company history
            </h3>
            <p className="text-xs text-slate-500">
              Jobs matching “{draftCompany || '…'}”
            </p>
          </div>
          <span className="text-xs text-slate-400">
            {companyJobs.length} role{companyJobs.length === 1 ? '' : 's'}
          </span>
        </div>
        {companyJobs.length === 0 ? (
          <p className="text-sm text-slate-500">
            No jobs match yet. On the Jobs tab, set company name and mark your
            present role as current employer.
          </p>
        ) : (
          <ul className="space-y-2">
            {companyJobs.map((j) => (
              <li
                key={j.id}
                className="rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2"
              >
                <p className="text-sm font-medium text-slate-100">
                  {j.title || 'Untitled'}
                  {j.isCurrentEmployer && (
                    <span className="ml-1.5 text-xs text-amber-400/90">
                      current
                    </span>
                  )}
                </p>
                <p className="text-xs text-slate-500">
                  {j.company}
                  {j.department ? ` · ${j.department}` : ''}
                  {' · '}
                  {j.bullets.filter((b) => b.trim()).length} bullets
                  {j.tools.length ? ` · ${j.tools.length} tools` : ''}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rf-card space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h3 className="text-sm font-semibold text-slate-100">
            3 · Readiness checklist
          </h3>
          <span
            className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
              progressPct >= 80
                ? 'border-emerald-800/50 bg-emerald-950/40 text-emerald-200'
                : progressPct >= 50
                  ? 'border-amber-800/50 bg-amber-950/40 text-amber-200'
                  : 'border-sky-800/50 bg-sky-950/40 text-sky-200'
            }`}
          >
            {readiness.readyCount}/{readiness.total} · {progressPct}%
          </span>
        </div>
        <div
          className="h-2 overflow-hidden rounded-full bg-slate-800"
          role="progressbar"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={`h-full rounded-full transition-all ${
              progressPct >= 80
                ? 'bg-emerald-500'
                : progressPct >= 50
                  ? 'bg-amber-500'
                  : 'bg-sky-500'
            }`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <ul className="space-y-1.5">
          {readiness.items.map((item) => (
            <li
              key={item.id}
              className={`flex gap-2 rounded-lg border px-2.5 py-2 text-sm ${
                item.ok
                  ? 'border-emerald-900/40 bg-emerald-950/20 text-emerald-100'
                  : 'border-slate-800 bg-slate-900/40 text-slate-300'
              }`}
            >
              <span className="shrink-0" aria-hidden>
                {item.ok ? '✓' : '○'}
              </span>
              <div>
                <p className="font-medium">{item.label}</p>
                {!item.ok && (
                  <p className="text-xs text-slate-500">{item.hint}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
        <p className="text-xs text-slate-500">
          Checklist tracks structure for an internal case — not a hiring
          prediction. Never invent metrics to clear a box.
        </p>
      </div>

      <div className="rf-card space-y-3">
        <h3 className="text-sm font-semibold text-slate-100">
          4 · Internal summary templates
        </h3>
        <p className="text-xs text-slate-500">
          Fills company / titles when set. Edit after paste so every claim is
          true.
        </p>
        <ul className="space-y-2">
          {INTERNAL_SUMMARY_TEMPLATES.map((t) => (
            <li
              key={t.id}
              className="rounded-lg border border-slate-800 bg-slate-900/50 p-3"
            >
              <p className="text-xs font-semibold text-slate-200">{t.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                {fillInternalSummaryTemplate(t.text, {
                  company: draftCompany,
                  currentTitle: draftCurrent,
                  targetTitle: draftTarget,
                })}
              </p>
              <CtaButton
                className="mt-2 min-h-9 w-full text-xs sm:w-auto"
                variant="primary"
                onClick={() => applySummaryTemplate(t.text)}
              >
                Use as bridge summary
              </CtaButton>
            </li>
          ))}
        </ul>
        {application && (
          <label>
            <span className="rf-label">Bridge summary (application)</span>
            <textarea
              className="rf-input min-h-[100px] resize-y"
              value={application.summaryOverride}
              onChange={(e) => writeApp({ summaryOverride: e.target.value })}
              placeholder="Connect current title → target with company-specific wins…"
            />
          </label>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <CtaButton
          variant="primary"
          className="min-h-11 flex-1 sm:flex-none"
          onClick={() => {
            applyWizard()
            onOpenPreview()
          }}
        >
          Preview internal resume
        </CtaButton>
      </div>
    </div>
  )
}
