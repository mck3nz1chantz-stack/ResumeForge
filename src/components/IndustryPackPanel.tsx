import { useMemo, useState } from 'react'
import type { ResumeApplication } from '../types/application'
import type { ResumeProfile } from '../types/profile'
import { getPack, listPacks } from '../data/packs'
import { touchApplication } from '../lib/applicationFactory'

type Props = {
  profile: ResumeProfile
  application: ResumeApplication | null
  onProfilePackChange: (packId: string) => void
  onApplicationChange: (app: ResumeApplication) => void
  onInsertBullet?: (bullet: string) => void
}

/**
 * Phase 5 — industry pack engine UI.
 * Pack selection drives prompts, skeletons, keywords, and skill suggestions elsewhere.
 */
export function IndustryPackPanel({
  profile,
  application,
  onProfilePackChange,
  onApplicationChange,
  onInsertBullet,
}: Props) {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const packs = listPacks()

  const activePackId =
    application?.industryPackId || profile.defaultIndustryPackId || 'manufacturing'
  const pack = useMemo(() => getPack(activePackId), [activePackId])

  const setPackId = (id: string) => {
    onProfilePackChange(id)
    if (application) {
      onApplicationChange(
        touchApplication({ ...application, industryPackId: id }),
      )
    }
  }

  const copy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      window.setTimeout(() => setCopiedId(null), 1500)
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="space-y-4">
      <header>
        <h2 className="text-lg font-semibold text-slate-50">Industry pack</h2>
        <p className="text-sm text-slate-400">
          Pack choice changes prompts, bullet skeletons, JD keyword bank, and
          skill order on export — not just colors. Use real numbers only.
        </p>
      </header>

      <div className="rf-card space-y-3">
        <span className="rf-label">Active pack</span>
        <div className="grid gap-2 sm:grid-cols-3">
          {packs.map((p) => {
            const selected = p.id === pack.id
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPackId(p.id)}
                className={`rounded-xl border px-3 py-3 text-left transition touch-manipulation ${
                  selected
                    ? 'border-amber-700/50 bg-amber-950/30 ring-1 ring-amber-700/40'
                    : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                }`}
              >
                <p className="text-sm font-medium text-slate-100">
                  {p.shortName}
                  {p.beachhead ? (
                    <span className="ml-1 text-[10px] font-normal text-amber-400/80">
                      beachhead
                    </span>
                  ) : null}
                </p>
                <p className="mt-0.5 text-xs leading-snug text-slate-500">
                  {p.description}
                </p>
              </button>
            )
          })}
        </div>
        <p className="text-xs text-slate-500">
          Default for new applications: <strong className="text-slate-300">{pack.displayName}</strong>
          {application
            ? ` · also saved on “${application.label || 'this app'}”`
            : ' · select an application to pin pack per target'}
        </p>
      </div>

      <div className="rf-card">
        <p className="text-xs font-medium uppercase tracking-wide text-amber-400/90">
          What managers scan for
        </p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-300">
          {pack.managerScanNotes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </div>

      <div className="rf-card space-y-1">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          Summary formula
        </p>
        <p className="text-sm text-slate-200">{pack.summaryFormula}</p>
        <p className="text-xs text-slate-500">
          Skill print order:{' '}
          {pack.skillCategoryOrder.join(' → ')} · pack-relevant skills float
          first within each line.
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-100">
          Metric prompts
        </h3>
        {pack.metricPrompts.map((p) => (
          <article key={p.id} className="rf-card space-y-2">
            <p className="text-sm font-medium text-slate-100">{p.prompt}</p>
            <p className="rounded-lg border border-slate-800 bg-slate-950/60 p-2 font-mono text-xs text-slate-400">
              {p.exampleBullet}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="rf-btn text-xs"
                onClick={() => copy(p.id, p.exampleBullet)}
              >
                {copiedId === p.id ? 'Copied' : 'Copy skeleton'}
              </button>
              {onInsertBullet && (
                <button
                  type="button"
                  className="rf-btn rf-btn-primary text-xs"
                  onClick={() => onInsertBullet(p.exampleBullet)}
                >
                  Add to latest job
                </button>
              )}
            </div>
          </article>
        ))}
      </div>

      <div className="rf-card space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          Bullet skeleton picker
        </p>
        <p className="text-xs text-slate-500">
          Placeholders like {'{n}'} and {'{metric}'} — fill with real values
          only.
        </p>
        <ul className="space-y-2">
          {pack.bulletSkeletons.map((s, i) => (
            <li
              key={s}
              className="flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-900/40 p-2.5 sm:flex-row sm:items-start sm:justify-between"
            >
              <p className="font-mono text-xs text-slate-400">{s}</p>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  className="rf-btn text-xs"
                  onClick={() => copy(`sk-${i}`, s)}
                >
                  {copiedId === `sk-${i}` ? 'Copied' : 'Copy'}
                </button>
                {onInsertBullet && (
                  <button
                    type="button"
                    className="rf-btn rf-btn-primary text-xs"
                    onClick={() => onInsertBullet(s)}
                  >
                    Insert
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="rf-card">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          Keyword bank (mirror from JDs when true)
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {pack.keywordBank.map((k) => (
            <span
              key={k}
              className="rounded-md border border-slate-700 bg-slate-800/80 px-2 py-0.5 text-xs text-slate-300"
            >
              {k}
            </span>
          ))}
        </div>
      </div>

      <div className="rf-card">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          Skill clusters
        </p>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {pack.preferredSkillClusters.map((c) => (
            <li
              key={c}
              className="rounded-full border border-sky-900/40 bg-sky-950/30 px-2.5 py-0.5 text-xs text-sky-200"
            >
              {c}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-slate-500">
          Skills tab suggestions update with this pack. Export reorders
          pack-relevant skills first within each line.
        </p>
      </div>
    </div>
  )
}
