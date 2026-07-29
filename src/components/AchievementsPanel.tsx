import { useMemo, useState } from 'react'
import type { Achievement, Job, ResumeProfile } from '../types/profile'
import { CtaButton } from './CtaButton'
import {
  createAchievement,
  loadAchievements,
  saveAchievements,
} from '../lib/achievementStorage'
import { polishBullet } from '../lib/bulletPolish'

type Props = {
  profile: ResumeProfile
  onInsertIntoLatestJob: (bullet: string) => void
  onJobsChange: (jobs: Job[]) => void
}

/**
 * Phase 7 — reusable achievement library + light polish accept/reject.
 */
export function AchievementsPanel({
  profile,
  onInsertIntoLatestJob,
  onJobsChange,
}: Props) {
  const [items, setItems] = useState<Achievement[]>(() => loadAchievements())
  const [draft, setDraft] = useState('')
  const [tagDraft, setTagDraft] = useState('')
  const [polishTarget, setPolishTarget] = useState<string | null>(null)

  const persist = (next: Achievement[]) => {
    setItems(next)
    saveAchievements(next)
  }

  const add = () => {
    const t = draft.trim()
    if (!t) return
    const tags = tagDraft
      .split(/[,]+/)
      .map((s) => s.trim())
      .filter(Boolean)
    persist([createAchievement(t, { tags }), ...items])
    setDraft('')
    setTagDraft('')
  }

  const remove = (id: string) => {
    persist(items.filter((a) => a.id !== id))
  }

  const harvestFromJobs = () => {
    const existing = new Set(items.map((a) => a.text.toLowerCase()))
    const harvested: Achievement[] = []
    for (const job of profile.jobs) {
      for (const b of job.bullets) {
        const t = b.trim()
        if (t.length < 20) continue
        if (existing.has(t.toLowerCase())) continue
        // Prefer bullets that look like achievements (have a digit or strong verb)
        if (!/\d/.test(t) && !/^(led|owned|reduced|improved|trained|drove|cut|increased)/i.test(t)) {
          continue
        }
        existing.add(t.toLowerCase())
        harvested.push(
          createAchievement(t, {
            tags: [job.company, job.title].filter(Boolean),
            sourceJobId: job.id,
          }),
        )
      }
    }
    if (harvested.length === 0) return
    persist([...harvested, ...items])
  }

  const jobBullets = useMemo(() => {
    const rows: { jobId: string; jobLabel: string; index: number; text: string }[] =
      []
    for (const job of profile.jobs) {
      const jobLabel =
        [job.title, job.company].filter(Boolean).join(' @ ') || 'Untitled'
      job.bullets.forEach((b, index) => {
        if (b.trim()) rows.push({ jobId: job.id, jobLabel, index, text: b })
      })
    }
    return rows
  }, [profile.jobs])

  const activePolish = polishTarget ? polishBullet(polishTarget) : null

  const applyPolishToJob = (jobId: string, index: number, nextText: string) => {
    onJobsChange(
      profile.jobs.map((j) => {
        if (j.id !== jobId) return j
        const bullets = [...j.bullets]
        bullets[index] = nextText
        return { ...j, bullets }
      }),
    )
    setPolishTarget(null)
  }

  return (
    <div className="space-y-4">
      <header>
        <h2 className="text-lg font-semibold text-slate-50">
          Achievement library
        </h2>
        <p className="text-sm text-slate-400">
          Save proven bullets once, reuse across applications. Harvest only pulls
          bullets that already have numbers or strong openers — never invents.
        </p>
      </header>

      <div className="rf-card space-y-3">
        <label>
          <span className="rf-label">New achievement</span>
          <textarea
            className="rf-input min-h-[80px] resize-y"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Reduced scrap 12% on Line 2 by standardizing setup checks…"
          />
        </label>
        <label>
          <span className="rf-label">Tags (optional, comma-separated)</span>
          <input
            className="rf-input"
            value={tagDraft}
            onChange={(e) => setTagDraft(e.target.value)}
            placeholder="safety, quality, leadership"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <CtaButton
            variant="primary"
            className="min-h-11"
            onClick={add}
            disabled={!draft.trim()}
          >
            Save to library
          </CtaButton>
          <CtaButton className="min-h-11" onClick={harvestFromJobs}>
            Harvest from jobs
          </CtaButton>
        </div>
      </div>

      <div className="rf-card space-y-2">
        <h3 className="text-sm font-semibold text-slate-100">
          Library ({items.length})
        </h3>
        {items.length === 0 ? (
          <p className="text-sm text-slate-500">
            Empty. Save strong bullets here or harvest from Jobs.
          </p>
        ) : (
          <ul className="space-y-2">
            {items.map((a) => (
              <li
                key={a.id}
                className="rounded-lg border border-slate-800 bg-slate-900/40 p-2.5"
              >
                <p className="text-sm text-slate-200">{a.text}</p>
                {a.tags.length > 0 && (
                  <p className="mt-1 text-[11px] text-slate-500">
                    {a.tags.join(' · ')}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap gap-1">
                  <button
                    type="button"
                    className="rf-btn rf-btn-primary text-xs"
                    onClick={() => onInsertIntoLatestJob(a.text)}
                  >
                    Add to latest job
                  </button>
                  <button
                    type="button"
                    className="rf-btn text-xs"
                    onClick={() => {
                      void navigator.clipboard.writeText(a.text)
                    }}
                  >
                    Copy
                  </button>
                  <button
                    type="button"
                    className="rf-btn rf-btn-danger text-xs"
                    onClick={() => remove(a.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rf-card space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">
            Light polish assist
          </h3>
          <p className="text-xs text-slate-500">
            Local phrasing cleanup only (stronger openers, less filler). Does not
            add metrics. Accept or reject each suggestion.
          </p>
        </div>
        {jobBullets.length === 0 ? (
          <p className="text-sm text-slate-500">Add job bullets first.</p>
        ) : (
          <ul className="space-y-2">
            {jobBullets.slice(0, 20).map((row) => {
              const sug = polishBullet(row.text)
              return (
                <li
                  key={`${row.jobId}-${row.index}`}
                  className="rounded-lg border border-slate-800 bg-slate-950/40 p-2.5"
                >
                  <p className="text-[11px] text-slate-500">{row.jobLabel}</p>
                  <p className="text-sm text-slate-300">{row.text}</p>
                  {sug ? (
                    <div className="mt-2 rounded-lg border border-amber-900/40 bg-amber-950/20 p-2">
                      <p className="text-xs text-amber-200/90">
                        Suggest: {sug.suggested}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {sug.reasons.join(' · ')}
                      </p>
                      <div className="mt-2 flex gap-1">
                        <button
                          type="button"
                          className="rf-btn rf-btn-primary text-xs"
                          onClick={() =>
                            applyPolishToJob(row.jobId, row.index, sug.suggested)
                          }
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          className="rf-btn text-xs"
                          onClick={() => setPolishTarget(null)}
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          className="rf-btn text-xs"
                          onClick={() =>
                            persist([
                              createAchievement(row.text, {
                                tags: ['from-job'],
                                sourceJobId: row.jobId,
                              }),
                              ...items,
                            ])
                          }
                        >
                          Save original
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-1 text-xs text-slate-600">
                      No polish suggestion (already tight or too short).
                    </p>
                  )}
                </li>
              )
            })}
          </ul>
        )}
        {activePolish && (
          <p className="sr-only">{activePolish.suggested}</p>
        )}
      </div>
    </div>
  )
}
