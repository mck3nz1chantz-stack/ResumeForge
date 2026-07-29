import type { Job } from '../types/profile'
import { formatDateRange } from '../lib/formatDates'
import {
  isAllJobsSelected,
  isJobSelected,
  masterJobIds,
  selectAllJobs,
  selectCurrentEmployerJobs,
  selectNoJobs,
  selectedJobIds,
  toggleJobSelection,
} from '../lib/featuredJobs'

type Props = {
  jobs: Job[]
  featuredJobIds: string[]
  onChange: (featuredJobIds: string[]) => void
  /** Jump to Jobs tab to grow the master bank */
  onOpenJobs?: () => void
  compact?: boolean
}

/**
 * Master career bank → per-version checkboxes.
 * Unchecked roles stay in the master profile; they simply do not print here.
 */
export function VersionJobPicker({
  jobs,
  featuredJobIds,
  onChange,
  onOpenJobs,
  compact = false,
}: Props) {
  const allIds = masterJobIds(jobs)
  const selected = selectedJobIds(featuredJobIds, allIds)
  const allOn = isAllJobsSelected(featuredJobIds, allIds)
  const n = selected.length
  const total = jobs.length

  return (
    <div
      className={
        compact
          ? 'space-y-2'
          : 'rounded-xl border border-amber-900/40 bg-amber-950/15 p-3 sm:p-4'
      }
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3
            className={
              compact
                ? 'text-sm font-semibold text-slate-100'
                : 'text-sm font-semibold text-amber-100'
            }
          >
            Jobs on this resume
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Master bank holds every role. Check only what belongs on{' '}
            <strong className="font-medium text-slate-400">this version</strong>
            {total > 0 ? (
              <>
                {' '}
                ·{' '}
                <span className="text-slate-300">
                  {n} of {total} selected
                </span>
              </>
            ) : null}
          </p>
        </div>
        {onOpenJobs && (
          <button
            type="button"
            className="rf-btn min-h-9 shrink-0 text-xs"
            onClick={onOpenJobs}
          >
            + Add to bank
          </button>
        )}
      </div>

      {total === 0 ? (
        <p className="text-sm text-slate-500">
          No jobs in the master bank yet. Add roles under Jobs — they stay
          saved even when unchecked on a version.
          {onOpenJobs ? (
            <>
              {' '}
              <button
                type="button"
                className="font-medium text-amber-300/90 underline decoration-amber-700/50 underline-offset-2"
                onClick={onOpenJobs}
              >
                Open Jobs
              </button>
            </>
          ) : null}
        </p>
      ) : (
        <>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              className={`rf-btn min-h-9 text-xs ${allOn ? 'rf-btn-primary' : ''}`}
              onClick={() => onChange(selectAllJobs())}
            >
              All jobs
            </button>
            <button
              type="button"
              className="rf-btn min-h-9 text-xs"
              onClick={() => onChange(selectCurrentEmployerJobs(jobs))}
              title="Only roles marked current employer"
            >
              Current employer only
            </button>
            <button
              type="button"
              className="rf-btn min-h-9 text-xs"
              onClick={() => onChange(selectNoJobs())}
            >
              None
            </button>
          </div>

          <ul className="mt-2 space-y-1.5">
            {jobs.map((job) => {
              const checked = isJobSelected(job.id, featuredJobIds, allIds)
              const title =
                [job.title, job.company].filter(Boolean).join(' @ ') ||
                'Untitled role'
              const dates = formatDateRange(job.start, job.end)
              return (
                <li key={job.id}>
                  <label
                    className={`flex cursor-pointer items-start gap-2.5 rounded-lg border px-2.5 py-2 text-sm transition-colors ${
                      checked
                        ? 'border-amber-800/40 bg-amber-950/25 text-slate-100'
                        : 'border-slate-800 bg-slate-950/40 text-slate-400'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="mt-0.5 size-4 shrink-0 rounded border-slate-600 bg-slate-900 text-amber-500"
                      checked={checked}
                      onChange={() =>
                        onChange(
                          toggleJobSelection(job.id, featuredJobIds, allIds),
                        )
                      }
                    />
                    <span className="min-w-0 flex-1">
                      <span className="font-medium">{title}</span>
                      {job.isCurrentEmployer && (
                        <span className="ml-1.5 text-[10px] font-semibold uppercase tracking-wide text-amber-400/90">
                          current
                        </span>
                      )}
                      {dates ? (
                        <span className="mt-0.5 block text-xs text-slate-500">
                          {dates}
                          {job.location?.trim()
                            ? ` · ${job.location.trim()}`
                            : ''}
                        </span>
                      ) : null}
                    </span>
                  </label>
                </li>
              )
            })}
          </ul>

          {n === 0 && (
            <p className="text-xs text-amber-300/90">
              No jobs selected — this resume will have an empty Experience
              section until you check at least one role.
            </p>
          )}
          {!allOn && n > 0 && (
            <p className="text-[11px] text-slate-500">
              Unchecked roles stay in your master bank for other versions.
            </p>
          )}
        </>
      )}
    </div>
  )
}
