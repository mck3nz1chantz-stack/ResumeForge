import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AchievementsPanel } from './components/AchievementsPanel'
import { ApplicationsPanel } from './components/ApplicationsPanel'
import { BuildContinueBar } from './components/BuildContinueBar'
import { BuildStepTabs } from './components/BuildStepTabs'
import { ContactPanel } from './components/ContactPanel'
import { CoverLetterPanel } from './components/CoverLetterPanel'
import { CertsPanel, EducationPanel } from './components/EducationCertsPanel'
import { CtaButton } from './components/CtaButton'
import { DeviceDataBanner } from './components/DeviceDataBanner'
import { HowToUseDialog } from './components/HowToUseDialog'
import {
  GITHUB_REPO_HINT,
  GITHUB_REPO_LABEL,
  GITHUB_REPO_URL,
} from './data/projectLinks'
import { GuidedOnboard } from './components/GuidedOnboard'
import { LeverageWizard } from './components/LeverageWizard'
import { IndustryPackPanel } from './components/IndustryPackPanel'
import { InternalPromoPanel } from './components/InternalPromoPanel'
import { JdTailorPanel } from './components/JdTailorPanel'
import { JobsPanel } from './components/JobsPanel'
import { LivePreviewPane } from './components/LivePreviewPane'
import {
  MobileBottomNav,
  type MobileTab,
} from './components/MobileBottomNav'
import { MobileMoreMenu } from './components/MobileMoreMenu'
import { PreviewPanel } from './components/PreviewPanel'
import { ResumeDocument } from './components/ResumeDocument'
import { SkillsPanel } from './components/SkillsPanel'
import { SummaryPanel } from './components/SummaryPanel'
import {
  NewBuildDialog,
  type NewBuildDraft,
} from './components/NewBuildDialog'
import { VersionSwitcher } from './components/VersionSwitcher'
import { evaluateThreeCs } from './data/threeCs'
import { getPack, resolvePackId } from './data/packs'
import { useDialogFocus } from './hooks/useDialogFocus'
import type { ResumeApplication, TemplateId } from './types/application'
import { downloadAtsPdf, pdfResultMessage } from './lib/exportPdf'
import {
  downloadFullBackup,
  readBackupFile,
} from './lib/backup'
import {
  defaultLabel,
  duplicateApplication,
  emptyApplication,
  touchApplication,
  withTone,
} from './lib/applicationFactory'
import { sortJobsReverseChrono } from './lib/jobOrder'
import {
  emptyProfile,
  rebuildMasterBody,
  touch,
} from './lib/profileFactory'
import { resolveResume } from './lib/resolveResume'
import {
  loadActiveApplicationId,
  loadApplications,
  saveActiveApplicationId,
  saveApplications,
} from './lib/applicationStorage'
import {
  loadOnboardState,
  markOnboardDone,
  profileHasHistory,
  resetOnboardState,
  shouldShowOnboarding,
  type OnboardPath,
} from './lib/onboardingStorage'
import { loadProfile, saveProfile } from './lib/storage'
import type { NavSection, ResumeProfile } from './types/profile'

/** Min gap between “Saved” header flashes while typing. */
const SAVE_FLASH_GAP_MS = 2500

/** Desktop nav — resume paper order (layout first, then header → body). */
const NAV_GROUPS: {
  label: string
  items: { id: NavSection; label: string }[]
}[] = [
  {
    label: 'Build · resume order',
    items: [
      { id: 'preview', label: '1 · Layout' },
      { id: 'contact', label: '2 · Contact' },
      { id: 'summary', label: '3 · Summary' },
      { id: 'skills', label: '4 · Skills' },
      { id: 'jobs', label: '5 · Experience' },
      { id: 'education', label: '6 · Education' },
      { id: 'certs', label: '7 · Certs' },
      { id: 'applications', label: '8 · This build' },
    ],
  },
  {
    label: 'Tune this build',
    items: [
      { id: 'jd-tailor', label: 'JD keywords' },
      { id: 'internal-promo', label: 'Internal promo' },
      { id: 'cover-letter', label: 'Cover letter' },
    ],
  },
  {
    label: 'Tools',
    items: [
      { id: 'library', label: 'Achievements' },
      { id: 'industry-pack', label: 'Industry pack' },
    ],
  },
]

export default function App() {
  const [profile, setProfile] = useState<ResumeProfile>(() => loadProfile())
  const [applications, setApplications] = useState<ResumeApplication[]>(() =>
    loadApplications(loadProfile()),
  )
  const [activeAppId, setActiveAppId] = useState<string | null>(() =>
    loadActiveApplicationId(),
  )
  /** Start at Layout so template choice leads the build path */
  const [section, setSection] = useState<NavSection>('preview')
  /** Mobile bottom-nav "More" hub (vs a specific more-section form) */
  const [moreHub, setMoreHub] = useState(false)
  /** Mobile live resume sheet */
  const [liveOpen, setLiveOpen] = useState(false)
  /** Exit animation before unmount */
  const [liveClosing, setLiveClosing] = useState(false)
  const [saveFlash, setSaveFlash] = useState(false)
  /** Explicit version Save feedback (separate from profile autosave flash). */
  const [versionSaveFlash, setVersionSaveFlash] = useState(false)
  const [newBuildOpen, setNewBuildOpen] = useState(false)
  const [howToOpen, setHowToOpen] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [importNotice, setImportNotice] = useState<string | null>(null)
  /** Non-error PDF status (e.g. text-layout fallback used) */
  const [pdfNotice, setPdfNotice] = useState<string | null>(null)
  const [showGuide, setShowGuide] = useState(() => {
    const p = loadProfile()
    return shouldShowOnboarding(loadOnboardState(), profileHasHistory(p))
  })
  /** First-run / restart: pick target-first leverage vs full history */
  const [guideKind, setGuideKind] = useState<'pick' | 'leverage' | 'full'>(
    'pick',
  )
  const fileRef = useRef<HTMLInputElement>(null)
  const skipFirstSave = useRef(true)
  const lastSaveFlashAt = useRef(0)
  const liveBarRef = useRef<HTMLButtonElement>(null)
  const liveSheetRef = useRef<HTMLDivElement>(null)

  const closeLiveSheet = useCallback(() => {
    if (!liveOpen || liveClosing) return
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setLiveOpen(false)
      setLiveClosing(false)
      return
    }
    setLiveClosing(true)
    window.setTimeout(() => {
      setLiveOpen(false)
      setLiveClosing(false)
    }, 180)
  }, [liveOpen, liveClosing])

  const openLiveSheet = useCallback(() => {
    setLiveClosing(false)
    setLiveOpen(true)
  }, [])

  // Escape closes mobile live sheet
  useEffect(() => {
    if (!liveOpen || liveClosing) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLiveSheet()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [liveOpen, liveClosing, closeLiveSheet])

  // Focus trap + body scroll lock for mobile live sheet
  useDialogFocus(liveOpen && !liveClosing, liveSheetRef, {
    returnFocusRef: liveBarRef,
    lockScroll: true,
    initialFocusSelector: '[data-rf-close]',
  })

  const activeApplication = useMemo(
    () => applications.find((a) => a.applicationId === activeAppId) ?? null,
    [applications, activeAppId],
  )

  const activePackId = useMemo(
    () =>
      resolvePackId(
        activeApplication?.industryPackId,
        profile.defaultIndustryPackId,
      ),
    [activeApplication, profile.defaultIndustryPackId],
  )
  const activePack = useMemo(() => getPack(activePackId), [activePackId])

  const resolved = useMemo(
    () => resolveResume(profile, activeApplication),
    [profile, activeApplication],
  )

  const threeC = useMemo(
    () => evaluateThreeCs(profile, resolved),
    [profile, resolved],
  )

  const update = useCallback(
    (patch: Partial<ResumeProfile> | ((p: ResumeProfile) => ResumeProfile)) => {
      setProfile((prev) => {
        const next =
          typeof patch === 'function' ? patch(prev) : { ...prev, ...patch }
        // Always keep master bank reverse-chronological by dates
        return touch({
          ...next,
          jobs: sortJobsReverseChrono(next.jobs ?? []),
        })
      })
    },
    [],
  )

  const setApps = useCallback((apps: ResumeApplication[]) => {
    setApplications(apps)
    saveApplications(apps)
  }, [])

  const selectApp = useCallback((id: string | null) => {
    setActiveAppId(id)
    saveActiveApplicationId(id)
  }, [])

  const patchActiveApp = useCallback((app: ResumeApplication) => {
    setApplications((prev) => {
      const next = prev.map((a) =>
        a.applicationId === app.applicationId ? app : a,
      )
      saveApplications(next)
      return next
    })
  }, [])

  const flashVersionSaved = useCallback(() => {
    setVersionSaveFlash(true)
    window.setTimeout(() => setVersionSaveFlash(false), 1600)
  }, [])

  /** Explicit Save when a version is already selected — flush master + app. */
  const saveCurrentVersion = useCallback(() => {
    saveProfile(profile)
    if (activeApplication) {
      const next = touchApplication(activeApplication)
      setApplications((prev) => {
        const list = prev.map((a) =>
          a.applicationId === next.applicationId ? next : a,
        )
        saveApplications(list)
        return list
      })
    } else {
      saveApplications(applications)
    }
    flashVersionSaved()
    lastSaveFlashAt.current = Date.now()
    setSaveFlash(true)
    window.setTimeout(() => setSaveFlash(false), 900)
  }, [profile, activeApplication, applications, flashVersionSaved])

  /**
   * Save / Save as → named application version (master profile stays shared).
   */
  const commitNamedVersion = useCallback(
    (label: string, mode: 'save' | 'save-as') => {
      const trimmed = label.trim() || 'Untitled version'
      saveProfile(profile)

      if (mode === 'save-as' && activeApplication) {
        const copy = {
          ...duplicateApplication(activeApplication),
          label: trimmed,
        }
        setApps([copy, ...applications])
        selectApp(copy.applicationId)
        flashVersionSaved()
        return
      }

      // Fresh version from master (optionally seed layout from active)
      const seed = activeApplication
      const app = emptyApplication(profile, {
        label: trimmed,
        targetTitle: seed?.targetTitle ?? '',
        targetCompany: seed?.targetCompany ?? '',
        currentTitle: seed?.currentTitle ?? '',
        mode: seed?.mode ?? 'external',
        industryPackId: seed?.industryPackId ?? profile.defaultIndustryPackId,
        tone: seed?.tone ?? 'ats-external',
        templateId: seed?.templateId ?? 'ats-classic',
        includeProfessionalEmail: seed?.includeProfessionalEmail ?? true,
        includeInternalEmail:
          seed?.includeInternalEmail ??
          (seed?.mode === 'internal' ? true : false),
        featuredJobIds: seed ? [...seed.featuredJobIds] : [],
        featuredSkillKeys: seed ? [...(seed.featuredSkillKeys ?? [])] : [],
        summaryOverride: seed?.summaryOverride ?? '',
        jobDescription: seed?.jobDescription ?? '',
        jdKeywords: seed ? [...seed.jdKeywords] : [],
        pinnedBulletKeys: seed ? [...seed.pinnedBulletKeys] : [],
        internalCompanyFilter: seed?.internalCompanyFilter ?? false,
        coverLetter: seed?.coverLetter ?? '',
        printPrefs: seed?.printPrefs,
      })
      setApps([app, ...applications])
      selectApp(app.applicationId)
      flashVersionSaved()
    },
    [
      profile,
      activeApplication,
      applications,
      setApps,
      selectApp,
      flashVersionSaved,
    ],
  )

  useEffect(() => {
    if (skipFirstSave.current) {
      skipFirstSave.current = false
      return
    }
    saveProfile(profile)
    // Autosave always; flash header only on a cool-down so typing is quiet
    const now = Date.now()
    if (now - lastSaveFlashAt.current < SAVE_FLASH_GAP_MS) return
    lastSaveFlashAt.current = now
    setSaveFlash(true)
    const t = window.setTimeout(() => setSaveFlash(false), 900)
    return () => window.clearTimeout(t)
  }, [profile])

  const exportFullBackup = useCallback(() => {
    downloadFullBackup(profile, applications, activeAppId)
  }, [profile, applications, activeAppId])

  useEffect(() => {
    if (
      activeAppId &&
      !applications.some((a) => a.applicationId === activeAppId)
    ) {
      const next = applications[0]?.applicationId ?? null
      setActiveAppId(next)
      saveActiveApplicationId(next)
    }
  }, [applications, activeAppId])

  const insertBulletToLatestJob = (bullet: string) => {
    if (profile.jobs.length === 0) {
      setMoreHub(false)
      setSection('jobs')
      return
    }
    const ordered = sortJobsReverseChrono(profile.jobs)
    const first = ordered[0]
    const title =
      [first.title, first.company].filter(Boolean).join(' @ ') ||
      'most recent job'
    if (profile.jobs.length > 1) {
      const ok = window.confirm(
        `Add this bullet to:\n\n${title}\n\n(Most recent role by dates — reverse chronological.)`,
      )
      if (!ok) return
    }
    setProfile((prev) => {
      if (prev.jobs.length === 0) return touch(prev)
      const jobs = sortJobsReverseChrono(prev.jobs).map((j, i) =>
        i === 0
          ? { ...j, bullets: [...j.bullets.filter((b) => b.trim()), bullet] }
          : j,
      )
      setMoreHub(false)
      setSection('jobs')
      return touch({ ...prev, jobs })
    })
  }

  const ensureApplicationForTemplate = (templateId: TemplateId) => {
    const app = emptyApplication(profile, {
      label: 'Working draft',
      templateId,
    })
    setApps([app, ...applications])
    selectApp(app.applicationId)
  }

  const onImport = async (file: File | undefined) => {
    if (!file) return
    setImportError(null)
    setImportNotice(null)
    try {
      const result = await readBackupFile(file)
      const profileIn = {
        ...result.profile,
        jobs: sortJobsReverseChrono(result.profile.jobs ?? []),
      }
      setProfile(profileIn)
      if (!result.profileOnly) {
        setApplications(result.applications)
        saveApplications(result.applications)
        setActiveAppId(result.activeApplicationId)
        saveActiveApplicationId(result.activeApplicationId)
      }
      saveProfile(profileIn)
      setImportNotice(result.message)
      window.setTimeout(() => setImportNotice(null), 5000)
    } catch (e) {
      setImportError(e instanceof Error ? e.message : 'Import failed')
    }
  }

  const exportPdf = async () => {
    setPdfNotice(null)
    const result = await downloadAtsPdf(resolved)
    const msg = pdfResultMessage(result)
    if (msg) {
      setPdfNotice(msg)
      window.setTimeout(() => setPdfNotice(null), 9000)
    }
  }

  const completeGuide = (opts: {
    path: OnboardPath
    internalCompany: string
    application: ResumeApplication | null
    nextSection?: 'preview' | 'jobs' | 'applications' | 'summary'
  }) => {
    markOnboardDone(opts.path, {
      internalCompany: opts.internalCompany,
    })
    if (opts.application) {
      setApplications((prev) => {
        const next = [opts.application!, ...prev]
        saveApplications(next)
        return next
      })
      setActiveAppId(opts.application.applicationId)
      saveActiveApplicationId(opts.application.applicationId)
    }
    setSection(
      opts.nextSection ?? (opts.application ? 'applications' : 'jobs'),
    )
    setMoreHub(false)
    setShowGuide(false)
    setGuideKind('pick')
  }

  const skipGuide = () => {
    markOnboardDone(null, { skipped: true })
    setShowGuide(false)
    setGuideKind('pick')
  }

  const restartGuide = () => {
    resetOnboardState()
    setGuideKind('pick')
    setShowGuide(true)
    setMoreHub(false)
  }

  const startLeverage = () => {
    setGuideKind('leverage')
    setShowGuide(true)
    setMoreHub(false)
  }

  const handleMobileNav = (next: NavSection, tab: MobileTab) => {
    closeLiveSheet()
    if (tab === 'more') {
      setMoreHub(true)
      return
    }
    setMoreHub(false)
    setSection(next)
  }

  const openMoreSection = (s: NavSection) => {
    setMoreHub(false)
    setSection(s)
  }

  const jobCount = profile.jobs.length

  const resetProfile = () => {
    if (
      confirm(
        'Clear entire master profile (contact + jobs + skills)? Versions stay until you delete them. Prefer “Rebuild” on Jobs if you only want a new job bank.',
      )
    ) {
      setProfile(emptyProfile())
    }
  }

  /** Primary CTA: new resume build for a role (master bank stays). */
  const startNewBuild = useCallback(
    (draft: NewBuildDraft) => {
      const label =
        draft.label.trim() ||
        defaultLabel(draft.targetTitle, draft.targetCompany, draft.mode)
      let app = emptyApplication(profile, {
        label,
        mode: draft.mode,
        targetTitle: draft.targetTitle,
        targetCompany: draft.targetCompany,
        includeProfessionalEmail: true,
        includeInternalEmail: draft.mode === 'internal',
        tone: draft.mode === 'internal' ? 'internal-promo' : 'ats-external',
        templateId:
          draft.mode === 'internal' ? 'internal-promotion' : 'ats-classic',
      })
      if (draft.mode === 'internal') {
        app = withTone(app, 'internal-promo')
        app = { ...app, label }
      }
      setApps([app, ...applications])
      selectApp(app.applicationId)
      setNewBuildOpen(false)
      setMoreHub(false)
      // Layout first → then operator walks Contact → Summary → Skills → …
      setSection('preview')
      setLiveOpen(false)
      setVersionSaveFlash(true)
      window.setTimeout(() => setVersionSaveFlash(false), 1600)
    },
    [profile, applications, setApps, selectApp],
  )

  /** Keep name/emails/phone; clear jobs only. */
  const rebuildJobsOnly = () => {
    if (
      !confirm(
        'Clear all jobs from the master bank?\n\nContact (name, phone, emails) stays. Skills, summary, education, and certs stay. Resume versions stay — re-check jobs on each version after you add new roles.',
      )
    ) {
      return
    }
    setProfile((prev) => rebuildMasterBody(prev, 'jobs-only'))
  }

  /** Keep contact + education/certs; clear jobs, skills, summary. */
  const rebuildCareerBody = () => {
    if (
      !confirm(
        'Rebuild career body?\n\nKeeps: contact (name, phone, emails, links) + education + certs.\nClears: jobs, skills, base summary.\n\nVersions stay; pick jobs again after you refill the bank.',
      )
    ) {
      return
    }
    setProfile((prev) => rebuildMasterBody(prev, 'career-body'))
  }

  if (showGuide) {
    return (
      <div className="rf-app min-h-dvh bg-[#0b0f14] text-slate-100">
        <header
          className="sticky top-0 z-20 border-b border-slate-800/90 bg-[#0b0f14]/95 backdrop-blur"
          style={{ paddingTop: 'env(safe-area-inset-top)' }}
        >
          <div className="mx-auto flex max-w-lg items-center gap-2.5 px-3 py-2.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-amber-700/50 bg-amber-600/20 text-sm font-bold text-amber-400">
              RF
            </div>
            <div>
              <h1 className="text-base font-semibold text-slate-50">
                ResumeForge
              </h1>
              <p className="text-[11px] text-slate-500">
                {guideKind === 'leverage'
                  ? 'Target-first leverage'
                  : guideKind === 'full'
                    ? 'Full history setup'
                    : 'How do you want to start?'}
              </p>
            </div>
          </div>
        </header>
        <div className="mx-auto max-w-lg space-y-4 px-3 py-4">
          <DeviceDataBanner
            onExport={exportFullBackup}
            onImportClick={() => fileRef.current?.click()}
            appsCount={applications.length}
          />
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              void onImport(e.target.files?.[0])
              e.target.value = ''
            }}
          />

          {guideKind === 'pick' && (
            <div className="space-y-3">
              <p className="text-sm text-slate-300">
                Free tool · lives on this device · no account. You write the
                language; ResumeForge guides structure and ATS-safe format. One
                master history powers many tailored resume builds. Contact info
                never leaves this browser unless you export a backup or PDF.
              </p>
              <a
                href={GITHUB_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rf-btn flex min-h-11 w-full items-center justify-center text-sm font-semibold text-sky-200"
                title={GITHUB_REPO_HINT}
              >
                {GITHUB_REPO_LABEL}
              </a>
              <button
                type="button"
                className="rf-btn w-full min-h-11 text-sm"
                onClick={() => setHowToOpen(true)}
              >
                How to use (tutorial)
              </button>
              <button
                type="button"
                className="rf-card min-h-16 w-full touch-manipulation text-left border-amber-800/40"
                onClick={() => setGuideKind('leverage')}
              >
                <p className="font-medium text-amber-100">
                  Target-first leverage (recommended)
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Current role → what you’re applying for → daily work & skills
                  in your words → pick a layout → polish on live paper + 3-C.
                </p>
              </button>
              <button
                type="button"
                className="rf-card min-h-16 w-full touch-manipulation text-left"
                onClick={() => setGuideKind('full')}
              >
                <p className="font-medium text-slate-50">Full career history</p>
                <p className="mt-1 text-xs text-slate-400">
                  Step-by-step master profile (education → jobs → skills →
                  summary) then optional first application.
                </p>
              </button>
              <button
                type="button"
                className="rf-btn min-h-11 w-full"
                onClick={skipGuide}
              >
                Skip — empty workspace
              </button>
            </div>
          )}

          {guideKind === 'leverage' && (
            <LeverageWizard
              profile={profile}
              onProfileChange={(p) =>
                setProfile({
                  ...p,
                  jobs: sortJobsReverseChrono(p.jobs ?? []),
                })
              }
              onComplete={completeGuide}
              onBackToPick={() => setGuideKind('pick')}
              onSkip={skipGuide}
            />
          )}

          {guideKind === 'full' && (
            <GuidedOnboard
              profile={profile}
              onProfileChange={(p) =>
                setProfile({
                  ...p,
                  jobs: sortJobsReverseChrono(p.jobs ?? []),
                })
              }
              onComplete={completeGuide}
              onSkip={skipGuide}
            />
          )}
        </div>
        <HowToUseDialog
          open={howToOpen}
          onClose={() => setHowToOpen(false)}
        />
      </div>
    )
  }

  return (
    <div className="rf-app min-h-dvh bg-[#0b0f14] text-slate-100">
      <header
        className="sticky top-0 z-20 border-b border-slate-800/90 bg-[#0b0f14]/95 backdrop-blur no-print"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-2.5 sm:px-4 sm:py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-amber-700/50 bg-amber-600/20 text-sm font-bold text-amber-400">
              RF
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold tracking-tight text-slate-50">
                ResumeForge
              </h1>
              <p className="truncate text-[11px] text-slate-500 sm:text-xs">
                {activeApplication?.label
                  ? activeApplication.label
                  : 'Master profile'}
                {saveFlash ? ' · Saved' : ''}
              </p>
            </div>
          </div>

          <div className="hidden flex-wrap items-center gap-2 md:flex">
            <span className="text-xs text-slate-500">
              Jobs {jobCount} · builds {applications.length}
            </span>
            <span className="rounded-full border border-amber-800/50 bg-amber-950/40 px-2.5 py-0.5 text-xs font-medium text-amber-300/90">
              {activePack.shortName}
            </span>
            <CtaButton
              variant="primary"
              className="min-h-10 font-semibold"
              onClick={() => setNewBuildOpen(true)}
              title="New resume for a role — master contact & jobs stay"
            >
              + New Build
            </CtaButton>
            <CtaButton
              className="min-h-10"
              onClick={() => setHowToOpen(true)}
              title="How to use ResumeForge"
            >
              How to use
            </CtaButton>
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rf-btn min-h-10 inline-flex items-center px-3 text-sm font-medium text-sky-200 hover:border-sky-600/50 hover:text-sky-100"
              title={GITHUB_REPO_HINT}
            >
              GitHub
            </a>
            <CtaButton
              className="min-h-10"
              actionLabels={{
                busy: 'Making PDF…',
                done: 'PDF ready ✓',
                error: 'PDF failed — try again',
              }}
              onAsyncClick={exportPdf}
            >
              PDF
            </CtaButton>
            <CtaButton
              className="min-h-10"
              actionLabels={{
                busy: '…',
                done: 'Exported ✓',
                error: 'Export failed',
              }}
              onAsyncClick={async () => {
                exportFullBackup()
              }}
            >
              Export
            </CtaButton>
            <CtaButton
              className="min-h-10"
              onClick={() => fileRef.current?.click()}
            >
              Import
            </CtaButton>
            <CtaButton
              variant="danger"
              className="min-h-10"
              onClick={resetProfile}
            >
              Reset
            </CtaButton>
          </div>

          <div className="flex items-center gap-1.5 md:hidden">
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rf-btn min-h-11 min-w-11 inline-flex items-center justify-center px-2 text-xs font-semibold text-sky-200"
              aria-label={GITHUB_REPO_LABEL}
              title={GITHUB_REPO_HINT}
            >
              GH
            </a>
            <CtaButton
              variant="primary"
              className="min-h-11 px-3 text-sm font-bold"
              onClick={() => setNewBuildOpen(true)}
              aria-label="New Build"
            >
              + Build
            </CtaButton>
            <CtaButton
              className="min-h-11 min-w-12 px-3 text-sm font-semibold"
              aria-label="Download PDF"
              actionLabels={{
                busy: '…',
                done: '✓',
                error: 'Failed',
              }}
              onAsyncClick={exportPdf}
            >
              PDF
            </CtaButton>
          </div>
        </div>
        {importError && (
          <p className="border-t border-red-900/50 bg-red-950/40 px-4 py-1.5 text-center text-xs text-red-200">
            {importError}
          </p>
        )}
        {importNotice && !importError && (
          <p className="border-t border-slate-700 bg-slate-900/80 px-4 py-1.5 text-center text-xs text-slate-300">
            {importNotice}
          </p>
        )}
        {pdfNotice && (
          <p
            role="status"
            className="border-t border-amber-900/40 bg-amber-950/50 px-4 py-1.5 text-center text-xs text-amber-100"
          >
            {pdfNotice}
          </p>
        )}
      </header>

      <div className="mx-auto max-w-[1600px] px-3 pt-3 sm:px-4 sm:pt-4 no-print">
        <DeviceDataBanner
          compact
          onExport={exportFullBackup}
          onImportClick={() => fileRef.current?.click()}
          appsCount={applications.length}
        />
        <div className="mt-2">
          <VersionSwitcher
            applications={applications}
            activeId={activeAppId}
            saveFlash={versionSaveFlash}
            onSelect={selectApp}
            onSaveCurrent={saveCurrentVersion}
            onCommitNamed={commitNamedVersion}
            onNewBuild={() => setNewBuildOpen(true)}
            onManage={() => {
              setMoreHub(false)
              setSection('applications')
              setLiveOpen(false)
            }}
          />
        </div>
        <div className="mt-2">
          <BuildContinueBar
            activeLabel={activeApplication?.label ?? null}
            section={moreHub ? 'contact' : section}
            onContinue={(s) => {
              setMoreHub(false)
              setSection(s)
              setLiveOpen(false)
            }}
            onOpenLayouts={() => {
              setMoreHub(false)
              setSection('preview')
              setLiveOpen(false)
            }}
            onNewBuild={() => setNewBuildOpen(true)}
          />
        </div>
        <NewBuildDialog
          open={newBuildOpen}
          onClose={() => setNewBuildOpen(false)}
          onStart={startNewBuild}
          suggestedLabel=""
        />
        <HowToUseDialog
          open={howToOpen}
          onClose={() => setHowToOpen(false)}
        />
        <p className="mt-2 text-center text-[11px] text-slate-400 lg:text-left">
          Build live ·{' '}
          <strong className="font-medium text-slate-300">
            Clarity · Conciseness · Consistency
          </strong>
          {' · '}
          you write language · templates set format
          {' · '}
          <button
            type="button"
            className="font-medium text-amber-400/90 underline-offset-2 hover:underline"
            onClick={() => setHowToOpen(true)}
          >
            How to use
          </button>
          {' · '}
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-sky-400/90 underline-offset-2 hover:underline"
            title={GITHUB_REPO_HINT}
          >
            GitHub
          </a>
        </p>
      </div>

      {/* Desktop: nav | editor | live resume · Mobile: editor + live sheet */}
      <div className="mx-auto grid max-w-[1600px] gap-4 px-3 pb-36 pt-3 sm:gap-5 sm:px-4 sm:py-4 lg:grid-cols-[168px_minmax(0,1fr)_minmax(340px,42%)] lg:items-start lg:pb-6 xl:grid-cols-[180px_minmax(0,1fr)_minmax(380px,40%)]">
        <nav className="hidden no-print lg:sticky lg:top-20 lg:block lg:self-start">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="mb-4">
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                {group.label}
              </p>
              <ul className="flex flex-col gap-1">
                {group.items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setMoreHub(false)
                        setSection(item.id)
                      }}
                      aria-current={
                        section === item.id && !moreHub ? 'page' : undefined
                      }
                      className={`rf-nav-item whitespace-nowrap ${
                        section === item.id && !moreHub
                          ? 'rf-nav-item-active'
                          : ''
                      }`}
                    >
                      {item.label}
                      {item.id === 'applications' && applications.length > 0
                        ? ` (${applications.length})`
                        : ''}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            Live paper updates as you type. Layouts lock template for a target —
            3-C tips check craft, not a vendor ATS score.
          </p>
          <button
            type="button"
            className="rf-btn rf-btn-primary mt-3 w-full text-xs"
            onClick={() => setHowToOpen(true)}
          >
            How to use
          </button>
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rf-btn mt-2 flex w-full items-center justify-center text-xs font-medium text-sky-200"
            title={GITHUB_REPO_HINT}
          >
            {GITHUB_REPO_LABEL}
          </a>
          <button
            type="button"
            className="rf-btn mt-2 w-full text-xs"
            onClick={startLeverage}
          >
            Target-first leverage
          </button>
          <button
            type="button"
            className="rf-btn mt-2 w-full text-xs"
            onClick={restartGuide}
          >
            Restart setup (choose path)
          </button>
        </nav>

        <div className="min-w-0 space-y-3">
          {!moreHub && (
            <div className="no-print lg:hidden">
              <BuildStepTabs
                section={section}
                hasActiveApp={Boolean(activeApplication)}
                onSelect={(s) => {
                  setMoreHub(false)
                  setSection(s)
                  closeLiveSheet()
                }}
              />
            </div>
          )}

          <main
            className={
              section === 'preview' && !moreHub
                ? 'min-h-[40dvh]'
                : 'min-h-[40dvh] no-print'
            }
          >
            {moreHub ? (
              <MobileMoreMenu
                section={section}
                onSelect={openMoreSection}
                onHowToUse={() => setHowToOpen(true)}
                onExportProfile={exportFullBackup}
                onImportClick={() => fileRef.current?.click()}
                onReset={resetProfile}
                onRestartGuide={restartGuide}
                onStartLeverage={startLeverage}
              />
            ) : (
              <>
                {section === 'preview' && (
                  <PreviewPanel
                    profile={profile}
                    application={activeApplication}
                    onApplicationChange={patchActiveApp}
                    onEnsureApplication={ensureApplicationForTemplate}
                  />
                )}
                {section === 'applications' && (
                  <ApplicationsPanel
                    profile={profile}
                    applications={applications}
                    activeId={activeAppId}
                    onChangeApps={setApps}
                    onSelect={selectApp}
                    onOpenJdTailor={() => {
                      setMoreHub(false)
                      setSection('jd-tailor')
                    }}
                    onOpenInternalPromo={() => {
                      setMoreHub(false)
                      setSection('internal-promo')
                    }}
                    onOpenCoverLetter={() => {
                      setMoreHub(false)
                      setSection('cover-letter')
                    }}
                    onOpenJobs={() => {
                      setMoreHub(false)
                      setSection('jobs')
                    }}
                    onOpenSkills={() => {
                      setMoreHub(false)
                      setSection('skills')
                    }}
                    onNewBuild={() => setNewBuildOpen(true)}
                  />
                )}
                {section === 'jd-tailor' && (
                  <JdTailorPanel
                    profile={profile}
                    application={activeApplication}
                    onApplicationChange={patchActiveApp}
                    onSkillsChange={(skills) => update({ skills })}
                    onOpenApplications={() => {
                      setMoreHub(false)
                      setSection('applications')
                    }}
                  />
                )}
                {section === 'internal-promo' && (
                  <InternalPromoPanel
                    profile={profile}
                    application={activeApplication}
                    applications={applications}
                    onProfileChange={(p) =>
                      setProfile(
                        touch({
                          ...p,
                          jobs: sortJobsReverseChrono(p.jobs ?? []),
                        }),
                      )
                    }
                    onApplicationChange={patchActiveApp}
                    onCreateApplication={(app) => {
                      setApplications((prev) => {
                        const next = [app, ...prev]
                        saveApplications(next)
                        return next
                      })
                    }}
                    onSelectApplication={selectApp}
                    onOpenPreview={() => {
                      setMoreHub(false)
                      setSection('preview')
                    }}
                  />
                )}
                {section === 'library' && (
                  <AchievementsPanel
                    profile={profile}
                    onInsertIntoLatestJob={insertBulletToLatestJob}
                    onJobsChange={(jobs) => update({ jobs })}
                  />
                )}
                {section === 'cover-letter' && (
                  <CoverLetterPanel
                    profile={profile}
                    application={activeApplication}
                    onApplicationChange={patchActiveApp}
                    onOpenApplications={() => {
                      setMoreHub(false)
                      setSection('applications')
                    }}
                  />
                )}
                {(section === 'industry-pack' || section === 'mfg-prompts') && (
                  <IndustryPackPanel
                    profile={profile}
                    application={activeApplication}
                    onProfilePackChange={(packId) =>
                      update({ defaultIndustryPackId: packId })
                    }
                    onApplicationChange={patchActiveApp}
                    onInsertBullet={insertBulletToLatestJob}
                  />
                )}
                {section === 'contact' && (
                  <ContactPanel
                    contact={profile.contact}
                    onChange={(contact) => update({ contact })}
                  />
                )}
                {section === 'summary' && (
                  <SummaryPanel
                    summary={profile.baseSummary}
                    onChange={(baseSummary) => update({ baseSummary })}
                    packId={activePackId}
                  />
                )}
                {section === 'jobs' && (
                  <JobsPanel
                    jobs={profile.jobs}
                    onChange={(jobs) => update({ jobs })}
                    onRebuildJobs={rebuildJobsOnly}
                    onRebuildCareerBody={rebuildCareerBody}
                    onOpenVersions={() => {
                      setMoreHub(false)
                      setSection('applications')
                    }}
                  />
                )}
                {section === 'skills' && (
                  <SkillsPanel
                    skills={profile.skills}
                    onChange={(skills) => update({ skills })}
                    packId={activePackId}
                  />
                )}
                {section === 'education' && (
                  <EducationPanel
                    education={profile.education}
                    onChange={(education) => update({ education })}
                  />
                )}
                {section === 'certs' && (
                  <CertsPanel
                    certs={profile.certs}
                    onChange={(certs) => update({ certs })}
                  />
                )}
              </>
            )}
          </main>
        </div>

        {/* Desktop live column */}
        <aside className="hidden no-print lg:sticky lg:top-16 lg:block lg:self-start lg:h-[calc(100dvh-4.5rem)]">
          <LivePreviewPane
            variant="desktop"
            view={resolved}
            application={activeApplication}
            threeC={threeC}
            onExportPdf={exportPdf}
            onPrint={() => window.print()}
            onOpenLayout={() => {
              setMoreHub(false)
              setSection('preview')
            }}
          />
        </aside>
      </div>

      {/* Mobile live sheet — backdrop + sheet (+ exit motion) */}
      {liveOpen && (
        <div
          ref={liveSheetRef}
          className="fixed inset-0 z-40 flex flex-col justify-end lg:hidden no-print"
          role="dialog"
          aria-modal="true"
          aria-label="Live resume preview"
        >
          <button
            type="button"
            className={`rf-sheet-backdrop absolute inset-0 bg-black/55 ${
              liveClosing ? 'rf-sheet-exit' : ''
            }`}
            aria-label="Close live preview"
            onClick={closeLiveSheet}
          />
          <div
            className="relative z-10 mx-auto w-full max-w-lg"
            style={{
              paddingBottom:
                'calc(3.5rem + max(0.5rem, env(safe-area-inset-bottom)))',
            }}
          >
            <div className={liveClosing ? 'rf-sheet-exit' : ''}>
              <LivePreviewPane
                variant="mobile-sheet"
                view={resolved}
                application={activeApplication}
                threeC={threeC}
                expanded
                onToggleExpand={closeLiveSheet}
                onExportPdf={exportPdf}
                onPrint={() => window.print()}
                onOpenLayout={() => {
                  closeLiveSheet()
                  setMoreHub(false)
                  setSection('preview')
                }}
              />
            </div>
          </div>
        </div>
      )}

      {!liveOpen && (
        <div
          className="fixed inset-x-0 z-30 lg:hidden no-print"
          style={{
            bottom:
              'calc(3.25rem + max(0.5rem, env(safe-area-inset-bottom)))',
          }}
        >
          <LivePreviewPane
            variant="mobile-bar"
            view={resolved}
            application={activeApplication}
            threeC={threeC}
            expanded={false}
            onToggleExpand={openLiveSheet}
            barButtonRef={liveBarRef}
          />
        </div>
      )}
      <MobileBottomNav
        section={moreHub ? 'contact' : section}
        onNavigate={handleMobileNav}
        appsCount={applications.length}
      />

      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          void onImport(e.target.files?.[0])
          e.target.value = ''
        }}
      />

      <div className="print-only-resume" aria-hidden="true">
        <ResumeDocument view={resolved} />
      </div>

      <footer className="hidden border-t border-slate-900 py-4 text-center text-xs text-slate-600 no-print lg:block">
        ChantzMedia · ResumeForge · local-first · mobile PWA-ready
      </footer>
    </div>
  )
}
