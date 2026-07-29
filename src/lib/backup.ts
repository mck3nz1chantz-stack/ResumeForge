/**
 * Full device backup: profile + applications + active app id.
 * Profile-only JSON still imports (legacy); operator is told apps were not in file.
 */

import type { ResumeApplication } from '../types/application'
import type { ResumeProfile } from '../types/profile'
import {
  loadActiveApplicationId,
  loadApplications,
  normalizeAppFromPartial,
  saveActiveApplicationId,
  saveApplications,
} from './applicationStorage'
import { emptyProfile, touch } from './profileFactory'
import { loadProfile, saveProfile } from './storage'

export const BACKUP_SCHEMA = 'ResumeForgeBackup.v1' as const

export type ResumeForgeBackup = {
  schema: typeof BACKUP_SCHEMA
  exportedAt: string
  profile: ResumeProfile
  applications: ResumeApplication[]
  activeApplicationId: string | null
}

export type BackupImportResult = {
  profile: ResumeProfile
  applications: ResumeApplication[]
  activeApplicationId: string | null
  /** true when file was profile-only (apps unchanged unless empty) */
  profileOnly: boolean
  message: string
}

export function buildBackup(
  profile: ResumeProfile,
  applications: ResumeApplication[],
  activeApplicationId: string | null,
): ResumeForgeBackup {
  return {
    schema: BACKUP_SCHEMA,
    exportedAt: new Date().toISOString(),
    profile,
    applications,
    activeApplicationId,
  }
}

export function downloadFullBackup(
  profile: ResumeProfile,
  applications: ResumeApplication[],
  activeApplicationId: string | null,
): void {
  const backup = buildBackup(profile, applications, activeApplicationId)
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const slug =
    profile.contact.name.trim().toLowerCase().replace(/\s+/g, '-') || 'backup'
  a.href = url
  a.download = `resumeforge-backup-${slug}.json`
  a.click()
  URL.revokeObjectURL(url)
}

/** Apply backup to localStorage and return loaded state. */
export function applyBackupResult(result: BackupImportResult): void {
  saveProfile(result.profile)
  if (!result.profileOnly) {
    saveApplications(result.applications)
    saveActiveApplicationId(result.activeApplicationId)
  }
}

export async function readBackupFile(file: File): Promise<BackupImportResult> {
  const text = await file.text()
  const parsed = JSON.parse(text) as Record<string, unknown>

  // Full backup
  if (parsed?.schema === BACKUP_SCHEMA) {
    const b = parsed as unknown as ResumeForgeBackup
    if (!b.profile || b.profile.schema !== 'ResumeProfile.v1') {
      throw new Error('Backup file missing a valid ResumeProfile.v1')
    }
    const profile = touch(normalizeProfile(b.profile))
    const appsRaw = Array.isArray(b.applications) ? b.applications : []
    const applications = appsRaw
      .filter((a) => a && (a as ResumeApplication).schema === 'ResumeApplication.v1')
      .map((a) => normalizeAppFromPartial(a as ResumeApplication, profile))
    let activeApplicationId =
      typeof b.activeApplicationId === 'string' ? b.activeApplicationId : null
    if (
      activeApplicationId &&
      !applications.some((a) => a.applicationId === activeApplicationId)
    ) {
      activeApplicationId = applications[0]?.applicationId ?? null
    }
    return {
      profile,
      applications,
      activeApplicationId,
      profileOnly: false,
      message: `Restored profile + ${applications.length} application(s)`,
    }
  }

  // Legacy profile-only
  if (parsed?.schema === 'ResumeProfile.v1') {
    const profile = touch(normalizeProfile(parsed as unknown as ResumeProfile))
    const existingApps = loadApplications(profile)
    return {
      profile,
      applications: existingApps,
      activeApplicationId: loadActiveApplicationId(),
      profileOnly: true,
      message:
        existingApps.length > 0
          ? 'Profile restored. Applications on this device were kept (file was profile-only). Use Export backup for full transfer.'
          : 'Profile restored. File was profile-only — no applications in backup.',
    }
  }

  // Single application JSON
  if (parsed?.schema === 'ResumeApplication.v1') {
    throw new Error(
      'This is a single application JSON. Use Export backup for full device transfer, or import apps from Target.',
    )
  }

  throw new Error(
    'Not a ResumeForge backup (ResumeForgeBackup.v1) or ResumeProfile.v1 file',
  )
}

function normalizeProfile(p: ResumeProfile): ResumeProfile {
  const base = emptyProfile()
  return {
    ...base,
    ...p,
    schema: 'ResumeProfile.v1',
    contact: {
      ...base.contact,
      ...p.contact,
      email: p.contact?.email ?? '',
      emailInternal: p.contact?.emailInternal ?? '',
    },
    skills: {
      hard: p.skills?.hard ?? [],
      tools: p.skills?.tools ?? [],
      soft: p.skills?.soft ?? [],
    },
    jobs: p.jobs ?? [],
    education: p.education ?? [],
    certs: p.certs ?? [],
  }
}

/** Current on-device snapshot (for completeness). */
export function loadLocalSnapshot(): ResumeForgeBackup {
  const profile = loadProfile()
  return buildBackup(
    profile,
    loadApplications(profile),
    loadActiveApplicationId(),
  )
}
