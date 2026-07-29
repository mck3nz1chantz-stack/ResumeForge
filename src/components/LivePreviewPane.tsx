import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from 'react'
import type { ResumeApplication } from '../types/application'
import type { ResolvedResume } from '../lib/resolveResume'
import { getPageGuidance } from '../lib/pageGuidance'
import { resolvedToPlainText } from '../lib/plainText'
import { getTemplate } from '../lib/templates'
import type { ThreeCReport } from '../data/threeCs'
import { craftOverallLabel, craftStatusLabel } from '../data/threeCs'
import { CtaButton } from './CtaButton'
import { EyePathCoach } from './EyePathCoach'
import { ResumeDocument } from './ResumeDocument'
import { ThreeCBar } from './ThreeCBar'

type ZoomMode = 'fit' | '90' | '100'

type Props = {
  view: ResolvedResume
  application: ResumeApplication | null
  threeC: ThreeCReport
  /** Mobile expanded drawer vs desktop sticky column */
  variant: 'desktop' | 'mobile-sheet' | 'mobile-bar'
  expanded?: boolean
  onToggleExpand?: () => void
  onExportPdf?: () => Promise<void>
  onOpenLayout?: () => void
  onPrint?: () => void
  /** For a11y return focus from sheet */
  barButtonRef?: RefObject<HTMLButtonElement | null>
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/**
 * Always-on live resume — updates as the operator types.
 * Desktop: sticky paper column with zoom. Mobile: bar + full sheet.
 * Paper is the hero; craft chrome sits below.
 */
export function LivePreviewPane({
  view,
  application,
  threeC,
  variant,
  expanded,
  onToggleExpand,
  onExportPdf,
  onOpenLayout,
  onPrint,
  barButtonRef,
}: Props) {
  const template = getTemplate(view.templateId)
  const guidance = useMemo(() => getPageGuidance(view), [view])
  const [zoom, setZoom] = useState<ZoomMode>('fit')
  const [scanMode, setScanMode] = useState(false)
  const [flash, setFlash] = useState(false)
  const [fitScale, setFitScale] = useState(0.72)
  const [paperHeight, setPaperHeight] = useState(0)
  const shellRef = useRef<HTMLDivElement>(null)
  const paperRef = useRef<HTMLDivElement>(null)
  const skipFlash = useRef(true)

  const fingerprint = useMemo(() => {
    try {
      return resolvedToPlainText(view).slice(0, 2000)
    } catch {
      return view.contact.name + view.summary
    }
  }, [view])

  // Debounced pulse when resume content settles (not every keystroke)
  useEffect(() => {
    if (skipFlash.current) {
      skipFlash.current = false
      return
    }
    if (prefersReducedMotion()) return
    const settle = window.setTimeout(() => {
      setFlash(true)
      window.setTimeout(() => setFlash(false), 400)
    }, 500)
    return () => window.clearTimeout(settle)
  }, [fingerprint])

  // Fit = shrink letter (816px layout) into the shell; never reflow paper width
  useEffect(() => {
    if (variant === 'mobile-bar') return
    const el = shellRef.current
    if (!el) return
    const measure = () => {
      const w = el.clientWidth
      const s = Math.min(1, Math.max(0.4, (w - 16) / 816))
      setFitScale(s)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [variant])

  /** Visual zoom only — layout width stays US Letter 816px */
  const scale = zoom === '100' ? 1 : zoom === '90' ? 0.9 : fitScale

  // Unscaled paper height → outer box = height * scale (kills ghost scroll)
  useEffect(() => {
    if (variant === 'mobile-bar') return
    const el = paperRef.current
    if (!el) {
      setPaperHeight(0)
      return
    }
    const measure = () => setPaperHeight(el.offsetHeight)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [variant, fingerprint, scale])

  const pageLevelClass =
    guidance.level === 'long'
      ? 'border-amber-700/50 text-amber-200'
      : guidance.level === 'tight'
        ? 'border-slate-600 text-slate-300'
        : 'border-slate-700 text-slate-300'

  const emptyish =
    !view.contact.name.trim() &&
    !view.summary.trim() &&
    view.jobs.length === 0 &&
    view.skills.hard.length +
      view.skills.tools.length +
      view.skills.soft.length ===
      0

  if (variant === 'mobile-bar') {
    const overall = craftOverallLabel(threeC)
    return (
      <button
        ref={barButtonRef}
        type="button"
        onClick={onToggleExpand}
        aria-expanded={expanded}
        className="rf-live-bar flex min-h-12 w-full items-center justify-between gap-2 border-t border-slate-800 bg-[#0f141c] px-3 py-2.5 text-left shadow-[0_-4px_24px_rgba(0,0,0,0.4)]"
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className={`flex size-9 shrink-0 items-center justify-center rounded-lg border bg-white text-[10px] font-bold text-neutral-800 shadow-sm ${
              flash ? 'rf-live-flash' : 'border-slate-600'
            }`}
            aria-hidden
          >
            RF
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-400/90">
              Live resume
            </p>
            <p className="truncate text-xs text-slate-300">
              {view.contact.name.trim() || 'Your name'} · {template.short}
              {view.targetTitle ? ` · ${view.targetTitle}` : ''}
            </p>
            <div className="mt-1 flex gap-1" aria-hidden>
              {threeC.items.map((item) => {
                const st = craftStatusLabel(item)
                return (
                  <span
                    key={item.id}
                    title={`${item.label}: ${st}`}
                    className={`h-1 w-5 rounded-full ${
                      st === 'Solid'
                        ? 'bg-emerald-600/80'
                        : st === 'OK'
                          ? 'bg-slate-500'
                          : 'bg-amber-600/70'
                    }`}
                  />
                )
              })}
            </div>
          </div>
        </div>
        <span className="shrink-0 rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-slate-200">
          {expanded ? 'Hide' : 'Open'}
          <span className="ml-1 text-slate-500">· {overall}</span>
        </span>
      </button>
    )
  }

  const isSheet = variant === 'mobile-sheet'
  const shell = isSheet
    ? 'rf-live-sheet flex max-h-[min(88dvh,720px)] flex-col gap-2 overflow-hidden rounded-t-2xl border border-slate-700/80 bg-[#0b0f14] p-3 shadow-2xl'
    : 'rf-live-desktop flex h-full min-h-0 flex-col gap-2'

  return (
    <div className={shell}>
      {/* Thin chrome — paper is the hero below */}
      <div className="flex flex-wrap items-center justify-between gap-2 no-print">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-400/90">
            Live resume
          </p>
          <p className="truncate text-sm font-medium text-slate-100">
            {template.name}
            {application?.label ? ` · ${application.label}` : ''}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {onOpenLayout && (
            <CtaButton className="min-h-9 text-xs" onClick={onOpenLayout}>
              Layout
            </CtaButton>
          )}
          {onPrint && (
            <CtaButton className="min-h-9 text-xs" onClick={onPrint}>
              Print
            </CtaButton>
          )}
          {onExportPdf && (
            <CtaButton
              variant="primary"
              className="min-h-9 text-xs"
              actionLabels={{
                busy: '…',
                done: '✓',
                error: 'PDF failed',
              }}
              onAsyncClick={onExportPdf}
            >
              PDF
            </CtaButton>
          )}
          {isSheet && onToggleExpand && (
            <CtaButton
              className="min-h-9 text-xs"
              data-rf-close
              onClick={onToggleExpand}
            >
              Close
            </CtaButton>
          )}
        </div>
      </div>

      {/* Paper first */}
      <div
        ref={shellRef}
        className={`rf-live-viewport relative min-h-0 flex-1 overflow-auto rounded-xl border bg-slate-950/80 shadow-inner ${
          flash ? 'rf-live-flash border-amber-600/50' : 'border-slate-800'
        } ${variant === 'desktop' ? 'max-h-[calc(100dvh-12rem)]' : ''}`}
      >
        {/* Edge toolbar: page tip + scan + zoom */}
        <div className="no-print sticky top-0 z-[1] flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 bg-[#0f141c]/95 px-2 py-1.5 backdrop-blur-sm">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${pageLevelClass} bg-slate-950/50`}
              title={guidance.tip}
            >
              ~{guidance.estimatedPages} pg · {guidance.level}
            </span>
            <button
              type="button"
              aria-pressed={scanMode}
              title="Highlight manager first-pass fields (coach only)"
              onClick={() => setScanMode((v) => !v)}
              className={`min-h-9 rounded-full border px-2.5 text-[10px] font-medium touch-manipulation ${
                scanMode
                  ? 'border-amber-600/50 bg-amber-950/50 text-amber-100'
                  : 'border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              {scanMode ? 'Scan on' : 'Scan'}
            </button>
          </div>
          <div className="flex rounded-lg border border-slate-800 bg-slate-950/60 p-0.5">
            {(
              [
                ['fit', 'Fit'],
                ['90', '90%'],
                ['100', '100%'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setZoom(id)}
                className={`min-h-11 min-w-11 rounded-md px-2.5 text-[11px] font-medium touch-manipulation ${
                  zoom === id
                    ? 'bg-slate-800 text-amber-100'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {emptyish ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 p-6 text-center">
            <p className="text-sm font-medium text-slate-300">
              Empty draft — start typing
            </p>
            <p className="max-w-xs text-xs text-slate-400">
              Fill Contact → Jobs → Skills. This paper updates live so you can
              steer Clarity · Conciseness · Consistency as you go.
            </p>
          </div>
        ) : (
          <div className="rf-live-paper-wrap p-2 sm:p-3">
            {/*
              Letter paper is ALWAYS 816px wide (same as PDF layout).
              Fit/90%/100% only change transform:scale — never reflow type.
            */}
            <div
              className="mx-auto overflow-hidden"
              style={
                paperHeight > 0
                  ? {
                      height: Math.ceil(paperHeight * scale),
                      width: Math.ceil(816 * scale),
                    }
                  : { width: Math.ceil(816 * scale) }
              }
            >
              <div
                className="rf-live-paper-scale origin-top"
                style={{
                  transform: `scale(${scale})`,
                  width: 816,
                }}
              >
                <div
                  ref={paperRef}
                  className="rf-live-paper ats-letter-paper mx-auto shadow-lg"
                >
                  <ResumeDocument view={view} scanMode={scanMode} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Craft below paper */}
      <div className="no-print shrink-0 space-y-1.5">
        <EyePathCoach
          compact
          scanMode={scanMode}
          onScanModeChange={setScanMode}
        />
        <ThreeCBar report={threeC} compact />
      </div>

      <p className="text-[10px] leading-relaxed text-slate-500 no-print">
        {guidance.message} {guidance.tip} · Letter paper 8.5″ · PDF =
        ATS + skin accents · Print = full CSS
      </p>
    </div>
  )
}
