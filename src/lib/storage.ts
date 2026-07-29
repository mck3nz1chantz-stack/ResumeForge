import type { ResumeProfile } from '../types/profile'
import { sortJobsReverseChrono } from './jobOrder'
import { emptyProfile } from './profileFactory'

export const STORAGE_KEY = 'resumeforge.profile.v1'

export function loadProfile(): ResumeProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyProfile()
    const parsed = JSON.parse(raw) as ResumeProfile
    if (parsed?.schema !== 'ResumeProfile.v1') return emptyProfile()
    const jobs = sortJobsReverseChrono(
      (parsed.jobs ?? []).map((j) => ({
        ...j,
        location: j?.location ?? '',
        department: j?.department ?? '',
        employerStreet: j?.employerStreet ?? '',
        employerPhone: j?.employerPhone ?? '',
        bullets: Array.isArray(j?.bullets) ? j.bullets : [''],
        metrics: Array.isArray(j?.metrics) ? j.metrics : [],
        tools: Array.isArray(j?.tools) ? j.tools : [],
        isCurrentEmployer: Boolean(j?.isCurrentEmployer),
      })),
    )
    return {
      ...emptyProfile(),
      ...parsed,
      contact: {
        ...emptyProfile().contact,
        ...parsed.contact,
        email: parsed.contact?.email ?? '',
        emailInternal: parsed.contact?.emailInternal ?? '',
      },
      skills: {
        hard: parsed.skills?.hard ?? [],
        tools: parsed.skills?.tools ?? [],
        soft: parsed.skills?.soft ?? [],
      },
      jobs,
      education: parsed.education ?? [],
      certs: parsed.certs ?? [],
    }
  } catch {
    return emptyProfile()
  }
}

export function saveProfile(profile: ResumeProfile): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
}

export function downloadProfileJson(profile: ResumeProfile): void {
  const blob = new Blob([JSON.stringify(profile, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const slug =
    profile.contact.name.trim().toLowerCase().replace(/\s+/g, '-') || 'profile'
  a.href = url
  a.download = `resumeforge-${slug}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export async function readProfileFile(file: File): Promise<ResumeProfile> {
  const text = await file.text()
  const parsed = JSON.parse(text) as ResumeProfile
  if (parsed?.schema !== 'ResumeProfile.v1') {
    throw new Error('Not a ResumeProfile.v1 JSON file')
  }
  return parsed
}
