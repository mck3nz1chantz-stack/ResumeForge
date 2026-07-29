/**
 * Reverse-chronological job order (ATS / recruiter default).
 * Order is determined by dates — not input order or list position.
 *
 * Sort rules (newest first):
 * 1. End date DESC — blank / null / "Present" = current role (top)
 * 2. Start date DESC as tiebreaker
 * 3. isCurrentEmployer before non-current when dates match
 * 4. Stable original index for remaining ties
 */

export type JobLike = {
  start: string
  end: string | null
  isCurrentEmployer?: boolean
}

/** YYYY-MM → yyyy*100+mm; YYYY → yyyy*100+1 (start of year). Higher = later. */
export function parseJobDateValue(
  raw: string | null | undefined,
): number | null {
  if (raw == null) return null
  const s = String(raw).trim()
  if (!s) return null
  if (/^(present|current|now|today)$/i.test(s)) return PRESENT
  const ym = s.match(/^(\d{4})-(\d{1,2})$/)
  if (ym) {
    const y = Number(ym[1])
    const m = Math.min(12, Math.max(1, Number(ym[2])))
    return y * 100 + m
  }
  if (/^\d{4}$/.test(s)) return Number(s) * 100 + 1
  return null
}

/** Sentinel above any real YYYY-MM (9999-12). */
const PRESENT = 9999_12

function endSortValue(job: JobLike): number {
  if (job.end == null || !String(job.end).trim()) return PRESENT
  const n = parseJobDateValue(job.end)
  // Unparseable free-text end → treat as past-unknown (bottom of dated band)
  return n ?? 0
}

function startSortValue(job: JobLike): number {
  const n = parseJobDateValue(job.start)
  // Empty start while drafting: keep near top of its end-bucket
  return n ?? PRESENT - 1
}

/**
 * Newest / current first. Pure function — does not mutate input.
 */
export function sortJobsReverseChrono<T extends JobLike>(jobs: T[]): T[] {
  return jobs
    .map((job, index) => ({ job, index }))
    .sort((a, b) => {
      const endA = endSortValue(a.job)
      const endB = endSortValue(b.job)
      if (endA !== endB) return endB - endA

      const startA = startSortValue(a.job)
      const startB = startSortValue(b.job)
      if (startA !== startB) return startB - startA

      const curA = a.job.isCurrentEmployer ? 1 : 0
      const curB = b.job.isCurrentEmployer ? 1 : 0
      if (curA !== curB) return curB - curA

      return a.index - b.index
    })
    .map(({ job }) => job)
}

/** True if two job lists are the same ids in the same order. */
export function sameJobOrder(
  a: { id: string }[],
  b: { id: string }[],
): boolean {
  if (a.length !== b.length) return false
  return a.every((j, i) => j.id === b[i]?.id)
}
