import { useMemo, useState } from 'react'
import type { ResumeApplication, ResumeToneId, TemplateId } from '../types/application'
import type { ResumeProfile } from '../types/profile'
import {
  defaultLabel,
  duplicateApplication,
  emptyApplication,
  touchApplication,
  withMode,
  withTone,
} from '../lib/applicationFactory'
import { downloadApplicationJson } from '../lib/applicationStorage'
import { scaffoldFor } from '../data/expertScaffolds'
import { listPacks } from '../data/packs'
import { suggestTone } from '../lib/suggestTone'
import { TEMPLATES } from '../lib/templates'
import { SectionCoach } from './SectionCoach'
import { SectionGuide } from './SectionGuide'
import { TonePicker } from './TonePicker'
import { ToneSuggestBanner } from './ToneSuggestBanner'
import { VersionJobPicker } from './VersionJobPicker'
import { VersionSkillPicker } from './VersionSkillPicker'

type Props = {
  profile: ResumeProfile
  applications: ResumeApplication[]
  activeId: string | null
  onChangeApps: (apps: ResumeApplication[]) => void
  onSelect: (id: string | null) => void
  /** Jump to Phase 4 JD keyword tailor for the active application */
  onOpenJdTailor?: () => void
  onOpenInternalPromo?: () => void
  onOpenCoverLetter?: () => void
  /** Jump to master Jobs bank */
  onOpenJobs?: () => void
  /** Jump to master Skills bank */
  onOpenSkills?: () => void
  /** Open the primary New Build dialog */
  onNewBuild?: () => void
}

export function ApplicationsPanel({
  profile,
  applications,
  activeId,
  onChangeApps,
  onSelect,
  onOpenJdTailor,
  onOpenInternalPromo,
  onOpenCoverLetter,
  onOpenJobs,
  onOpenSkills,
  onNewBuild,
}: Props) {
  const active = applications.find((a) => a.applicationId === activeId) ?? null

  const create = (partial?: Partial<ResumeApplication>) => {
    const app = emptyApplication(profile, partial)
    onChangeApps([app, ...applications])
    onSelect(app.applicationId)
  }

  const updateActive = (patch: Partial<ResumeApplication>) => {
    if (!active) return
    const next = touchApplication({ ...active, ...patch })
    onChangeApps(
      applications.map((a) =>
        a.applicationId === active.applicationId ? next : a,
      ),
    )
  }

  const remove = (id: string) => {
    if (!confirm('Delete this resume version?')) return
    const next = applications.filter((a) => a.applicationId !== id)
    onChangeApps(next)
    if (activeId === id) onSelect(next[0]?.applicationId ?? null)
  }

  const [dupFlash, setDupFlash] = useState<string | null>(null)
  const [toneDismissedFor, setToneDismissedFor] = useState<string | null>(null)

  const dup = (app: ResumeApplication) => {
    const copy = duplicateApplication(app)
    onChangeApps([copy, ...applications])
    onSelect(copy.applicationId)
    setDupFlash(copy.applicationId)
    window.setTimeout(() => setDupFlash(null), 1600)
  }

  const toneSuggestion = useMemo(() => {
    if (!active) return null
    if (toneDismissedFor === active.applicationId) return null
    return suggestTone({
      mode: active.mode,
      targetTitle: active.targetTitle,
      targetCompany: active.targetCompany,
      jobDescription: active.jobDescription,
      jdKeywords: active.jdKeywords,
      jobCount: profile.jobs.length,
      currentTone: active.tone,
    })
  }, [active, profile.jobs.length, toneDismissedFor])

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-slate-50">
            Step 8 · This build
          </h2>
          <p className="text-sm text-slate-400">
            After the content bank: pick jobs &amp; skills for this resume,
            emails, tone, and summary override. Start a fresh target with{' '}
            <strong className="font-medium text-amber-200/90">+ New Build</strong>
            .
          </p>
        </div>
        <SectionGuide guideId="applications" />
        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
          <button
            type="button"
            className="rf-btn rf-btn-primary min-h-11 flex-1 touch-manipulation text-sm font-semibold sm:min-h-10 sm:flex-none"
            onClick={() => (onNewBuild ? onNewBuild() : create())}
          >
            + New Build
          </button>
          <button
            type="button"
            className="rf-btn min-h-11 flex-1 touch-manipulation sm:min-h-10 sm:flex-none"
            onClick={() =>
              create({
                mode: 'internal',
                tone: 'internal-promo',
                templateId: 'internal-promotion',
                label: 'Internal promotion',
              })
            }
          >
            + Internal promo
          </button>
        </div>
      </header>

      {scaffoldFor('applications') && (
        <SectionCoach
          scaffold={scaffoldFor('applications')!}
          defaultOpen={applications.length === 0}
        />
      )}

      {applications.length === 0 ? (
        <div className="rf-card text-sm text-slate-400">
          No builds yet. Press{' '}
          <strong className="font-medium text-amber-200/90">+ New Build</strong>{' '}
          (header or above) for each role — e.g. “Supervisor — Acme”. Your master
          job bank stays shared; you pick jobs per build.
        </div>
      ) : (
        <ul className="space-y-2">
          {applications.map((app) => {
            const selected = app.applicationId === activeId
            return (
              <li
                key={app.applicationId}
                className={`flex min-h-14 flex-wrap items-center gap-2 rounded-xl border px-2 py-2 sm:px-3 ${
                  selected
                    ? 'border-amber-700/50 bg-amber-950/30 ring-1 ring-amber-700/40'
                    : 'border-slate-800 bg-slate-900/40'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelect(app.applicationId)}
                  className="min-w-0 flex-1 touch-manipulation rounded-lg px-1.5 py-1.5 text-left hover:bg-slate-800/40 active:bg-slate-800/60"
                >
                  <p className="text-sm font-medium text-slate-100">
                    {app.label || 'Untitled'}
                    {dupFlash === app.applicationId ? (
                      <span className="ml-1.5 text-xs font-normal text-emerald-400">
                        duplicated ✓
                      </span>
                    ) : null}
                  </p>
                  <p className="text-xs text-slate-500">
                    {TEMPLATES.find((t) => t.id === app.templateId)?.name ??
                      app.templateId}
                    {' · '}
                    {app.mode}
                    {app.targetTitle ? ` · ${app.targetTitle}` : ''}
                  </p>
                </button>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    className="rf-btn text-xs"
                    title="Duplicate this application (all JD / cover / pin fields)"
                    onClick={() => dup(app)}
                  >
                    Dup
                  </button>
                  <button
                    type="button"
                    className="rf-btn text-xs"
                    title="Download this application only"
                    onClick={() => downloadApplicationJson(app)}
                  >
                    JSON
                  </button>
                  <button
                    type="button"
                    className="rf-btn rf-btn-danger text-xs"
                    title="Delete application"
                    onClick={() => remove(app.applicationId)}
                  >
                    Del
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {active && (
        <div className="rf-card space-y-4">
          <h3 className="text-sm font-semibold text-amber-300/90">
            Edit: {active.label || 'Untitled'}
          </h3>

          <label>
            <span className="rf-label">Label (your name for this file)</span>
            <input
              className="rf-input"
              value={active.label}
              onChange={(e) => updateActive({ label: e.target.value })}
              placeholder="Team Lead @ Acme"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label>
              <span className="rf-label">Target title</span>
              <input
                className="rf-input"
                value={active.targetTitle}
                onChange={(e) => {
                  const targetTitle = e.target.value
                  const patch: Partial<ResumeApplication> = { targetTitle }
                  if (
                    !active.label ||
                    active.label === 'General application' ||
                    active.label === 'Internal promotion'
                  ) {
                    patch.label = defaultLabel(
                      targetTitle,
                      active.targetCompany,
                      active.mode,
                    )
                  }
                  updateActive(patch)
                }}
                placeholder="Production Supervisor"
              />
            </label>
            <label>
              <span className="rf-label">Target company</span>
              <input
                className="rf-input"
                value={active.targetCompany}
                onChange={(e) => {
                  const targetCompany = e.target.value
                  const patch: Partial<ResumeApplication> = { targetCompany }
                  if (
                    !active.label ||
                    active.label === 'General application' ||
                    active.label === 'Internal promotion'
                  ) {
                    patch.label = defaultLabel(
                      active.targetTitle,
                      targetCompany,
                      active.mode,
                    )
                  }
                  updateActive(patch)
                }}
                placeholder="Your company or external employer"
              />
            </label>
          </div>

          {toneSuggestion?.differsFromCurrent && (
            <ToneSuggestBanner
              suggestion={toneSuggestion}
              currentTone={active.tone || 'ats-external'}
              onAccept={(toneId) => {
                updateActive(withTone(active, toneId))
                setToneDismissedFor(active.applicationId)
              }}
              onDismiss={() => setToneDismissedFor(active.applicationId)}
            />
          )}

          <TonePicker
            value={active.tone || 'ats-external'}
            onChange={(toneId: ResumeToneId) => {
              updateActive(withTone(active, toneId))
              setToneDismissedFor(active.applicationId)
            }}
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <label>
              <span className="rf-label">Mode</span>
              <select
                className="rf-input"
                value={active.mode}
                onChange={(e) => {
                  const mode = e.target.value as ResumeApplication['mode']
                  if (mode === 'internal') {
                    // Internal promo tone + show work email
                    updateActive(
                      withTone(withMode(active, 'internal'), 'internal-promo'),
                    )
                    setToneDismissedFor(null)
                    return
                  }
                  // External → hide work email by default (can re-check below)
                  updateActive(withMode(active, 'external'))
                  setToneDismissedFor(null)
                }}
              >
                <option value="external">External application</option>
                <option value="internal">Internal promotion</option>
              </select>
            </label>
            <label>
              <span className="rf-label">Layout template</span>
              <select
                className="rf-input"
                value={active.templateId}
                onChange={(e) =>
                  updateActive({
                    templateId: e.target.value as TemplateId,
                  })
                }
              >
                {TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-3">
            <p className="text-sm font-medium text-slate-100">
              Emails on this version
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Master Contact keeps both addresses. Uncheck work email for
              outside applications so your company address stays off the PDF.
            </p>
            <ul className="mt-2.5 space-y-2">
              <li>
                <label className="flex cursor-pointer items-start gap-2.5 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    className="mt-0.5 size-4 shrink-0 rounded border-slate-600 bg-slate-900 text-amber-500"
                    checked={active.includeProfessionalEmail !== false}
                    onChange={(e) =>
                      updateActive({
                        includeProfessionalEmail: e.target.checked,
                      })
                    }
                  />
                  <span>
                    <span className="font-medium">Professional / personal</span>
                    {profile.contact.email?.trim() ? (
                      <span className="mt-0.5 block text-xs text-slate-500">
                        {profile.contact.email.trim()}
                      </span>
                    ) : (
                      <span className="mt-0.5 block text-xs text-amber-500/90">
                        Not set on Contact yet
                      </span>
                    )}
                  </span>
                </label>
              </li>
              <li>
                <label className="flex cursor-pointer items-start gap-2.5 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    className="mt-0.5 size-4 shrink-0 rounded border-slate-600 bg-slate-900 text-amber-500"
                    checked={Boolean(active.includeInternalEmail)}
                    onChange={(e) =>
                      updateActive({
                        includeInternalEmail: e.target.checked,
                      })
                    }
                  />
                  <span>
                    <span className="font-medium">Work / internal</span>
                    {profile.contact.emailInternal?.trim() ? (
                      <span className="mt-0.5 block text-xs text-slate-500">
                        {profile.contact.emailInternal.trim()}
                      </span>
                    ) : (
                      <span className="mt-0.5 block text-xs text-amber-500/90">
                        Not set on Contact yet
                      </span>
                    )}
                  </span>
                </label>
              </li>
            </ul>
            {!active.includeProfessionalEmail &&
              !active.includeInternalEmail && (
                <p className="mt-2 text-xs text-amber-300/90">
                  No emails selected — resume header will omit email until you
                  check one.
                </p>
              )}
          </div>

          <label>
            <span className="rf-label">Industry pack</span>
            <select
              className="rf-input"
              value={active.industryPackId || profile.defaultIndustryPackId}
              onChange={(e) => updateActive({ industryPackId: e.target.value })}
            >
              {listPacks().map((p) => (
                <option key={p.id} value={p.id}>
                  {p.displayName}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-500">
              Changes prompts, JD keyword bank, and skill order for this app.
            </p>
          </label>

          <VersionJobPicker
            jobs={profile.jobs}
            featuredJobIds={active.featuredJobIds}
            onChange={(featuredJobIds) => updateActive({ featuredJobIds })}
            onOpenJobs={onOpenJobs}
          />

          <VersionSkillPicker
            skills={profile.skills}
            featuredSkillKeys={active.featuredSkillKeys ?? []}
            onChange={(featuredSkillKeys) => updateActive({ featuredSkillKeys })}
            onOpenSkills={onOpenSkills}
          />

          <label>
            <span className="rf-label">
              Summary on this resume (optional — blank uses master summary)
            </span>
            <textarea
              className="rf-input min-h-[100px] resize-y"
              value={active.summaryOverride}
              onChange={(e) => updateActive({ summaryOverride: e.target.value })}
              placeholder="Bridge summary for this specific target role…"
            />
          </label>

          <div className="flex flex-col gap-2 sm:flex-row">
            {onOpenJdTailor && (
              <div className="flex-1 rounded-xl border border-slate-700 bg-slate-900/40 p-3">
                <p className="text-sm font-medium text-slate-100">
                  JD keyword tailor
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Paste JD · match checklist
                  {active.jdKeywords?.length
                    ? ` · ${active.jdKeywords.length} keywords`
                    : ''}
                </p>
                <button
                  type="button"
                  className="rf-btn rf-btn-primary mt-2 min-h-10 w-full touch-manipulation text-sm"
                  onClick={onOpenJdTailor}
                >
                  Open JD keywords
                </button>
              </div>
            )}
            {onOpenInternalPromo && (
              <div className="flex-1 rounded-xl border border-amber-900/40 bg-amber-950/20 p-3">
                <p className="text-sm font-medium text-amber-100">
                  Internal promo wizard
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Company · titles · readiness · bridge summary
                </p>
                <button
                  type="button"
                  className="rf-btn rf-btn-primary mt-2 min-h-10 w-full touch-manipulation text-sm"
                  onClick={onOpenInternalPromo}
                >
                  Open internal promo
                </button>
              </div>
            )}
            {onOpenCoverLetter && (
              <div className="flex-1 rounded-xl border border-slate-700 bg-slate-900/50 p-3">
                <p className="text-sm font-medium text-slate-100">Cover letter</p>
                <p className="mt-1 text-xs text-slate-400">
                  Optional stub · {active.coverLetter?.trim() ? 'draft saved' : 'empty'}
                </p>
                <button
                  type="button"
                  className="rf-btn mt-2 min-h-10 w-full touch-manipulation text-sm"
                  onClick={onOpenCoverLetter}
                >
                  Open cover letter
                </button>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  )
}
