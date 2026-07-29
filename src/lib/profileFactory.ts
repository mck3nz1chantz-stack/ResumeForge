import type { Job, ResumeProfile } from '../types/profile'
import { uid } from './id'

export function emptyProfile(): ResumeProfile {
  return {
    schema: 'ResumeProfile.v1',
    profileId: uid('profile'),
    updatedAt: new Date().toISOString(),
    defaultIndustryPackId: 'manufacturing',
    contact: {
      name: '',
      email: '',
      emailInternal: '',
      phone: '',
      location: '',
      linkedin: '',
      portfolio: '',
    },
    baseSummary: '',
    jobs: [],
    skills: { hard: [], tools: [], soft: [] },
    education: [],
    certs: [],
  }
}

export function emptyJob(): Job {
  return {
    id: uid('job'),
    company: '',
    title: '',
    start: '',
    end: null,
    location: '',
    department: '',
    employerStreet: '',
    employerPhone: '',
    bullets: [''],
    metrics: [],
    tools: [],
    isCurrentEmployer: false,
  }
}

export function touch(profile: ResumeProfile): ResumeProfile {
  return { ...profile, updatedAt: new Date().toISOString() }
}

/**
 * Rebuild career content while keeping identity (name, phones, emails, links).
 * Use when you want a fresh job bank without retyping contact.
 */
export function rebuildMasterBody(
  profile: ResumeProfile,
  scope: 'jobs-only' | 'career-body',
): ResumeProfile {
  const contact = { ...profile.contact }
  if (scope === 'jobs-only') {
    return touch({
      ...profile,
      contact,
      jobs: [],
    })
  }
  return touch({
    ...profile,
    contact,
    baseSummary: '',
    jobs: [],
    skills: { hard: [], tools: [], soft: [] },
    // Keep education + certs — usually stable across rebuilds
  })
}
