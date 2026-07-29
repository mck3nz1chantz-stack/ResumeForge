import { useMemo, useState } from 'react'
import type { ResumeApplication, ResumeToneId } from '../types/application'
import type { ResumeProfile, Skills } from '../types/profile'
import { CtaButton } from './CtaButton'
import { ToneSuggestBanner } from './ToneSuggestBanner'
import { touchApplication, withTone } from '../lib/applicationFactory'
import {
  extractKeywordsFromJd,
  formatCoverage,
  matchKeywords,
  rankBulletsByKeywords,
  type KeywordMatch,
} from '../lib/jdKeywords'
import { suggestTone, type ToneSuggestion } from '../lib/suggestTone'
import { VersionJobPicker } from './VersionJobPicker'

type Props = {
  profile: ResumeProfile
  application: ResumeApplication | null
  onApplicationChange: (app: ResumeApplication) => void
  onSkillsChange: (skills: Skills) => void
  onOpenApplications: () => void
}

function locationLabel(locs: KeywordMatch['foundIn']): string {
  if (locs.length === 0) return ''
  const map: Record<string, string> = {
    summary: 'summary',
    skills: 'skills',
    jobs: 'jobs',
    tools: 'tools',
    certs: 'certs',
    education: 'edu',
    title: 'title',
  }
  return locs.map((l) => map[l] ?? l).join(', ')
}

export function JdTailorPanel({
  profile,
  application,
  onApplicationChange,
  onSkillsChange,
  onOpenApplications,
}: Props) {
  const [draftKeyword, setDraftKeyword] = useState('')
  const [extractFlash, setExtractFlash] = useState(false)
  const [toneSuggestion, setToneSuggestion] = useState<ToneSuggestion | null>(
    null,
  )
  const [toneDismissed, setToneDismissed] = useState(false)

  const patch = (partial: Partial<ResumeApplication>) => {
    if (!application) return
    onApplicationChange(touchApplication({ ...application, ...partial }))
  }

  const report = useMemo(() => {
    if (!application) {
      return matchKeywords([], profile, null)
    }
    return matchKeywords(application.jdKeywords, profile, application)
  }, [application, profile])

  const bulletHits = useMemo(() => {
    if (!application?.jdKeywords.length) return []
    return rankBulletsByKeywords(profile.jobs, application.jdKeywords)
  }, [application, profile.jobs])

  const liveToneSuggest = useMemo(() => {
    if (!application) return null
    if (toneDismissed) return null
    return suggestTone({
      mode: application.mode,
      targetTitle: application.targetTitle,
      targetCompany: application.targetCompany,
      jobDescription: application.jobDescription,
      jdKeywords: application.jdKeywords,
      jobCount: profile.jobs.length,
      currentTone: application.tone,
    })
  }, [application, profile.jobs.length, toneDismissed])

  const matched = report.keywords.filter((k) => k.matched)
  const gaps = report.keywords.filter((k) => !k.matched)
  const coveragePct =
    report.total === 0 ? 0 : Math.round(report.coverage * 100)

  const extract = () => {
    if (!application) return
    const keywords = extractKeywordsFromJd(application.jobDescription, {
      packId:
        application.industryPackId || profile.defaultIndustryPackId || 'manufacturing',
    })
    patch({ jdKeywords: keywords })
    const sug = suggestTone({
      mode: application.mode,
      targetTitle: application.targetTitle,
      targetCompany: application.targetCompany,
      jobDescription: application.jobDescription,
      jdKeywords: keywords,
      jobCount: profile.jobs.length,
      currentTone: application.tone,
    })
    setToneSuggestion(sug.differsFromCurrent ? sug : null)
    setToneDismissed(false)
    setExtractFlash(true)
    window.setTimeout(() => setExtractFlash(false), 1200)
  }

  const applySuggestedTone = (toneId: ResumeToneId) => {
    if (!application) return
    onApplicationChange(withTone(application, toneId))
    setToneSuggestion(null)
    setToneDismissed(true)
  }

  const removeKeyword = (keyword: string) => {
    if (!application) return
    patch({
      jdKeywords: application.jdKeywords.filter(
        (k) => k.toLowerCase() !== keyword.toLowerCase(),
      ),
    })
  }

  const addKeyword = (raw: string) => {
    if (!application) return
    const t = raw.trim()
    if (!t) return
    if (
      application.jdKeywords.some((k) => k.toLowerCase() === t.toLowerCase())
    ) {
      setDraftKeyword('')
      return
    }
    patch({ jdKeywords: [...application.jdKeywords, t] })
    setDraftKeyword('')
  }

  const addGapToHardSkills = (keyword: string) => {
    const t = keyword.trim()
    if (!t) return
    if (
      profile.skills.hard.some((s) => s.toLowerCase() === t.toLowerCase()) ||
      profile.skills.tools.some((s) => s.toLowerCase() === t.toLowerCase()) ||
      profile.skills.soft.some((s) => s.toLowerCase() === t.toLowerCase())
    ) {
      return
    }
    onSkillsChange({
      ...profile.skills,
      hard: [...profile.skills.hard, t],
    })
  }

  const togglePin = (key: string) => {
    if (!application) return
    const pinned = application.pinnedBulletKeys.includes(key)
      ? application.pinnedBulletKeys.filter((k) => k !== key)
      : [...application.pinnedBulletKeys, key]
    patch({ pinnedBulletKeys: pinned })
  }

  if (!application) {
    return (
      <div className="space-y-4">
        <header>
          <h2 className="text-lg font-semibold text-slate-50">
            JD keyword tailor
          </h2>
          <p className="text-sm text-slate-400">
            Paste a job description against a named application to extract
            keywords, see what your profile already covers, and pin strong
            bullets.
          </p>
        </header>
        <div className="rf-card space-y-3 border-amber-900/40 bg-amber-950/20">
          <p className="text-sm text-amber-100">
            Create or select an application first — keywords and bridge summary
            save on that application, not the master profile.
          </p>
          <CtaButton
            variant="primary"
            className="min-h-11 w-full sm:w-auto"
            onClick={onOpenApplications}
          >
            Open Applications
          </CtaButton>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-50">
            JD keyword tailor
          </h2>
          <p className="text-sm text-slate-400">
            Application:{' '}
            <span className="text-slate-200">
              {application.label || 'Untitled'}
            </span>
            {application.targetTitle
              ? ` · ${application.targetTitle}`
              : ''}
            {application.targetCompany
              ? ` @ ${application.targetCompany}`
              : ''}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Coverage is how many extracted keywords appear in your profile — not
            a vendor ATS score. Never invent metrics; only mirror language you
            can honestly claim.
          </p>
        </div>
      </header>

      {/* Target + JD paste */}
      <div className="rf-card space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <label>
            <span className="rf-label">Target title</span>
            <input
              className="rf-input"
              value={application.targetTitle}
              onChange={(e) => patch({ targetTitle: e.target.value })}
              placeholder="Production Supervisor"
            />
          </label>
          <label>
            <span className="rf-label">Target company</span>
            <input
              className="rf-input"
              value={application.targetCompany}
              onChange={(e) => patch({ targetCompany: e.target.value })}
              placeholder="Employer name"
            />
          </label>
        </div>

        <label>
          <span className="rf-label">Paste job description</span>
          <textarea
            className="rf-input min-h-[160px] resize-y font-mono text-sm leading-relaxed"
            value={application.jobDescription}
            onChange={(e) => patch({ jobDescription: e.target.value })}
            placeholder="Paste the full JD or requirements section here…"
            spellCheck={false}
          />
        </label>

        <div className="flex flex-wrap gap-2">
          <CtaButton
            variant="primary"
            className="min-h-11 flex-1 sm:flex-none"
            disabled={!application.jobDescription.trim()}
            actionLabels={{ busy: 'Extracting…', done: 'Keywords ready ✓' }}
            onAsyncClick={async () => {
              extract()
            }}
          >
            {extractFlash ? 'Keywords ready ✓' : 'Extract keywords'}
          </CtaButton>
          <CtaButton
            className="min-h-11 flex-1 sm:flex-none"
            disabled={
              !application.jobDescription &&
              application.jdKeywords.length === 0
            }
            onClick={() => {
              patch({
                jobDescription: '',
                jdKeywords: [],
                pinnedBulletKeys: [],
              })
              setToneSuggestion(null)
            }}
          >
            Clear JD data
          </CtaButton>
        </div>
      </div>

      {/* Slice 3 — tone from JD */}
      {(toneSuggestion ?? liveToneSuggest)?.differsFromCurrent && (
        <ToneSuggestBanner
          suggestion={(toneSuggestion ?? liveToneSuggest)!}
          currentTone={application.tone || 'ats-external'}
          onAccept={applySuggestedTone}
          onDismiss={() => {
            setToneSuggestion(null)
            setToneDismissed(true)
          }}
        />
      )}

      {/* Coverage */}
      <div className="rf-card space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Profile coverage
            </p>
            <p className="text-lg font-semibold text-slate-50">
              {formatCoverage(report)}
            </p>
          </div>
          {report.total > 0 && (
            <span
              className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                coveragePct >= 70
                  ? 'border-emerald-800/50 bg-emerald-950/40 text-emerald-200'
                  : coveragePct >= 40
                    ? 'border-amber-800/50 bg-amber-950/40 text-amber-200'
                    : 'border-sky-800/50 bg-sky-950/40 text-sky-200'
              }`}
            >
              {coveragePct}% covered
            </span>
          )}
        </div>
        {report.total > 0 && (
          <div
            className="h-2 overflow-hidden rounded-full bg-slate-800"
            role="progressbar"
            aria-valuenow={coveragePct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Keyword coverage"
          >
            <div
              className={`h-full rounded-full transition-all ${
                coveragePct >= 70
                  ? 'bg-emerald-500'
                  : coveragePct >= 40
                    ? 'bg-amber-500'
                    : 'bg-sky-500'
              }`}
              style={{ width: `${coveragePct}%` }}
            />
          </div>
        )}
        <p className="text-xs text-slate-500">
          Green keywords already appear somewhere in your profile. Amber gaps
          are places to strengthen skills, bullets, or the bridge summary —
          only if true.
        </p>
      </div>

      {/* Keyword lists */}
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="rf-card space-y-2">
          <h3 className="text-sm font-semibold text-emerald-300/90">
            Matched ({matched.length})
          </h3>
          {matched.length === 0 ? (
            <p className="text-sm text-slate-500">
              No matches yet. Extract keywords from a JD or add them manually.
            </p>
          ) : (
            <ul className="flex flex-wrap gap-1.5">
              {matched.map((k) => (
                <li key={k.keyword}>
                  <span className="inline-flex max-w-full items-center gap-1 rounded-full border border-emerald-800/50 bg-emerald-950/40 px-2.5 py-1 text-xs text-emerald-100">
                    <span className="truncate" title={locationLabel(k.foundIn)}>
                      {k.keyword}
                    </span>
                    <button
                      type="button"
                      className="shrink-0 text-emerald-400/80 hover:text-emerald-200"
                      aria-label={`Remove ${k.keyword}`}
                      onClick={() => removeKeyword(k.keyword)}
                    >
                      ×
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rf-card space-y-2">
          <h3 className="text-sm font-semibold text-amber-300/90">
            Gaps ({gaps.length})
          </h3>
          {gaps.length === 0 ? (
            <p className="text-sm text-slate-500">
              {report.total === 0
                ? 'Extract keywords to see gaps.'
                : 'All listed keywords appear in your profile.'}
            </p>
          ) : (
            <ul className="space-y-1.5">
              {gaps.map((k) => (
                <li
                  key={k.keyword}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-900/30 bg-amber-950/20 px-2.5 py-1.5"
                >
                  <span className="text-sm text-amber-100">{k.keyword}</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      className="rf-btn text-xs"
                      title="Add to Hard skills if you honestly have this"
                      onClick={() => addGapToHardSkills(k.keyword)}
                    >
                      + Skill
                    </button>
                    <button
                      type="button"
                      className="rf-btn text-xs"
                      onClick={() => removeKeyword(k.keyword)}
                    >
                      Dismiss
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Manual keyword add */}
      <div className="rf-card space-y-2">
        <span className="rf-label">Add keyword manually</span>
        <div className="flex flex-wrap gap-2">
          <input
            className="rf-input min-h-11 flex-1"
            value={draftKeyword}
            onChange={(e) => setDraftKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addKeyword(draftKeyword)
              }
            }}
            placeholder="e.g. SMED, TPM, ISO 9001"
          />
          <CtaButton
            className="min-h-11"
            onClick={() => addKeyword(draftKeyword)}
          >
            Add
          </CtaButton>
        </div>
      </div>

      {/* Bridge summary */}
      <div className="rf-card space-y-2">
        <label>
          <span className="rf-label">
            Bridge summary for this application
          </span>
          <p className="mb-2 text-xs text-slate-500">
            Overrides master summary on preview/PDF when non-empty. Mirror 2–4
            JD terms you truly own — no fabricated numbers.
          </p>
          <textarea
            className="rf-input min-h-[110px] resize-y"
            value={application.summaryOverride}
            onChange={(e) => patch({ summaryOverride: e.target.value })}
            placeholder={
              profile.baseSummary
                ? 'Optional override… leave blank to use master summary'
                : 'Write a short bridge summary aimed at this role…'
            }
          />
        </label>
        {profile.baseSummary && !application.summaryOverride.trim() && (
          <p className="text-xs text-slate-500">
            Currently using master summary.
          </p>
        )}
        {gaps.length > 0 && (
          <p className="text-xs text-slate-500">
            Gap terms you might honestly weave in:{' '}
            <span className="text-slate-400">
              {gaps
                .slice(0, 8)
                .map((g) => g.keyword)
                .join(' · ')}
            </span>
          </p>
        )}
      </div>

      {/* Pin bullets */}
      <div className="rf-card space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">
            Pin strong bullets
          </h3>
          <p className="text-xs text-slate-500">
            Pinned bullets float to the top of each job on preview/PDF. Ranked
            by keyword hits when a JD is loaded.
          </p>
        </div>

        {profile.jobs.length === 0 ? (
          <p className="text-sm text-slate-500">
            Add jobs on the Jobs tab first.
          </p>
        ) : application.jdKeywords.length === 0 ? (
          <p className="text-sm text-slate-500">
            Extract keywords to rank bullets, or pin from your full job list
            below.
          </p>
        ) : bulletHits.length === 0 ? (
          <p className="text-sm text-slate-500">
            No bullets hit these keywords yet — strengthen job bullets with real
            metrics and tools named in the JD.
          </p>
        ) : null}

        {bulletHits.length > 0 && (
          <ul className="space-y-2">
            {bulletHits.slice(0, 24).map((b) => {
              const pinned = application.pinnedBulletKeys.includes(b.key)
              return (
                <li key={b.key}>
                  <label className="flex cursor-pointer gap-2.5 rounded-lg border border-slate-800 bg-slate-900/40 p-2.5 hover:border-slate-700">
                    <input
                      type="checkbox"
                      className="mt-1 size-4 shrink-0 rounded border-slate-600 bg-slate-900 text-amber-500"
                      checked={pinned}
                      onChange={() => togglePin(b.key)}
                    />
                    <div className="min-w-0">
                      <p className="text-xs text-slate-500">
                        {b.jobLabel}
                        <span className="ml-1.5 text-amber-400/80">
                          {b.hitCount} keyword{b.hitCount === 1 ? '' : 's'}
                        </span>
                      </p>
                      <p className="text-sm text-slate-200">{b.bullet}</p>
                      <p className="mt-0.5 truncate text-[11px] text-slate-600">
                        {b.hits.join(' · ')}
                      </p>
                    </div>
                  </label>
                </li>
              )
            })}
          </ul>
        )}

        {application.pinnedBulletKeys.length > 0 && (
          <p className="text-xs text-slate-500">
            {application.pinnedBulletKeys.length} bullet
            {application.pinnedBulletKeys.length === 1 ? '' : 's'} pinned for
            this application.
          </p>
        )}
      </div>

      <div className="rf-card">
        <VersionJobPicker
          compact
          jobs={profile.jobs}
          featuredJobIds={application.featuredJobIds}
          onChange={(featuredJobIds) => patch({ featuredJobIds })}
        />
      </div>

      <p className="text-center text-xs text-slate-600">
        When ready → Preview / export → PDF. Data stays on this device.
      </p>
    </div>
  )
}
