import { useMemo, useState } from 'react'
import type { Contact, Education, Job, ResumeProfile } from '../types/profile'
import type { ResumeApplication } from '../types/application'
import { emptyApplication } from '../lib/applicationFactory'
import { sortJobsReverseChrono } from '../lib/jobOrder'
import { emptyJob, touch } from '../lib/profileFactory'
import { uid } from '../lib/id'
import type { OnboardPath } from '../lib/onboardingStorage'
import { RoleMemories } from './RoleMemories'
import { TagInput } from './TagInput'
import { getPack } from '../data/packs'
import { SUMMARY_FORMULA } from '../data/summaryExamples'
import { SkillChipList } from './SkillChipList'
import { SummaryPanel } from './SummaryPanel'

type StepId =
  | 'welcome'
  | 'contact'
  | 'education'
  | 'jobs-list'
  | 'job-detail'
  | 'skills'
  | 'summary'
  | 'tailor'
  | 'done'

type LandingSection = 'preview' | 'jobs' | 'applications'

type Props = {
  profile: ResumeProfile
  onProfileChange: (profile: ResumeProfile) => void
  onComplete: (opts: {
    path: OnboardPath
    internalCompany: string
    application: ResumeApplication | null
    /** Where to land after wizard */
    nextSection?: LandingSection
  }) => void
  onSkip: () => void
}

const STEPS_LABEL: { id: StepId; label: string }[] = [
  { id: 'welcome', label: 'Start' },
  { id: 'contact', label: 'You' },
  { id: 'education', label: 'School' },
  { id: 'jobs-list', label: 'Jobs' },
  { id: 'skills', label: 'Skills' },
  { id: 'summary', label: 'Summary' },
  { id: 'tailor', label: 'Apply' },
]

export function GuidedOnboard({
  profile,
  onProfileChange,
  onComplete,
  onSkip,
}: Props) {
  const [step, setStep] = useState<StepId>('welcome')
  const [path, setPath] = useState<OnboardPath | null>(null)
  const [internalCompany, setInternalCompany] = useState('')
  const [eduDraft, setEduDraft] = useState({
    school: '',
    credential: '',
    year: '',
  })
  const [activeJobId, setActiveJobId] = useState<string | null>(null)
  const [tailorTitle, setTailorTitle] = useState('')
  const [tailorCompany, setTailorCompany] = useState('')
  const [tailorMode, setTailorMode] = useState<'external' | 'internal'>(
    'external',
  )
  const [pendingApp, setPendingApp] = useState<ResumeApplication | null>(null)

  const progress = useMemo(() => {
    const order: StepId[] = [
      'welcome',
      'contact',
      'education',
      'jobs-list',
      'job-detail',
      'skills',
      'summary',
      'tailor',
      'done',
    ]
    const i = order.indexOf(step)
    return Math.round(((i + 1) / order.length) * 100)
  }, [step])

  const setContact = (contact: Contact) => {
    onProfileChange(touch({ ...profile, contact }))
  }

  const addEducation = () => {
    if (!eduDraft.school.trim() && !eduDraft.credential.trim()) return
    const ed: Education = {
      id: uid('edu'),
      school: eduDraft.school.trim(),
      credential: eduDraft.credential.trim(),
      year: eduDraft.year.trim(),
      notes: '',
    }
    onProfileChange(
      touch({ ...profile, education: [...profile.education, ed] }),
    )
    setEduDraft({ school: '', credential: '', year: '' })
  }

  const removeEducation = (id: string) => {
    onProfileChange(
      touch({
        ...profile,
        education: profile.education.filter((e) => e.id !== id),
      }),
    )
  }

  const addJobShell = () => {
    const job = emptyJob()
    if (path === 'internal' && internalCompany.trim()) {
      job.company = internalCompany.trim()
      job.isCurrentEmployer = true
    }
    // Reverse-chrono by dates: blank end = Present so new shells float to top
    // until start/end make them older roles.
    onProfileChange(
      touch({
        ...profile,
        jobs: sortJobsReverseChrono([...profile.jobs, job]),
      }),
    )
    setActiveJobId(job.id)
    setStep('job-detail')
  }

  const updateJob = (id: string, patch: Partial<Job>) => {
    onProfileChange(
      touch({
        ...profile,
        jobs: sortJobsReverseChrono(
          profile.jobs.map((j) => (j.id === id ? { ...j, ...patch } : j)),
        ),
      }),
    )
  }

  const activeJob = profile.jobs.find((j) => j.id === activeJobId) ?? null

  const finishJobsChronology = () => {
    // Resume convention: newest first (capture may have been oldest-first)
    const jobs = [...profile.jobs].sort((a, b) => {
      const as = a.start || '0000'
      const bs = b.start || '0000'
      return bs.localeCompare(as)
    })
    onProfileChange(touch({ ...profile, jobs }))
    setStep('skills')
  }

  const finish = (withApp: boolean) => {
    const p = path ?? 'external'
    let application: ResumeApplication | null = null
    if (withApp) {
      application = emptyApplication(profile, {
        label:
          [tailorTitle.trim(), tailorCompany.trim()].filter(Boolean).join(' @ ') ||
          'Working draft',
        targetTitle: tailorTitle.trim(),
        targetCompany:
          tailorCompany.trim() || (p === 'internal' ? internalCompany : ''),
        mode: tailorMode,
        templateId:
          tailorMode === 'internal' ? 'internal-promotion' : 'ats-classic',
        featuredJobIds: [],
        summaryOverride: '',
      })
    }
    setPendingApp(application)
    setStep('done')
  }

  const land = (nextSection: LandingSection) => {
    const p = path ?? 'external'
    onComplete({
      path: p,
      internalCompany: internalCompany.trim(),
      application: pendingApp,
      nextSection,
    })
  }

  return (
    <div className="mx-auto max-w-lg space-y-4 px-1 pb-8">
      <header className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-slate-50">Get started</h2>
          <button
            type="button"
            className="text-xs text-slate-500 underline-offset-2 touch-manipulation hover:underline"
            onClick={onSkip}
          >
            Skip wizard
          </button>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-amber-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-slate-500">
          Step-by-step · memory-first · manufacturing-friendly
        </p>
      </header>

      {step === 'welcome' && (
        <section className="space-y-4">
          <p className="text-sm text-slate-300">
            We’ll capture what you remember in order — then you can tailor a
            resume for whatever role drops with short notice.
          </p>
          <p className="text-sm font-medium text-slate-200">
            What are you building first?
          </p>
          <button
            type="button"
            className="rf-card min-h-16 w-full touch-manipulation text-left active:border-amber-700/50"
            onClick={() => {
              setPath('external')
              setTailorMode('external')
              setStep('contact')
            }}
          >
            <p className="font-medium text-slate-50">Full career history</p>
            <p className="mt-1 text-xs text-slate-400">
              Different employers over time. Chronological job session — oldest
              first is fine; we sort for the resume.
            </p>
          </button>
          <button
            type="button"
            className="rf-card min-h-16 w-full touch-manipulation text-left active:border-amber-700/50"
            onClick={() => {
              setPath('internal')
              setTailorMode('internal')
              setStep('contact')
            }}
          >
            <p className="font-medium text-slate-50">
              Same company (internal / promotion)
            </p>
            <p className="mt-1 text-xs text-slate-400">
              One employer, multiple titles over time. Chronological roles at
              that plant/company.
            </p>
          </button>
        </section>
      )}

      {step === 'contact' && (
        <section className="space-y-3">
          <h3 className="text-base font-semibold text-slate-50">About you</h3>
          {path === 'internal' && (
            <label>
              <span className="rf-label">Company (locked for job entries)</span>
              <input
                className="rf-input"
                value={internalCompany}
                onChange={(e) => setInternalCompany(e.target.value)}
                placeholder="Your employer name"
                autoComplete="organization"
              />
            </label>
          )}
          <label>
            <span className="rf-label">Full name</span>
            <input
              className="rf-input"
              value={profile.contact.name}
              onChange={(e) =>
                setContact({ ...profile.contact, name: e.target.value })
              }
              autoComplete="name"
            />
          </label>
          <label>
            <span className="rf-label">Phone</span>
            <input
              className="rf-input"
              value={profile.contact.phone}
              onChange={(e) =>
                setContact({ ...profile.contact, phone: e.target.value })
              }
              type="tel"
              autoComplete="tel"
            />
          </label>
          <label>
            <span className="rf-label">Professional email</span>
            <input
              className="rf-input"
              value={profile.contact.email}
              onChange={(e) =>
                setContact({ ...profile.contact, email: e.target.value })
              }
              type="email"
              autoComplete="email"
              placeholder="you@gmail.com · external apps"
            />
          </label>
          <label>
            <span className="rf-label">Work / internal email</span>
            <input
              className="rf-input"
              value={profile.contact.emailInternal ?? ''}
              onChange={(e) =>
                setContact({
                  ...profile.contact,
                  emailInternal: e.target.value,
                })
              }
              type="email"
              autoComplete="email"
              placeholder="you@company.com · internal posts"
            />
          </label>
          <label>
            <span className="rf-label">City, ST</span>
            <input
              className="rf-input"
              value={profile.contact.location}
              onChange={(e) =>
                setContact({ ...profile.contact, location: e.target.value })
              }
              autoComplete="address-level2"
            />
          </label>
          <NavRow
            back={() => setStep('welcome')}
            next={() => setStep('education')}
            nextLabel="Next: Education"
            nextDisabled={!profile.contact.name.trim()}
          />
        </section>
      )}

      {step === 'education' && (
        <section className="space-y-3">
          <h3 className="text-base font-semibold text-slate-50">Education</h3>
          <p className="text-sm text-slate-400">
            Start here — school, certificate, or GED. Add more if you have them.
          </p>
          {profile.education.map((ed) => (
            <div
              key={ed.id}
              className="flex items-start justify-between gap-2 rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2"
            >
              <div className="text-sm">
                <p className="font-medium text-slate-100">
                  {ed.credential || 'Credential'}
                </p>
                <p className="text-xs text-slate-500">
                  {[ed.school, ed.year].filter(Boolean).join(' · ')}
                </p>
              </div>
              <button
                type="button"
                className="rf-btn rf-btn-danger text-xs"
                onClick={() => removeEducation(ed.id)}
              >
                Remove
              </button>
            </div>
          ))}
          <label>
            <span className="rf-label">School / program</span>
            <input
              className="rf-input"
              value={eduDraft.school}
              onChange={(e) =>
                setEduDraft((d) => ({ ...d, school: e.target.value }))
              }
              placeholder="Community college, high school, trade…"
            />
          </label>
          <label>
            <span className="rf-label">Credential</span>
            <input
              className="rf-input"
              value={eduDraft.credential}
              onChange={(e) =>
                setEduDraft((d) => ({ ...d, credential: e.target.value }))
              }
              placeholder="Diploma, certificate, degree…"
            />
          </label>
          <label>
            <span className="rf-label">Year (optional)</span>
            <input
              className="rf-input"
              value={eduDraft.year}
              onChange={(e) =>
                setEduDraft((d) => ({ ...d, year: e.target.value }))
              }
              placeholder="2019"
              inputMode="numeric"
            />
          </label>
          <button
            type="button"
            className="rf-btn min-h-11 w-full touch-manipulation"
            onClick={addEducation}
          >
            + Add education
          </button>
          <NavRow
            back={() => setStep('contact')}
            next={() => setStep('jobs-list')}
            nextLabel="Next: Jobs"
          />
        </section>
      )}

      {step === 'jobs-list' && (
        <section className="space-y-3">
          <h3 className="text-base font-semibold text-slate-50">
            {path === 'internal' ? 'Roles at company' : 'Job history'}
          </h3>
          <p className="text-sm text-slate-400">
            {path === 'internal' ? (
              <>
                Add each title at{' '}
                <strong className="text-slate-300">
                  {internalCompany || 'your company'}
                </strong>{' '}
                in time order (earliest role first). You’ll remember duties next.
              </>
            ) : (
              <>
                Add jobs in time order (earliest first). For each one you’ll dump
                what you remember doing — we’ll turn that into bullets.
              </>
            )}
          </p>
          {profile.jobs.length === 0 && (
            <p className="rounded-xl border border-dashed border-slate-700 px-3 py-4 text-center text-sm text-slate-500">
              No roles yet — add your first one.
            </p>
          )}
          <ul className="space-y-2">
            {profile.jobs.map((j, i) => (
              <li key={j.id}>
                <button
                  type="button"
                  className="flex min-h-14 w-full touch-manipulation items-center justify-between rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2 text-left active:bg-slate-800"
                  onClick={() => {
                    setActiveJobId(j.id)
                    setStep('job-detail')
                  }}
                >
                  <div>
                    <p className="text-sm font-medium text-slate-100">
                      {i + 1}. {j.title || 'Untitled role'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {[j.company, j.start, j.end || 'present']
                        .filter(Boolean)
                        .join(' · ')}
                      {j.bullets.some((b) => b.trim())
                        ? ` · ${j.bullets.filter((b) => b.trim()).length} notes`
                        : ' · no memories yet'}
                    </p>
                  </div>
                  <span className="text-slate-500">Edit</span>
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="rf-btn rf-btn-primary min-h-12 w-full touch-manipulation"
            onClick={addJobShell}
          >
            + Add {path === 'internal' ? 'role / title' : 'job'}
          </button>
          <NavRow
            back={() => setStep('education')}
            next={finishJobsChronology}
            nextLabel="Done with jobs → Skills"
            nextDisabled={profile.jobs.length === 0}
          />
        </section>
      )}

      {step === 'job-detail' && activeJob && (
        <section className="space-y-3">
          <h3 className="text-base font-semibold text-slate-50">
            Role details + memories
          </h3>
          {path !== 'internal' && (
            <label>
              <span className="rf-label">Company</span>
              <input
                className="rf-input"
                value={activeJob.company}
                onChange={(e) =>
                  updateJob(activeJob.id, { company: e.target.value })
                }
              />
            </label>
          )}
          {path === 'internal' && (
            <p className="text-xs text-slate-500">
              Company: {activeJob.company || internalCompany}
            </p>
          )}
          <label>
            <span className="rf-label">Title</span>
            <input
              className="rf-input"
              value={activeJob.title}
              onChange={(e) =>
                updateJob(activeJob.id, { title: e.target.value })
              }
              placeholder="Operator, Team Lead…"
            />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label>
              <span className="rf-label">Start (YYYY-MM)</span>
              <input
                className="rf-input"
                value={activeJob.start}
                onChange={(e) =>
                  updateJob(activeJob.id, { start: e.target.value })
                }
                placeholder="2020-06"
              />
            </label>
            <label>
              <span className="rf-label">End (blank = now)</span>
              <input
                className="rf-input"
                value={activeJob.end ?? ''}
                onChange={(e) =>
                  updateJob(activeJob.id, {
                    end: e.target.value.trim() || null,
                  })
                }
                placeholder="present"
              />
            </label>
          </div>
          <label>
            <span className="rf-label">Area / department (optional)</span>
            <input
              className="rf-input"
              value={activeJob.department ?? ''}
              onChange={(e) =>
                updateJob(activeJob.id, { department: e.target.value })
              }
              placeholder="Line 2, Assembly…"
            />
          </label>
          <TagInput
            label="Tools / methods"
            hint="Spaces OK — e.g. Bill of Materials. Enter or Add to commit."
            tags={activeJob.tools}
            onChange={(tools) => updateJob(activeJob.id, { tools })}
            placeholder="Bill of Materials, forklift…"
            suggestions={[
              'Bill of Materials',
              '5S',
              'LOTO',
              'forklift',
              'standard work',
              'MES',
            ]}
          />

          <RoleMemories
            defaultOpen
            onAddBullets={(lines) => {
              const existing = activeJob.bullets
                .map((b) => b.trim())
                .filter(Boolean)
              updateJob(activeJob.id, { bullets: [...existing, ...lines] })
            }}
          />

          {activeJob.bullets.filter((b) => b.trim()).length > 0 && (
            <ul className="space-y-2 text-sm text-slate-300">
              {activeJob.bullets.map((b, i) =>
                !b.trim() ? null : (
                  <li key={i} className="flex gap-2">
                    <span className="mt-2.5 shrink-0 text-amber-500">•</span>
                    <textarea
                      className="rf-input min-h-[64px] flex-1 resize-y text-sm"
                      value={b}
                      onChange={(e) => {
                        const bullets = [...activeJob.bullets]
                        bullets[i] = e.target.value
                        updateJob(activeJob.id, { bullets })
                      }}
                      aria-label={`Edit bullet ${i + 1}`}
                    />
                    <button
                      type="button"
                      className="shrink-0 self-start text-xs text-red-400"
                      aria-label={`Remove bullet ${i + 1}`}
                      onClick={() => {
                        const bullets = activeJob.bullets.filter(
                          (_, idx) => idx !== i,
                        )
                        updateJob(activeJob.id, {
                          bullets: bullets.length ? bullets : [''],
                        })
                      }}
                    >
                      ×
                    </button>
                  </li>
                ),
              )}
            </ul>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              className="rf-btn min-h-11 flex-1 touch-manipulation"
              onClick={() => setStep('jobs-list')}
            >
              ← Back to job list
            </button>
            <button
              type="button"
              className="rf-btn rf-btn-primary min-h-11 flex-1 touch-manipulation"
              onClick={() => {
                if (path === 'internal' && internalCompany.trim()) {
                  updateJob(activeJob.id, {
                    company: internalCompany.trim(),
                    isCurrentEmployer: true,
                  })
                }
                setStep('jobs-list')
              }}
            >
              Save role
            </button>
          </div>
        </section>
      )}

      {step === 'skills' && (
        <section className="space-y-3">
          <h3 className="text-base font-semibold text-slate-50">Skills</h3>
          <p className="text-sm text-slate-400">
            Add one skill at a time in each section (not one big box).
          </p>
          <SkillChipList
            label="Hard / domain skills"
            items={profile.skills.hard}
            onChange={(hard) =>
              onProfileChange(
                touch({ ...profile, skills: { ...profile.skills, hard } }),
              )
            }
            placeholder="e.g. Standard work"
            suggestions={[
              'Production leadership',
              'Quality ownership',
              'Safety compliance',
              'Continuous improvement',
            ]}
          />
          <SkillChipList
            label="Tools & systems"
            items={profile.skills.tools}
            onChange={(tools) =>
              onProfileChange(
                touch({ ...profile, skills: { ...profile.skills, tools } }),
              )
            }
            placeholder="e.g. 5S, MES"
            suggestions={getPack(profile.defaultIndustryPackId).keywordBank.slice(0, 10)}
          />
          <SkillChipList
            label="Soft / leadership"
            items={profile.skills.soft}
            onChange={(soft) =>
              onProfileChange(
                touch({ ...profile, skills: { ...profile.skills, soft } }),
              )
            }
            placeholder="e.g. Crew coaching"
            suggestions={[
              'Crew coaching',
              'Clear floor communication',
              'Training new hires',
            ]}
          />
          <NavRow
            back={() => setStep('jobs-list')}
            next={() => setStep('summary')}
            nextLabel="Next: Summary"
          />
        </section>
      )}

      {step === 'summary' && (
        <section className="space-y-3">
          <SummaryPanel
            summary={profile.baseSummary}
            onChange={(baseSummary) =>
              onProfileChange(touch({ ...profile, baseSummary }))
            }
          />
          <p className="text-xs text-slate-500">Formula: {SUMMARY_FORMULA}</p>
          <button
            type="button"
            className="rf-btn min-h-11 w-full touch-manipulation"
            onClick={() => {
              const titles = profile.jobs
                .map((j) => j.title)
                .filter(Boolean)
                .slice(0, 2)
                .join(' / ')
              const years = profile.jobs.length
              const draft = [
                titles || 'Manufacturing professional',
                years
                  ? `with experience across ${years} role${years > 1 ? 's' : ''}`
                  : '',
                'focused on safety, quality, and production results.',
                path === 'internal' && internalCompany
                  ? `Currently building career depth at ${internalCompany}.`
                  : '',
              ]
                .filter(Boolean)
                .join(' ')
              onProfileChange(touch({ ...profile, baseSummary: draft }))
            }}
          >
            Suggest a starter summary
          </button>
          <NavRow
            back={() => setStep('skills')}
            next={() => {
              if (path === 'internal') {
                setTailorCompany(internalCompany)
                setTailorMode('internal')
              }
              setStep('tailor')
            }}
            nextLabel="Next: Tailor for a job"
          />
        </section>
      )}

      {step === 'tailor' && (
        <section className="space-y-3">
          <h3 className="text-base font-semibold text-slate-50">
            Tailor for a role
          </h3>
          <p className="text-sm text-slate-400">
            Your history is the master profile. Create an application for this
            target — then you’ll get <strong className="text-slate-300">at
            least 3 layout previews</strong> (more on demand) and PDF export.
          </p>
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3 text-xs text-slate-400">
            After finish: Preview → “3+ previews” → pick Classic / Compact /
            Internal (or Generate more).
          </div>
          <label>
            <span className="rf-label">Target job title</span>
            <input
              className="rf-input"
              value={tailorTitle}
              onChange={(e) => setTailorTitle(e.target.value)}
              placeholder="Production Supervisor"
            />
          </label>
          <label>
            <span className="rf-label">Company</span>
            <input
              className="rf-input"
              value={tailorCompany}
              onChange={(e) => setTailorCompany(e.target.value)}
              placeholder={
                path === 'internal' ? internalCompany || 'Your company' : 'Employer'
              }
            />
          </label>
          <label>
            <span className="rf-label">Type</span>
            <select
              className="rf-input"
              value={tailorMode}
              onChange={(e) =>
                setTailorMode(e.target.value as 'external' | 'internal')
              }
            >
              <option value="external">External application</option>
              <option value="internal">Internal promotion</option>
            </select>
          </label>
          <button
            type="button"
            className="rf-btn rf-btn-primary min-h-12 w-full touch-manipulation"
            onClick={() => finish(true)}
          >
            Next · create application
          </button>
          <button
            type="button"
            className="rf-btn min-h-11 w-full touch-manipulation"
            onClick={() => finish(false)}
          >
            Next · skip application
          </button>
          <button
            type="button"
            className="rf-btn min-h-11 w-full touch-manipulation"
            onClick={() => setStep('summary')}
          >
            ← Back
          </button>
        </section>
      )}

      {step === 'done' && (
        <section className="space-y-4">
          <p className="text-sm font-medium text-slate-100">You’re set</p>
          <p className="text-sm text-slate-400">
            Live paper is always on while you build. Layouts lock template and
            tone for a target application.
            {pendingApp
              ? ` Application “${pendingApp.label}” will be saved.`
              : ' You can create a target anytime under Target / apps.'}
          </p>
          <button
            type="button"
            className="rf-btn rf-btn-primary min-h-12 w-full touch-manipulation"
            onClick={() => land('preview')}
          >
            See layouts
          </button>
          <button
            type="button"
            className="rf-btn min-h-11 w-full touch-manipulation"
            onClick={() => land('jobs')}
          >
            Review jobs
          </button>
          {pendingApp && (
            <button
              type="button"
              className="rf-btn min-h-11 w-full touch-manipulation"
              onClick={() => land('applications')}
            >
              Open target app
            </button>
          )}
          <button
            type="button"
            className="rf-btn min-h-11 w-full touch-manipulation"
            onClick={() => setStep('tailor')}
          >
            ← Back
          </button>
        </section>
      )}

      {/* tiny step chips — hide job-detail + done */}
      {step !== 'job-detail' && step !== 'done' && (
        <p className="text-center text-[10px] text-slate-600">
          {STEPS_LABEL.map((s) => s.label).join(' → ')}
        </p>
      )}
    </div>
  )
}

function NavRow({
  back,
  next,
  nextLabel,
  nextDisabled,
}: {
  back: () => void
  next: () => void
  nextLabel: string
  nextDisabled?: boolean
}) {
  return (
    <div className="flex flex-col gap-2 pt-2 sm:flex-row">
      <button
        type="button"
        className="rf-btn min-h-11 flex-1 touch-manipulation"
        onClick={back}
      >
        ← Back
      </button>
      <button
        type="button"
        className="rf-btn rf-btn-primary min-h-11 flex-1 touch-manipulation"
        onClick={next}
        disabled={nextDisabled}
      >
        {nextLabel}
      </button>
    </div>
  )
}
