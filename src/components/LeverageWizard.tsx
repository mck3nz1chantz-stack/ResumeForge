import { useMemo, useState } from 'react'
import type { ResumeApplication } from '../types/application'
import type { ResumeProfile } from '../types/profile'
import type { OnboardPath } from '../lib/onboardingStorage'
import {
  seedFromLeverage,
  type LeverageStory,
} from '../lib/leverageSeed'
import { TEMPLATES } from '../lib/templates'
import { SectionGuide } from './SectionGuide'
import { CtaButton } from './CtaButton'

type Step = 'mode' | 'target' | 'current' | 'work' | 'you' | 'review'

type Props = {
  profile: ResumeProfile
  onProfileChange: (profile: ResumeProfile) => void
  onComplete: (opts: {
    path: OnboardPath
    internalCompany: string
    application: ResumeApplication | null
    nextSection?: 'preview' | 'jobs' | 'applications' | 'summary'
  }) => void
  onBackToPick?: () => void
  onSkip?: () => void
}

const STEPS: { id: Step; label: string }[] = [
  { id: 'mode', label: 'Path' },
  { id: 'target', label: 'Target' },
  { id: 'current', label: 'Now' },
  { id: 'work', label: 'Work' },
  { id: 'you', label: 'You' },
  { id: 'review', label: 'Format' },
]

/**
 * Offline target-first path: you write the language; app shapes format + seeds.
 * No AI generation.
 */
export function LeverageWizard({
  profile,
  onProfileChange,
  onComplete,
  onBackToPick,
  onSkip,
}: Props) {
  const [step, setStep] = useState<Step>('mode')
  const [story, setStory] = useState<LeverageStory>({
    mode: 'external',
    targetTitle: '',
    targetCompany: '',
    currentTitle: '',
    currentCompany: '',
    skillsText: '',
    dailyWork: '',
    helpedWith: '',
    name: profile.contact.name || '',
  })
  const [templateId, setTemplateId] = useState<string>('ats-classic')

  const patch = (p: Partial<LeverageStory>) =>
    setStory((s) => ({ ...s, ...p }))

  const progress = useMemo(() => {
    const i = STEPS.findIndex((s) => s.id === step)
    return Math.round(((i + 1) / STEPS.length) * 100)
  }, [step])

  const finish = (nextSection: 'preview' | 'summary' | 'jobs') => {
    const seeded = seedFromLeverage(profile, story)
    // Apply chosen template on the application
    const application = {
      ...seeded.application,
      templateId: templateId as ResumeApplication['templateId'],
      tone:
        story.mode === 'internal'
          ? ('internal-promo' as const)
          : seeded.application.tone,
    }
    onProfileChange(seeded.profile)
    onComplete({
      path: story.mode,
      internalCompany:
        story.mode === 'internal' ? story.currentCompany.trim() : '',
      application,
      nextSection,
    })
  }

  return (
    <div className="mx-auto max-w-lg space-y-4 px-1 pb-8">
      <header className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-slate-50">
            Target-first leverage
          </h2>
          <div className="flex items-center gap-2">
            <SectionGuide guideId="leverage-story" label="How this works" />
            {onSkip && (
              <button
                type="button"
                className="text-xs text-slate-500 underline-offset-2 hover:underline"
                onClick={onSkip}
              >
                Skip
              </button>
            )}
          </div>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-amber-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-slate-400">
          You write the words · app builds format · live paper + 3-C to judge ·
          offline · no invented metrics
        </p>
      </header>

      {step === 'mode' && (
        <section className="space-y-3">
          <p className="text-sm text-slate-300">
            Start from the role you want. We seed structure from your current
            work — you polish language with Structure guides on each section.
          </p>
          <button
            type="button"
            className="rf-card min-h-16 w-full touch-manipulation text-left"
            onClick={() => {
              patch({ mode: 'internal' })
              setTemplateId('internal-promotion')
              setStep('target')
            }}
          >
            <p className="font-medium text-slate-50">Internal / same company</p>
            <p className="mt-1 text-xs text-slate-400">
              Use current position as leverage for a promo or lateral (e.g.
              Technical Machine Operator).
            </p>
          </button>
          <button
            type="button"
            className="rf-card min-h-16 w-full touch-manipulation text-left"
            onClick={() => {
              patch({ mode: 'external' })
              setTemplateId('ats-classic')
              setStep('target')
            }}
          >
            <p className="font-medium text-slate-50">External application</p>
            <p className="mt-1 text-xs text-slate-400">
              New employer — still leverage what you do now toward the target
              title.
            </p>
          </button>
          {onBackToPick && (
            <button
              type="button"
              className="rf-btn min-h-11 w-full"
              onClick={onBackToPick}
            >
              ← Other setup options
            </button>
          )}
        </section>
      )}

      {step === 'target' && (
        <section className="space-y-3">
          <p className="text-sm font-medium text-slate-100">
            What are you applying for?
          </p>
          <label>
            <span className="rf-label">Target title</span>
            <input
              className="rf-input"
              value={story.targetTitle}
              onChange={(e) => patch({ targetTitle: e.target.value })}
              placeholder="Technical Machine Operator"
              autoFocus
            />
          </label>
          <label>
            <span className="rf-label">
              {story.mode === 'internal'
                ? 'Company / plant (internal)'
                : 'Target company (optional)'}
            </span>
            <input
              className="rf-input"
              value={story.targetCompany}
              onChange={(e) => patch({ targetCompany: e.target.value })}
              placeholder={
                story.mode === 'internal' ? 'Your plant / company' : 'Employer'
              }
            />
          </label>
          <Nav
            back={() => setStep('mode')}
            next={() => setStep('current')}
            nextLabel="Next · current role"
            nextDisabled={!story.targetTitle.trim()}
          />
        </section>
      )}

      {step === 'current' && (
        <section className="space-y-3">
          <p className="text-sm font-medium text-slate-100">
            I am <span className="text-amber-200/90">_____</span> with skills…
          </p>
          <label>
            <span className="rf-label">Current title</span>
            <input
              className="rf-input"
              value={story.currentTitle}
              onChange={(e) => patch({ currentTitle: e.target.value })}
              placeholder="Machine Operator · Tech helper · …"
            />
          </label>
          <label>
            <span className="rf-label">Current company / plant</span>
            <input
              className="rf-input"
              value={story.currentCompany}
              onChange={(e) => patch({ currentCompany: e.target.value })}
              placeholder={
                story.mode === 'internal' && story.targetCompany
                  ? story.targetCompany
                  : 'Employer'
              }
            />
          </label>
          <label>
            <span className="rf-label">Skills & tools (comma-separated)</span>
            <textarea
              className="rf-input min-h-[88px] resize-y"
              value={story.skillsText}
              onChange={(e) => patch({ skillsText: e.target.value })}
              placeholder="CNC setup, calipers, LOTO, blueprint reading, forklift…"
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Only list what you can speak to. You can re-bucket hard/tools later.
            </p>
          </label>
          <Nav
            back={() => setStep('target')}
            next={() => {
              if (
                story.mode === 'internal' &&
                !story.currentCompany.trim() &&
                story.targetCompany.trim()
              ) {
                patch({ currentCompany: story.targetCompany })
              }
              setStep('work')
            }}
            nextLabel="Next · daily work"
          />
        </section>
      )}

      {step === 'work' && (
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-slate-100">
              Daily work & what you’ve helped with
            </p>
            <SectionGuide guideId="jobs" label="Bullet length" />
          </div>
          <label>
            <span className="rf-label">Daily jobs include…</span>
            <textarea
              className="rf-input min-h-[100px] resize-y"
              value={story.dailyWork}
              onChange={(e) => patch({ dailyWork: e.target.value })}
              placeholder="Running station X, checks, changeovers, quality holds…"
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Plain language. Becomes a draft bullet you can rewrite.
            </p>
          </label>
          <label>
            <span className="rf-label">I have helped with…</span>
            <textarea
              className="rf-input min-h-[100px] resize-y"
              value={story.helpedWith}
              onChange={(e) => patch({ helpedWith: e.target.value })}
              placeholder="Training new hires; reducing scrap on Line 2; weekend coverage…"
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Separate ideas with “and” or new lines. No numbers unless real.
            </p>
          </label>
          <Nav
            back={() => setStep('current')}
            next={() => setStep('you')}
            nextLabel="Next · your name"
          />
        </section>
      )}

      {step === 'you' && (
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-slate-100">Contact seed</p>
            <SectionGuide guideId="contact" />
          </div>
          <label>
            <span className="rf-label">Full name</span>
            <input
              className="rf-input"
              value={story.name}
              onChange={(e) => patch({ name: e.target.value })}
              placeholder="Name on the resume"
            />
          </label>
          <p className="text-xs text-slate-500">
            Phone and email can be finished on Contact — Structure tip is there
            too.
          </p>
          <Nav
            back={() => setStep('work')}
            next={() => setStep('review')}
            nextLabel="Next · pick format"
            nextDisabled={!story.name.trim() && !profile.contact.name.trim()}
          />
        </section>
      )}

      {step === 'review' && (
        <section className="space-y-3">
          <p className="text-sm font-medium text-slate-100">
            Format for this target
          </p>
          <p className="text-xs text-slate-400">
            Professional templates — single-column ATS-safe by default. You can
            change layout anytime under Layouts.
          </p>
          <ul className="max-h-[50vh] space-y-2 overflow-y-auto pr-0.5">
            {TEMPLATES.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => setTemplateId(t.id)}
                  className={`w-full rounded-xl border px-3 py-2.5 text-left touch-manipulation ${
                    templateId === t.id
                      ? 'border-amber-600/60 bg-amber-950/30 ring-1 ring-amber-700/40'
                      : 'border-slate-800 bg-slate-900/40'
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="text-sm font-medium text-slate-100">
                      {t.name}
                    </p>
                    <span className="rounded-full border border-slate-700 px-1.5 text-[10px] text-slate-500">
                      {t.density}
                    </span>
                    {templateId === t.id ? (
                      <span className="text-amber-400 text-xs">· selected</span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    {t.description}
                  </p>
                  <p className="mt-0.5 text-[11px] text-amber-200/70">
                    Best for: {t.bestFor}
                  </p>
                </button>
              </li>
            ))}
          </ul>

          <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-3 text-xs text-slate-400">
            <p className="font-medium text-slate-200">What we’ll seed</p>
            <ul className="mt-1.5 list-inside list-disc space-y-0.5">
              <li>
                Target app:{' '}
                <span className="text-slate-300">
                  {story.targetTitle || '—'}
                  {story.targetCompany ? ` @ ${story.targetCompany}` : ''}
                </span>
              </li>
              <li>
                Current role:{' '}
                <span className="text-slate-300">
                  {story.currentTitle || '—'}
                  {story.currentCompany ? ` @ ${story.currentCompany}` : ''}
                </span>
              </li>
              <li>Your daily / helped-with lines as draft bullets (your words)</li>
              <li>
                Summary scaffold with [brackets] — rewrite with{' '}
                <strong className="text-slate-300">Structure & length</strong>
              </li>
            </ul>
          </div>

          <CtaButton
            variant="primary"
            className="min-h-12 w-full"
            onClick={() => finish('summary')}
          >
            Build · polish summary next
          </CtaButton>
          <CtaButton
            className="min-h-11 w-full"
            onClick={() => finish('preview')}
          >
            Build · see layouts
          </CtaButton>
          <CtaButton className="min-h-11 w-full" onClick={() => finish('jobs')}>
            Build · edit jobs
          </CtaButton>
          <button
            type="button"
            className="rf-btn min-h-11 w-full"
            onClick={() => setStep('you')}
          >
            ← Back
          </button>
        </section>
      )}

      {step !== 'mode' && (
        <p className="text-center text-[10px] text-slate-600">
          {STEPS.map((s) => s.label).join(' → ')}
        </p>
      )}
    </div>
  )
}

function Nav({
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
    <div className="flex flex-col gap-2 pt-1 sm:flex-row">
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
