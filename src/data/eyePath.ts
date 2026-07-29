/**
 * Manager / recruiter first-pass eye path (research SSOT).
 * Not an ATS score — craft guidance only. See products/resume-forge/research/.
 */

export const EYE_PATH_SECONDS = '6–7'

/** Six fields that absorb ~80% of first-pass attention. */
export const EYE_PATH_FIELDS = [
  { id: 'name', label: 'Name', css: 'ats-name' },
  { id: 'title', label: 'Job titles', css: 'ats-job-title' },
  { id: 'company', label: 'Companies', css: 'ats-job-company' },
  { id: 'dates', label: 'Dates', css: 'ats-job-meta' },
  { id: 'education', label: 'Education', css: 'ats-section-education' },
] as const

export const EYE_PATH_HEADLINE = `First ${EYE_PATH_SECONDS}s · manager eye path`

export const EYE_PATH_BODY =
  'Recruiters spend most of the first pass on name, current and previous titles/companies, dates, and education. Bold titles and clear dates win the scan — body bullets matter on the second read.'

export const EYE_PATH_SHORT =
  'Scan order: name → titles → companies → dates → education. Details come second.'

export const EYE_PATH_SCAN_HINT =
  'Scan mode highlights those six fields only — coach view, does not change PDF export.'
