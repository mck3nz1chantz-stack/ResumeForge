import { useEffect, useId, useRef, useState } from 'react'
import {
  TUTORIAL_FOOTER,
  TUTORIAL_GITHUB,
  TUTORIAL_STEPS,
  TUTORIAL_SUBTITLE,
  TUTORIAL_TITLE,
} from '../data/tutorial'
import { useDialogFocus } from '../hooks/useDialogFocus'
import { CtaButton } from './CtaButton'

type Props = {
  open: boolean
  onClose: () => void
  /** Jump into first content step after welcome (optional) */
  initialStepId?: string
}

/**
 * Always-available product tutorial — master vs builds, path, tailor, backup.
 */
export function HowToUseDialog({ open, onClose, initialStepId }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const descId = useId()
  const startIndex = Math.max(
    0,
    TUTORIAL_STEPS.findIndex((s) => s.id === initialStepId),
  )
  const [index, setIndex] = useState(startIndex === -1 ? 0 : startIndex)

  useDialogFocus(open, dialogRef, {
    lockScroll: true,
    initialFocusSelector: '[data-rf-tutorial-close]',
  })

  useEffect(() => {
    if (!open) return
    const i = TUTORIAL_STEPS.findIndex((s) => s.id === initialStepId)
    setIndex(i >= 0 ? i : 0)
  }, [open, initialStepId])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') {
        setIndex((i) => Math.min(TUTORIAL_STEPS.length - 1, i + 1))
      }
      if (e.key === 'ArrowLeft') {
        setIndex((i) => Math.max(0, i - 1))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const step = TUTORIAL_STEPS[index] ?? TUTORIAL_STEPS[0]
  const isFirst = index === 0
  const isLast = index === TUTORIAL_STEPS.length - 1

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="flex max-h-[min(92dvh,40rem)] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-slate-700 bg-[#121820] shadow-2xl sm:rounded-2xl"
      >
        <header className="shrink-0 border-b border-slate-800 px-4 py-3 sm:px-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-500/90">
                Tutorial · free · on-device
              </p>
              <h2
                id={titleId}
                className="text-lg font-semibold tracking-tight text-slate-50"
              >
                {TUTORIAL_TITLE}
              </h2>
              <p id={descId} className="mt-0.5 text-xs text-slate-400">
                {TUTORIAL_SUBTITLE}
              </p>
              <a
                href={TUTORIAL_GITHUB.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex max-w-full items-center gap-1 text-xs font-semibold text-sky-300 underline-offset-2 hover:text-sky-200 hover:underline"
              >
                {TUTORIAL_GITHUB.label}
                <span className="font-normal text-slate-500" aria-hidden>
                  ↗
                </span>
              </a>
              <p className="mt-0.5 text-[10px] leading-snug text-slate-500">
                {TUTORIAL_GITHUB.hint}
              </p>
            </div>
            <button
              type="button"
              data-rf-tutorial-close
              className="rf-btn min-h-10 shrink-0 px-3 text-sm"
              onClick={onClose}
              aria-label="Close tutorial"
            >
              Close
            </button>
          </div>

          {/* Step dots */}
          <ol
            className="mt-3 flex flex-wrap gap-1.5"
            aria-label={`Step ${index + 1} of ${TUTORIAL_STEPS.length}`}
          >
            {TUTORIAL_STEPS.map((s, i) => (
              <li key={s.id}>
                <button
                  type="button"
                  className={`h-2 w-2 rounded-full transition-colors ${
                    i === index
                      ? 'bg-amber-500'
                      : i < index
                        ? 'bg-amber-800/80'
                        : 'bg-slate-700'
                  }`}
                  aria-label={`${s.title}${i === index ? ' (current)' : ''}`}
                  aria-current={i === index ? 'step' : undefined}
                  onClick={() => setIndex(i)}
                />
              </li>
            ))}
          </ol>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
            Step {index + 1} of {TUTORIAL_STEPS.length}
          </p>
          <h3 className="mt-1 text-base font-semibold text-slate-50">
            {step.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            {step.body}
          </p>
          {step.bullets && step.bullets.length > 0 && (
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-300">
              {step.bullets.map((b) => (
                <li key={b} className="flex gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-amber-500/80" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          )}
          {step.tip && (
            <p className="mt-4 rounded-lg border border-amber-900/40 bg-amber-950/30 px-3 py-2.5 text-xs leading-relaxed text-amber-100/95">
              <span className="font-semibold text-amber-200">Tip · </span>
              {step.tip}
            </p>
          )}
        </div>

        <footer className="shrink-0 space-y-2 border-t border-slate-800 px-4 py-3 sm:px-5">
          <div className="flex flex-wrap gap-2">
            <CtaButton
              className="min-h-11 flex-1"
              disabled={isFirst}
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
            >
              Back
            </CtaButton>
            {!isLast ? (
              <CtaButton
                variant="primary"
                className="min-h-11 flex-1"
                onClick={() =>
                  setIndex((i) => Math.min(TUTORIAL_STEPS.length - 1, i + 1))
                }
              >
                Next
              </CtaButton>
            ) : (
              <CtaButton
                variant="primary"
                className="min-h-11 flex-1"
                onClick={onClose}
              >
                Got it
              </CtaButton>
            )}
          </div>
          <p className="text-center text-[10px] text-slate-500">
            {TUTORIAL_FOOTER} · Arrow keys to step
          </p>
          <p className="text-center text-[10px]">
            <a
              href={TUTORIAL_GITHUB.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-sky-400/90 underline-offset-2 hover:underline"
            >
              {TUTORIAL_GITHUB.url.replace(/^https:\/\//, '')}
            </a>
          </p>
        </footer>
      </div>
    </div>
  )
}
