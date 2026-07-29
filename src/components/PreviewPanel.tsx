import { useMemo, useState, type ReactNode } from 'react'
// tone suggest uses application + profile
import type {
  HeaderAlign,
  NameStyle,
  PageDensity,
  PrintPrefs,
  ResumeApplication,
  ResumeToneId,
  TemplateId,
  TypeScale,
} from '../types/application'
import type { ResumeProfile } from '../types/profile'
import { CtaButton } from './CtaButton'
import { ResumeDocument } from './ResumeDocument'
import { usePressFlash } from '../hooks/usePressFlash'
import { downloadAtsPdf, pdfResultMessage } from '../lib/exportPdf'
import { getPageGuidance } from '../lib/pageGuidance'
import { downloadPlainText, resolvedToPlainText } from '../lib/plainText'
import {
  HEADER_ALIGN_OPTIONS,
  NAME_STYLE_OPTIONS,
  PAGE_DENSITY_OPTIONS,
  TYPE_SCALE_OPTIONS,
  resolvePrintPrefs,
} from '../lib/printPrefs'
import { resolveResume } from '../lib/resolveResume'
import { touchApplication, withTone } from '../lib/applicationFactory'
import { getTemplate, TEMPLATES, visibleTemplates } from '../lib/templates'
import { suggestTone } from '../lib/suggestTone'
import { TonePicker } from './TonePicker'
import { ToneSuggestBanner } from './ToneSuggestBanner'
import { ThreeCBar } from './ThreeCBar'
import { EyePathCoach } from './EyePathCoach'
import { evaluateThreeCs } from '../data/threeCs'

type ViewMode = 'gallery' | 'preview' | 'plaintext'

type Props = {
  profile: ResumeProfile
  application: ResumeApplication | null
  onApplicationChange: (app: ResumeApplication) => void
  /**
   * When no application is active, picking a layout creates/selects a
   * working draft so the gesture always sticks.
   */
  onEnsureApplication?: (templateId: TemplateId) => void
}

export function PreviewPanel({
  profile,
  application,
  onApplicationChange,
  onEnsureApplication,
}: Props) {
  const [mode, setMode] = useState<ViewMode>('gallery')
  const [copyFlash, setCopyFlash] = useState(false)
  const [toneDismissed, setToneDismissed] = useState(false)
  const [scanMode, setScanMode] = useState(false)
  const [pdfNotice, setPdfNotice] = useState<string | null>(null)
  const [densityFilter, setDensityFilter] = useState<
    'all' | 'roomy' | 'balanced' | 'compact' | 'dense'
  >('all')

  const templates = useMemo(() => {
    const all = visibleTemplates(true)
    if (densityFilter === 'all') return all
    return all.filter((t) => t.density === densityFilter)
  }, [densityFilter])

  const view = useMemo(
    () => resolveResume(profile, application),
    [profile, application],
  )
  const guidance = useMemo(() => getPageGuidance(view), [view])
  const plain = useMemo(() => resolvedToPlainText(view), [view])
  const templateMeta = getTemplate(view.templateId)
  const threeC = useMemo(
    () => evaluateThreeCs(profile, view),
    [profile, view],
  )
  const toneSuggestion = useMemo(() => {
    if (!application || toneDismissed) return null
    return suggestTone({
      mode: application.mode,
      targetTitle: application.targetTitle,
      targetCompany: application.targetCompany,
      jobDescription: application.jobDescription,
      jdKeywords: application.jdKeywords,
      jobCount: profile.jobs.length,
      currentTone: application.tone,
    })
  }, [application, profile.jobs.length, toneDismissed])

  const levelStyles = {
    tight: 'border-slate-600 bg-slate-900/50 text-slate-300',
    ok: 'border-slate-700 bg-slate-900/40 text-slate-300',
    long: 'border-amber-800/50 bg-amber-950/30 text-amber-200',
  }[guidance.level]

  const setTemplate = (templateId: TemplateId) => {
    if (application) {
      onApplicationChange(touchApplication({ ...application, templateId }))
    } else if (onEnsureApplication) {
      onEnsureApplication(templateId)
    }
    setMode('preview')
  }

  const patchPrintPrefs = (patch: Partial<PrintPrefs>) => {
    if (!application) return
    const current = resolvePrintPrefs(
      application.printPrefs,
      application.templateId,
    )
    const next = resolvePrintPrefs(
      { ...current, ...patch },
      application.templateId,
    )
    onApplicationChange(
      touchApplication({ ...application, printPrefs: next }),
    )
  }

  const prefs = view.printPrefs

  const copyPlain = async () => {
    try {
      await navigator.clipboard.writeText(plain)
      setCopyFlash(true)
      window.setTimeout(() => setCopyFlash(false), 1200)
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-3 no-print">
        <div>
          <h2 className="text-lg font-semibold text-slate-50">
            {mode === 'gallery'
              ? `Step 1 · Layout (${TEMPLATES.length} templates)`
              : `Step 1 · ${templateMeta.name}`}
          </h2>
          <p className="text-sm text-slate-400">
            Start here — pick the structure that shapes the whole resume. Then
            walk Contact → Summary → Skills → Experience (resume order).
            {application
              ? ` · Build: ${application.label || 'Untitled'}`
              : ' · Creating a draft if you need one'}
          </p>
        </div>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
          <CtaButton
            variant="primary"
            className="min-h-11 flex-1 sm:min-h-10 sm:flex-none"
            actionLabels={{
              busy: 'Making PDF…',
              done: 'PDF ready ✓',
              error: 'PDF failed — try again',
            }}
            onAsyncClick={async () => {
              setPdfNotice(null)
              const result = await downloadAtsPdf(view)
              const msg = pdfResultMessage(result)
              if (msg) {
                setPdfNotice(msg)
                window.setTimeout(() => setPdfNotice(null), 9000)
              }
            }}
          >
            Download PDF
          </CtaButton>
          <CtaButton
            className="min-h-11 flex-1 sm:min-h-10 sm:flex-none"
            onClick={() => window.print()}
          >
            Print
          </CtaButton>
          <CtaButton
            className="min-h-11 flex-1 sm:min-h-10 sm:flex-none"
            actionLabels={{ busy: '…', done: 'Saved ✓' }}
            onAsyncClick={async () => {
              downloadPlainText(view, application?.label)
            }}
          >
            .txt
          </CtaButton>
          <CtaButton
            className="min-h-11 flex-1 sm:min-h-10 sm:flex-none"
            onClick={() => void copyPlain()}
          >
            {copyFlash ? 'Copied ✓' : 'Copy text'}
          </CtaButton>
        </div>
      </header>

      <div className="no-print space-y-3">
        <ThreeCBar report={threeC} />
        <EyePathCoach
          scanMode={scanMode}
          onScanModeChange={setScanMode}
        />
        {pdfNotice && (
          <p
            role="status"
            className="rounded-lg border border-amber-800/50 bg-amber-950/40 px-3 py-2 text-xs leading-relaxed text-amber-100"
          >
            {pdfNotice}
          </p>
        )}
      </div>

      {application && toneSuggestion?.differsFromCurrent && (
        <div className="no-print">
          <ToneSuggestBanner
            suggestion={toneSuggestion}
            currentTone={application.tone || 'ats-external'}
            onAccept={(toneId) => {
              onApplicationChange(withTone(application, toneId))
              setToneDismissed(true)
            }}
            onDismiss={() => setToneDismissed(true)}
          />
        </div>
      )}

      {application && (
        <div className="no-print rf-card">
          <TonePicker
            value={application.tone || 'ats-external'}
            onChange={(toneId: ResumeToneId) => {
              onApplicationChange(withTone(application, toneId))
              setToneDismissed(true)
            }}
          />
        </div>
      )}

      <div className="no-print rf-card space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">
            Type &amp; density
          </h3>
          <p className="mt-0.5 text-xs text-slate-400">
            Locked dials for letter paper and PDF — no freeform sizes. Applies
            to live preview and Download PDF for this target.
          </p>
        </div>
        <PrefRow label="Type size">
          {TYPE_SCALE_OPTIONS.map((o) => (
            <PrefChip
              key={o.id}
              active={prefs.typeScale === o.id}
              label={o.label}
              hint={o.hint}
              disabled={!application}
              onClick={() => patchPrintPrefs({ typeScale: o.id as TypeScale })}
            />
          ))}
        </PrefRow>
        <PrefRow label="Name style">
          {NAME_STYLE_OPTIONS.map((o) => (
            <PrefChip
              key={o.id}
              active={prefs.nameStyle === o.id}
              label={o.label}
              hint={o.hint}
              disabled={!application}
              onClick={() => patchPrintPrefs({ nameStyle: o.id as NameStyle })}
            />
          ))}
        </PrefRow>
        <PrefRow label="Name & contact">
          {HEADER_ALIGN_OPTIONS.map((o) => (
            <PrefChip
              key={o.id}
              active={prefs.headerAlign === o.id}
              label={o.label}
              hint={o.hint}
              disabled={!application}
              onClick={() =>
                patchPrintPrefs({ headerAlign: o.id as HeaderAlign })
              }
            />
          ))}
        </PrefRow>
        <PrefRow label="Page density">
          {PAGE_DENSITY_OPTIONS.map((o) => (
            <PrefChip
              key={o.id}
              active={prefs.pageDensity === o.id}
              label={o.label}
              hint={o.hint}
              disabled={!application}
              onClick={() =>
                patchPrintPrefs({ pageDensity: o.id as PageDensity })
              }
            />
          ))}
        </PrefRow>
        {!application && (
          <p className="text-[11px] text-amber-200/80">
            Pick a layout first to create a working draft — then dial type for
            that target.
          </p>
        )}
      </div>

      <div className="no-print flex flex-wrap gap-1 rounded-lg border border-slate-800 bg-slate-950/50 p-1">
        <ModeTab active={mode === 'gallery'} onClick={() => setMode('gallery')}>
          All layouts ({TEMPLATES.length})
        </ModeTab>
        <ModeTab active={mode === 'preview'} onClick={() => setMode('preview')}>
          Full preview
        </ModeTab>
        <ModeTab
          active={mode === 'plaintext'}
          onClick={() => setMode('plaintext')}
        >
          Plain text
        </ModeTab>
      </div>

      {mode === 'gallery' && (
        <div className="no-print space-y-3">
          <p className="text-xs text-slate-400">
            Every layout is single-column and ATS-safe. Differ by density and
            section order so you can stand out without multi-column gimmicks.
            Tap to apply — full preview opens so you can judge 3-C on paper.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                ['all', 'All'],
                ['roomy', 'Roomy'],
                ['balanced', 'Balanced'],
                ['compact', 'Compact'],
                ['dense', 'Dense'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setDensityFilter(id)}
                className={`min-h-9 rounded-full border px-3 text-xs font-medium ${
                  densityFilter === id
                    ? 'border-amber-600/50 bg-amber-950/40 text-amber-100'
                    : 'border-slate-700 text-slate-400'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {templates.map((t) => {
              const miniView = resolveResume(profile, {
                ...(application ?? {
                  schema: 'ResumeApplication.v1' as const,
                  applicationId: 'preview',
                  profileId: profile.profileId,
                  label: 'Preview',
                  targetTitle: '',
                  targetCompany: '',
                  mode: 'external' as const,
                  industryPackId: profile.defaultIndustryPackId,
                  includeProfessionalEmail: true,
                  includeInternalEmail: false,
                  featuredJobIds: [] as string[],
                  featuredSkillKeys: [] as string[],
                  summaryOverride: '',
                  currentTitle: '',
                  tone: 'ats-external' as const,
                  jobDescription: '',
                  jdKeywords: [] as string[],
                  pinnedBulletKeys: [] as string[],
                  internalCompanyFilter: false,
                  coverLetter: '',
                  printPrefs: resolvePrintPrefs(null, t.id),
                  updatedAt: '',
                }),
                templateId: t.id,
              })
              const active = view.templateId === t.id
              return (
                <GalleryCard
                  key={t.id}
                  active={active}
                  name={t.name}
                  description={t.description}
                  bestFor={t.bestFor}
                  density={t.density}
                  onSelect={() => setTemplate(t.id)}
                >
                  <div className="max-h-56 overflow-hidden bg-slate-800/50 p-2 sm:max-h-64">
                    <div className="origin-top scale-[0.48] sm:scale-[0.44]">
                      <div className="w-[8.5in]">
                        <ResumeDocument view={miniView} mini />
                      </div>
                    </div>
                  </div>
                </GalleryCard>
              )
            })}
          </div>
          <p className="text-center text-xs text-slate-500">
            {templates.length} of {TEMPLATES.length} layouts · all ATS
            single-column
          </p>
          {!application && (
            <p className="text-xs text-amber-200/80">
              No target yet — choosing a layout creates a{' '}
              <strong>Working draft</strong> application so the pick sticks.
            </p>
          )}
        </div>
      )}

      {mode === 'preview' && (
        <>
          <div className={`rf-card no-print border ${levelStyles}`}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm font-medium">
                Length: ~{guidance.estimatedPages} page
                {guidance.estimatedPages === 1 ? '' : 's'} · {guidance.lineCount}{' '}
                lines
              </p>
              <p className="text-xs opacity-80">{guidance.message}</p>
            </div>
            <p className="mt-1 text-xs opacity-80">{guidance.tip}</p>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-800/40 p-3 sm:p-4">
            {/* Fixed letter width — same layout geometry as Download PDF */}
            <div className="ats-letter-paper mx-auto shadow-lg">
              <ResumeDocument
                view={view}
                id="ats-print-root"
                scanMode={scanMode}
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 no-print">
            Paper is US Letter (8.5″). <strong className="text-slate-400">Download PDF</strong> =
            selectable ATS text + layout accents (rules, bullets, skin colors).{' '}
            <strong className="text-slate-400">Print</strong> = full on-screen CSS
            (gradients / bands exact).
          </p>
          {scanMode && (
            <p className="text-[11px] text-amber-200/80 no-print">
              Scan mode is coach-only — Download PDF and Print use normal
              hierarchy (no highlights).
            </p>
          )}
        </>
      )}

      {mode === 'plaintext' && (
        <div className="no-print space-y-2">
          <p className="text-xs text-slate-500">
            Paste into Notepad / TextEdit. All layouts stay single-column for ATS.
          </p>
          <pre className="max-h-[70vh] overflow-auto whitespace-pre-wrap rounded-xl border border-slate-700 bg-slate-950 p-4 font-mono text-xs leading-relaxed text-slate-300">
            {plain || '(empty profile)'}
          </pre>
        </div>
      )}
    </div>
  )
}

function GalleryCard({
  active,
  name,
  description,
  bestFor,
  density,
  onSelect,
  children,
}: {
  active: boolean
  name: string
  description: string
  bestFor: string
  density: string
  onSelect: () => void
  children: ReactNode
}) {
  const { stateClass, pressProps } = usePressFlash(300)
  return (
    <button
      type="button"
      aria-pressed={active}
      className={`rf-clickable overflow-hidden rounded-xl border text-left ${stateClass} ${
        active ? 'rf-clickable-selected' : 'border-slate-700'
      }`}
      onPointerDown={pressProps.onPointerDown}
      onPointerUp={pressProps.onPointerUp}
      onPointerCancel={pressProps.onPointerCancel}
      onPointerLeave={pressProps.onPointerLeave}
      onClick={() => {
        pressProps.onClick()
        onSelect()
      }}
    >
      <div
        className={`border-b px-3 py-2.5 ${
          active
            ? 'border-amber-800/50 bg-amber-950/50'
            : 'border-slate-800 bg-slate-900/80'
        }`}
      >
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="text-sm font-semibold text-slate-100">{name}</p>
          <span className="rounded-full border border-slate-700 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-slate-400">
            {density}
          </span>
          {active ? (
            <span className="text-[11px] font-medium text-amber-400">
              · selected ✓
            </span>
          ) : (
            <span className="text-[11px] text-slate-500">· tap to use</span>
          )}
        </div>
        <p className="mt-1 text-[11px] leading-snug text-slate-400">
          {description}
        </p>
        <p className="mt-1 text-[11px] text-amber-200/70">
          Best for: {bestFor}
        </p>
      </div>
      {children}
    </button>
  )
}

function ModeTab({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  const { stateClass, pressProps } = usePressFlash(250)
  return (
    <button
      type="button"
      aria-pressed={active}
      className={`${active ? 'rf-tab rf-tab-active' : 'rf-tab'} ${stateClass}`}
      onPointerDown={pressProps.onPointerDown}
      onPointerUp={pressProps.onPointerUp}
      onPointerCancel={pressProps.onPointerCancel}
      onPointerLeave={pressProps.onPointerLeave}
      onClick={() => {
        pressProps.onClick()
        onClick()
      }}
    >
      {children}
    </button>
  )
}

function PrefRow({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-24 shrink-0 text-[11px] font-medium uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  )
}

function PrefChip({
  active,
  label,
  hint,
  disabled,
  onClick,
}: {
  active: boolean
  label: string
  hint: string
  disabled?: boolean
  onClick: () => void
}) {
  const { stateClass, pressProps } = usePressFlash(250)
  return (
    <button
      type="button"
      title={hint}
      aria-pressed={active}
      disabled={disabled}
      className={`min-h-9 rounded-full border px-3 text-xs font-medium ${stateClass} ${
        disabled
          ? 'cursor-not-allowed border-slate-800 text-slate-600'
          : active
            ? 'border-amber-600/50 bg-amber-950/40 text-amber-100'
            : 'border-slate-700 text-slate-400 hover:border-slate-600'
      }`}
      onPointerDown={disabled ? undefined : pressProps.onPointerDown}
      onPointerUp={disabled ? undefined : pressProps.onPointerUp}
      onPointerCancel={disabled ? undefined : pressProps.onPointerCancel}
      onPointerLeave={disabled ? undefined : pressProps.onPointerLeave}
      onClick={() => {
        if (disabled) return
        pressProps.onClick()
        onClick()
      }}
    >
      {label}
    </button>
  )
}
