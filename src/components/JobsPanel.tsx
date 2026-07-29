import type { Job, Metric } from '../types/profile'
import { scaffoldFor } from '../data/expertScaffolds'
import { sortJobsReverseChrono } from '../lib/jobOrder'
import { emptyJob } from '../lib/profileFactory'
import { RoleMemories } from './RoleMemories'
import { SectionCoach } from './SectionCoach'
import { SectionGuide } from './SectionGuide'
import { TagInput } from './TagInput'

type Props = {
  jobs: Job[]
  onChange: (jobs: Job[]) => void
  /** Clear jobs only — keep contact + rest of master */
  onRebuildJobs?: () => void
  /** Clear jobs + skills + summary — keep contact / education / certs */
  onRebuildCareerBody?: () => void
  /** Jump to Versions to pick jobs for a resume */
  onOpenVersions?: () => void
}

export function JobsPanel({
  jobs,
  onChange,
  onRebuildJobs,
  onRebuildCareerBody,
  onOpenVersions,
}: Props) {
  const commit = (next: Job[]) => {
    onChange(sortJobsReverseChrono(next))
  }

  const update = (id: string, patch: Partial<Job>) => {
    commit(jobs.map((j) => (j.id === id ? { ...j, ...patch } : j)))
  }

  const remove = (id: string) => {
    commit(jobs.filter((j) => j.id !== id))
  }

  const add = () => {
    // New shell sorts to top until dates make it older (blank end = Present)
    commit([emptyJob(), ...jobs])
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-slate-50">
            Step 5 · Experience
          </h2>
          <p className="text-sm text-slate-400">
            Master job bank — store{' '}
            <strong className="font-medium text-slate-300">every</strong> role
            (internal + external). Order is{' '}
            <strong className="font-medium text-slate-300">
              reverse chronological by dates
            </strong>{' '}
            (newest / current first) — not the order you typed them. Each build
            checkboxes which jobs print; nothing is deleted when you uncheck a
            role on one build.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <SectionGuide guideId="jobs" />
          <button type="button" className="rf-btn rf-btn-primary" onClick={add}>
            + Add job
          </button>
        </div>
      </header>

      <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          How this works
        </p>
        <ol className="mt-1.5 list-inside list-decimal space-y-1 text-xs text-slate-400">
          <li>
            Contact (name, phone, emails) lives on the Contact tab — stable
            identity.
          </li>
          <li>
            Add all jobs to this bank (manufacturing, retail, etc. — keep them).
          </li>
          <li>
            On each version, check only the jobs for that application.
          </li>
        </ol>
        <div className="mt-3 flex flex-wrap gap-2">
          {onOpenVersions && (
            <button
              type="button"
              className="rf-btn rf-btn-primary min-h-10 text-xs"
              onClick={onOpenVersions}
            >
              Pick jobs for this build →
            </button>
          )}
          {onRebuildJobs && (
            <button
              type="button"
              className="rf-btn min-h-10 text-xs"
              title="Remove all jobs; keep contact, skills, summary, education"
              onClick={onRebuildJobs}
            >
              Rebuild · clear jobs
            </button>
          )}
          {onRebuildCareerBody && (
            <button
              type="button"
              className="rf-btn min-h-10 text-xs"
              title="Clear jobs, skills, and base summary; keep contact + education + certs"
              onClick={onRebuildCareerBody}
            >
              Rebuild · career body
            </button>
          )}
        </div>
      </div>

      {scaffoldFor('jobs') && (
        <SectionCoach
          scaffold={scaffoldFor('jobs')!}
          defaultOpen={jobs.length === 0}
          onUseFillIn={(text) => {
            if (jobs.length === 0) {
              const j = emptyJob()
              j.bullets = [text]
              onChange([j])
              return
            }
            const [first, ...rest] = jobs
            const bullets = [...first.bullets.filter((b) => b.trim()), text]
            onChange([{ ...first, bullets }, ...rest])
          }}
        />
      )}

      {jobs.length === 0 && (
        <div className="rf-card text-sm text-slate-400">
          No jobs yet. Use a scaffold above or add your current role first, then
          earlier history.
        </div>
      )}

      <div className="space-y-6">
        {jobs.map((job, index) => (
          <JobCard
            key={job.id}
            job={job}
            index={index}
            onChange={(patch) => update(job.id, patch)}
            onRemove={() => remove(job.id)}
          />
        ))}
      </div>
    </div>
  )
}

function JobCard({
  job,
  index,
  onChange,
  onRemove,
}: {
  job: Job
  index: number
  onChange: (patch: Partial<Job>) => void
  onRemove: () => void
}) {
  const setBullet = (i: number, value: string) => {
    const bullets = [...job.bullets]
    bullets[i] = value
    onChange({ bullets })
  }

  const addBullet = () => onChange({ bullets: [...job.bullets, ''] })
  const removeBullet = (i: number) =>
    onChange({ bullets: job.bullets.filter((_, idx) => idx !== i) })

  const setMetric = (i: number, patch: Partial<Metric>) => {
    const metrics = job.metrics.map((m, idx) => (idx === i ? { ...m, ...patch } : m))
    onChange({ metrics })
  }

  const addMetric = () =>
    onChange({
      metrics: [...job.metrics, { label: '', value: '', unit: '', context: '' }],
    })

  const removeMetric = (i: number) =>
    onChange({ metrics: job.metrics.filter((_, idx) => idx !== i) })

  return (
    <article className="rf-card space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-amber-400/90">
          Role {index + 1}
          {job.title || job.company
            ? ` · ${[job.title, job.company].filter(Boolean).join(' @ ')}`
            : ''}
        </h3>
        <button type="button" className="rf-btn rf-btn-danger text-xs" onClick={onRemove}>
          Remove
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label>
          <span className="rf-label">Employer / company name</span>
          <input
            className="rf-input"
            value={job.company}
            onChange={(e) => onChange({ company: e.target.value })}
            placeholder="e.g. Acme Manufacturing"
            autoComplete="organization"
          />
        </label>
        <label>
          <span className="rf-label">Your job title</span>
          <input
            className="rf-input"
            value={job.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="e.g. Production Technician"
            autoComplete="organization-title"
          />
        </label>
        <label>
          <span className="rf-label">Start (YYYY-MM)</span>
          <input
            className="rf-input"
            value={job.start}
            onChange={(e) => onChange({ start: e.target.value })}
            placeholder="2022-03"
          />
        </label>
        <label>
          <span className="rf-label">End (blank = present)</span>
          <input
            className="rf-input"
            value={job.end ?? ''}
            onChange={(e) => onChange({ end: e.target.value || null })}
            placeholder="present"
          />
        </label>
      </div>

      {/* Employer place — clear ATS guidance */}
      <div className="rounded-xl border border-slate-700 bg-slate-950/50 p-3 space-y-3">
        <div>
          <p className="text-sm font-medium text-slate-100">
            Where you worked (employer place)
          </p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            The resume prints <strong className="font-medium text-slate-400">City, ST</strong>{' '}
            next to dates (e.g. Muskegon, MI). Full street address and the plant
            switchboard are almost never needed on ATS resumes — your own phone
            and email live under <strong className="font-medium text-slate-400">Contact</strong>,
            not on each job.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="rf-label">
              Worksite location on resume{' '}
              <span className="font-normal text-slate-500">(City, ST)</span>
            </span>
            <input
              className="rf-input"
              value={job.location}
              onChange={(e) => onChange({ location: e.target.value })}
              placeholder="Muskegon, MI"
              autoComplete="address-level2"
            />
            <span className="mt-1 block text-[11px] text-slate-500">
              Prints on paper/PDF. Prefer city + state (or city + country). Skip
              suite numbers and full street for most applications.
            </span>
          </label>
          <label>
            <span className="rf-label">Department / plant / area</span>
            <input
              className="rf-input"
              value={job.department ?? ''}
              onChange={(e) => onChange({ department: e.target.value })}
              placeholder="Assembly · Line 2 · Shipping"
            />
            <span className="mt-1 block text-[11px] text-slate-500">
              Optional · may show after location on the resume.
            </span>
          </label>
          <label>
            <span className="rf-label">
              Employer phone{' '}
              <span className="font-normal text-slate-500">(optional notes)</span>
            </span>
            <input
              className="rf-input"
              type="tel"
              value={job.employerPhone ?? ''}
              onChange={(e) => onChange({ employerPhone: e.target.value })}
              placeholder="Usually leave blank"
              autoComplete="off"
            />
            <span className="mt-1 block text-[11px] text-slate-500">
              Bank-only · <strong className="font-medium text-slate-400">not</strong>{' '}
              printed. Do not put your cell here.
            </span>
          </label>
          <label className="sm:col-span-2">
            <span className="rf-label">
              Employer street address{' '}
              <span className="font-normal text-slate-500">(optional notes)</span>
            </span>
            <input
              className="rf-input"
              value={job.employerStreet ?? ''}
              onChange={(e) => onChange({ employerStreet: e.target.value })}
              placeholder="123 Plant Rd — optional private note"
              autoComplete="off"
            />
            <span className="mt-1 block text-[11px] text-slate-500">
              Bank-only · <strong className="font-medium text-slate-400">not</strong>{' '}
              printed. Keep full street here if you need it later; City, ST above
              is what recruiters see.
            </span>
          </label>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-300">
        <input
          type="checkbox"
          checked={job.isCurrentEmployer}
          onChange={(e) => onChange({ isCurrentEmployer: e.target.checked })}
          className="size-4 rounded border-slate-600 bg-slate-900 text-amber-500 focus:ring-amber-500/40"
        />
        Current employer (for internal promotion path later)
      </label>

      <TagInput
        label="Tools / methods"
        hint="Multi-word OK — e.g. Bill of Materials. Add one at a time."
        tags={job.tools}
        onChange={(tools) => onChange({ tools })}
        placeholder="Bill of Materials, torque wrench…"
        suggestions={[
          'Bill of Materials',
          '5S',
          'LOTO',
          'forklift',
          'calipers',
          'standard work',
          'MES',
          'changeovers',
        ]}
      />

      <RoleMemories
        defaultOpen={
          job.bullets.filter((b) => b.trim()).length === 0 &&
          Boolean(job.title || job.company)
        }
        onAddBullets={(lines) => {
          const existing = job.bullets.filter((b) => b.trim())
          onChange({ bullets: [...existing, ...lines] })
        }}
      />

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="rf-label mb-0">Impact bullets</span>
          <button type="button" className="rf-btn text-xs" onClick={addBullet}>
            + Bullet
          </button>
        </div>
        <div className="space-y-2">
          {job.bullets.map((b, i) => (
            <div key={i} className="flex gap-2">
              <textarea
                className="rf-input min-h-[64px] resize-y"
                value={b}
                onChange={(e) => setBullet(i, e.target.value)}
                placeholder="Action + what + how + result (use real numbers)"
              />
              <button
                type="button"
                className="rf-btn rf-btn-danger shrink-0 self-start text-xs"
                onClick={() => removeBullet(i)}
                disabled={job.bullets.length <= 1}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="rf-label mb-0">Structured metrics (optional)</span>
          <button type="button" className="rf-btn text-xs" onClick={addMetric}>
            + Metric
          </button>
        </div>
        {job.metrics.length === 0 && (
          <p className="text-xs text-slate-500">
            e.g. scrap −18%, crew of 12, 180 days LTI-free — use Manufacturing prompts for ideas.
          </p>
        )}
        <div className="space-y-2">
          {job.metrics.map((m, i) => (
            <div
              key={i}
              className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_4.5rem_4.5rem_1fr_auto]"
            >
              <input
                className="rf-input"
                placeholder="label (e.g. scrap reduction)"
                value={m.label}
                onChange={(e) => setMetric(i, { label: e.target.value })}
              />
              <input
                className="rf-input"
                placeholder="value"
                value={m.value}
                onChange={(e) => setMetric(i, { value: e.target.value })}
                inputMode="decimal"
              />
              <input
                className="rf-input"
                placeholder="unit"
                value={m.unit ?? ''}
                onChange={(e) => setMetric(i, { unit: e.target.value })}
              />
              <input
                className="rf-input"
                placeholder="context"
                value={m.context ?? ''}
                onChange={(e) => setMetric(i, { context: e.target.value })}
              />
              <button
                type="button"
                className="rf-btn rf-btn-danger min-h-11 text-xs sm:min-h-10"
                onClick={() => removeMetric(i)}
              >
                Remove metric
              </button>
            </div>
          ))}
        </div>
      </div>
    </article>
  )
}
