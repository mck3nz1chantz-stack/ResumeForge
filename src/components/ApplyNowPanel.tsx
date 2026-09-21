import { useEffect, useMemo, useState } from 'react'
import type { ResumeApplication, TemplateId } from '../types/application'
import type { ResumeProfile } from '../types/profile'
import { extractKeywordsFromJd } from '../lib/jdKeywords'
import { FEATURED_TEMPLATE_IDS, getTemplate } from '../lib/templates'
import { touchApplication } from '../lib/applicationFactory'
import { CtaButton } from './CtaButton'
import { VersionJobPicker } from './VersionJobPicker'

type Props = {
  profile: ResumeProfile
  application: ResumeApplication | null
  onApplicationChange: (app: ResumeApplication) => void
  onNewResume: () => void
  onOpenJobs: () => void
  onOpenLayouts: () => void
  onOpenLive: () => void
  onExportPdf: () => Promise<void>
  onImportClick: () => void
}

/**
 * Phone-first apply path: posting + jobs on this resume + PDF.
 * Full 18-layout gallery stays on Layout.
 */
export function ApplyNowPanel({
  profile,
  application,
  onApplicationChange,
  onNewResume,
  onOpenJobs,
  onOpenLayouts,
  onOpenLive,
  onExportPdf,
  onImportClick,
}: Props) {
  const [jdDraft, setJdDraft] = useState(application?.jobDescription ?? '')
  useEffect(() => {
    setJdDraft(application?.jobDescription ?? '')
  }, [application?.applicationId, application?.jobDescription])
  const featured = useMemo(
    () => FEATURED_TEMPLATE_IDS.map((id) => getTemplate(id)),
    [],
  )

  const patch = (partial: Partial<ResumeApplication>) => {
    if (!application) return
    onApplicationChange(touchApplication({ ...application, ...partial }))
  }

  const applyJd = () => {
    if (!application) return
    const text = jdDraft.trim()
    const keywords = extractKeywordsFromJd(text, {
      packId: application.industryPackId,
    })
    patch({ jobDescription: text, jdKeywords: keywords })
  }

  const pickLayout = (id: TemplateId) => {
    if (!application) return
    patch({ templateId: id })
  }

  return (
    <div className="space-y-4">
      <header>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-500/90">
          Apply now
        </p>
        <h2 className="mt-1 text-lg font-semibold text-slate-50">
          Tailor a resume for this posting
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Name the role, paste the job text, pick which jobs print, then PDF.
        </p>
      </header>

      {profile.jobs.length === 0 ? (
        <div className="rounded-xl border border-amber-800/40 bg-amber-950/20 p-4">
          <p className="text-sm text-slate-300">
            This browser has no jobs yet. Import a backup from your computer
            (AirDrop the JSON), or add a job here.
          </p>
          <CtaButton
            variant="primary"
            className="mt-3 min-h-12 w-full font-semibold"
            onClick={onImportClick}
          >
            Import backup
          </CtaButton>
          <CtaButton className="mt-2 min-h-12 w-full" onClick={onOpenJobs}>
            Add a job
          </CtaButton>
        </div>
      ) : !application ? (
        <div className="rounded-xl border border-amber-800/40 bg-amber-950/20 p-4">
          <p className="text-sm text-slate-300">
            Start a named resume for this job. Your job bank stays shared.
          </p>
          <CtaButton
            variant="primary"
            className="mt-3 min-h-12 w-full font-semibold"
            onClick={onNewResume}
          >
            + New resume
          </CtaButton>
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              This resume
            </p>
            <p className="mt-1 text-base font-semibold text-slate-50">
              {application.label}
            </p>
            <p className="text-sm text-slate-400">
              {[application.targetTitle, application.targetCompany]
                .filter(Boolean)
                .join(' · ') || 'No target title yet'}
            </p>
            <CtaButton className="mt-3 min-h-11 w-full" onClick={onNewResume}>
              + Another resume
            </CtaButton>
          </div>

          <label className="block">
            <span className="rf-label">Paste job posting (optional)</span>
            <textarea
              className="rf-input mt-1 min-h-28 w-full text-base"
              value={jdDraft}
              onChange={(e) => setJdDraft(e.target.value)}
              placeholder="Paste the description. Keywords stay on this device."
            />
          </label>
          <CtaButton className="min-h-11 w-full" onClick={applyJd}>
            Use posting keywords
          </CtaButton>
          {application.jdKeywords.length > 0 ? (
            <p className="text-xs text-slate-400">
              {application.jdKeywords.length} keywords on this resume
            </p>
          ) : null}

          <div>
            <p className="rf-label">Layout</p>
            <div className="mt-1.5 grid gap-2">
              {featured.map((t) => {
                const on = application.templateId === t.id
                return (
                  <button
                    key={t.id}
                    type="button"
                    className={`min-h-12 rounded-xl border px-3 py-2 text-left text-sm touch-manipulation ${
                      on
                        ? 'border-amber-600/60 bg-amber-950/40 text-amber-50 ring-1 ring-amber-700/40'
                        : 'border-slate-700 bg-slate-900/50 text-slate-300'
                    }`}
                    onClick={() => pickLayout(t.id)}
                  >
                    <span className="font-semibold">{t.name}</span>
                    <span className="mt-0.5 block text-[11px] text-slate-500">
                      {t.bestFor}
                    </span>
                  </button>
                )
              })}
            </div>
            <button
              type="button"
              className="mt-2 text-sm font-medium text-amber-300/90 underline-offset-2 hover:underline"
              onClick={onOpenLayouts}
            >
              All layouts
            </button>
          </div>

          <VersionJobPicker
            jobs={profile.jobs}
            featuredJobIds={application.featuredJobIds}
            onChange={(featuredJobIds) => patch({ featuredJobIds })}
            onOpenJobs={onOpenJobs}
            compact
          />

          <div className="flex flex-col gap-2 sm:flex-row">
            <CtaButton
              variant="primary"
              className="min-h-12 flex-1 font-semibold"
              actionLabels={{
                busy: 'Making PDF…',
                done: 'PDF ready ✓',
                error: 'PDF failed — try again',
              }}
              onAsyncClick={onExportPdf}
            >
              Download PDF
            </CtaButton>
            <CtaButton className="min-h-12 flex-1" onClick={onOpenLive}>
              Glance paper
            </CtaButton>
          </div>
        </>
      )}

      {profile.jobs.length === 0 ? (
        <p className="text-xs text-slate-500">
          Layout gallery stays under More → All layouts after this device has
          jobs.
        </p>
      ) : null}
    </div>
  )
}
