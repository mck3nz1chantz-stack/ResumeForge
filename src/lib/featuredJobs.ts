/**
 * Per-version job selection from the master career bank.
 *
 * Storage (`featuredJobIds`):
 * - `[]` (empty) → include **all** master jobs
 * - `['__none__']` → include **no** jobs (edge case)
 * - `[id, …]` → include only those ids
 *
 * Print order is always reverse-chronological by job dates (see `jobOrder.ts`),
 * not the order ids were checked or stored.
 */

export const FEATURED_NONE = '__none__'

export function masterJobIds(
  jobs: { id: string }[],
): string[] {
  return jobs.map((j) => j.id)
}

/** Effective set of job ids that print on this version. */
export function selectedJobIds(
  featuredJobIds: string[] | undefined | null,
  allIds: string[],
): string[] {
  const featured = (featuredJobIds ?? []).filter(Boolean)
  if (featured.length === 0) return [...allIds]
  if (featured.includes(FEATURED_NONE)) return []
  const set = new Set(featured)
  // Preserve master bank order
  return allIds.filter((id) => set.has(id))
}

export function isJobSelected(
  jobId: string,
  featuredJobIds: string[] | undefined | null,
  allIds: string[],
): boolean {
  return selectedJobIds(featuredJobIds, allIds).includes(jobId)
}

/** True when every master job prints (empty filter). */
export function isAllJobsSelected(
  featuredJobIds: string[] | undefined | null,
  allIds: string[],
): boolean {
  if (allIds.length === 0) return true
  const featured = (featuredJobIds ?? []).filter(Boolean)
  if (featured.length === 0) return true
  if (featured.includes(FEATURED_NONE)) return false
  return selectedJobIds(featuredJobIds, allIds).length === allIds.length
}

/**
 * Normalize for storage after a UI change:
 * all selected → `[]`; none → `[FEATURED_NONE]`; else explicit ids.
 */
export function toFeaturedJobIds(
  selected: string[],
  allIds: string[],
): string[] {
  if (allIds.length === 0) return []
  const set = new Set(selected)
  const ordered = allIds.filter((id) => set.has(id))
  if (ordered.length === 0) return [FEATURED_NONE]
  if (ordered.length === allIds.length) return []
  return ordered
}

export function toggleJobSelection(
  jobId: string,
  featuredJobIds: string[] | undefined | null,
  allIds: string[],
): string[] {
  const current = selectedJobIds(featuredJobIds, allIds)
  const on = current.includes(jobId)
  const next = on
    ? current.filter((id) => id !== jobId)
    : allIds.filter((id) => current.includes(id) || id === jobId)
  return toFeaturedJobIds(next, allIds)
}

export function selectAllJobs(): string[] {
  return []
}

export function selectNoJobs(): string[] {
  return [FEATURED_NONE]
}

/** Keep only jobs flagged isCurrentEmployer. */
export function selectCurrentEmployerJobs(
  jobs: { id: string; isCurrentEmployer?: boolean }[],
): string[] {
  const ids = jobs.filter((j) => j.isCurrentEmployer).map((j) => j.id)
  if (ids.length === 0) return selectNoJobs()
  if (ids.length === jobs.length) return selectAllJobs()
  return ids
}

/**
 * Apply featured filter for resolve/PDF.
 * Empty featured → all jobs. FEATURED_NONE → none. Else match ids.
 * Preserves the order of `jobs` (caller should pass reverse-chrono list).
 */
export function filterJobsByFeatured<T extends { id: string }>(
  jobs: T[],
  featuredJobIds: string[] | undefined | null,
): T[] {
  const featured = (featuredJobIds ?? []).filter(Boolean)
  if (featured.length === 0) return jobs
  if (featured.includes(FEATURED_NONE)) return []
  const set = new Set(featured)
  return jobs.filter((j) => set.has(j.id))
}
