import { useEffect, useId, useRef, useState } from 'react'
import type { ApplicationMode } from '../types/application'
import { useDialogFocus } from '../hooks/useDialogFocus'
import { CtaButton } from './CtaButton'

export type NewBuildDraft = {
  label: string
  mode: ApplicationMode
  targetTitle: string
  targetCompany: string
}

type Props = {
  open: boolean
  onClose: () => void
  onStart: (draft: NewBuildDraft) => void
  /** Prefill name suggestion */
  suggestedLabel?: string
}

/**
 * Primary “start a new resume for a role” dialog.
 * Master contact + job bank stay; this only creates a new build/version.
 */
export function NewBuildDialog({
  open,
  onClose,
  onStart,
  suggestedLabel = '',
}: Props) {
  const [label, setLabel] = useState(suggestedLabel)
  const [mode, setMode] = useState<ApplicationMode>('external')
  const [targetTitle, setTargetTitle] = useState('')
  const [targetCompany, setTargetCompany] = useState('')
  const dialogRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const descId = useId()

  useDialogFocus(open, dialogRef, {
    lockScroll: true,
    initialFocusSelector: '[data-rf-new-build-name]',
  })

  useEffect(() => {
    if (!open) return
    setLabel(suggestedLabel)
    setMode('external')
    setTargetTitle('')
    setTargetCompany('')
  }, [open, suggestedLabel])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const commit = () => {
    const title = targetTitle.trim()
    const company = targetCompany.trim()
    let name = label.trim()
    if (!name) {
      if (title && company) name = `${title} @ ${company}`
      else if (title) name = title
      else if (company) name = company
      else name = mode === 'internal' ? 'Internal promotion' : 'New external build'
    }
    onStart({
      label: name,
      mode,
      targetTitle: title,
      targetCompany: company,
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-3 sm:items-center"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="w-full max-w-lg rounded-2xl border border-amber-800/40 bg-[#121820] p-4 shadow-xl shadow-black/50 sm:p-5"
      >
        <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-500/90">
          New build
        </p>
        <h2 id={titleId} className="mt-1 text-lg font-semibold text-slate-50">
          Start a resume for a specific role
        </h2>
        <p id={descId} className="mt-1.5 text-sm leading-relaxed text-slate-400">
          Your <strong className="font-medium text-slate-300">name, emails, and job
          bank</strong> stay put. This creates a separate build you can load later —
          pick which jobs print, layout, and overrides for this target only.
        </p>

        <div className="mt-4 space-y-3">
          <fieldset>
            <legend className="rf-label">Who is this for?</legend>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              <button
                type="button"
                className={`min-h-12 rounded-xl border px-3 py-2 text-left text-sm touch-manipulation ${
                  mode === 'external'
                    ? 'border-amber-600/60 bg-amber-950/40 text-amber-50 ring-1 ring-amber-700/40'
                    : 'border-slate-700 bg-slate-900/50 text-slate-300'
                }`}
                onClick={() => setMode('external')}
              >
                <span className="block font-semibold">External</span>
                <span className="mt-0.5 block text-[11px] text-slate-500">
                  Outside company · personal email
                </span>
              </button>
              <button
                type="button"
                className={`min-h-12 rounded-xl border px-3 py-2 text-left text-sm touch-manipulation ${
                  mode === 'internal'
                    ? 'border-amber-600/60 bg-amber-950/40 text-amber-50 ring-1 ring-amber-700/40'
                    : 'border-slate-700 bg-slate-900/50 text-slate-300'
                }`}
                onClick={() => setMode('internal')}
              >
                <span className="block font-semibold">Internal</span>
                <span className="mt-0.5 block text-[11px] text-slate-500">
                  Promotion / in-house · work email
                </span>
              </button>
            </div>
          </fieldset>

          <div className="grid gap-3 sm:grid-cols-2">
            <label>
              <span className="rf-label">Target title (optional)</span>
              <input
                className="rf-input min-h-11"
                value={targetTitle}
                onChange={(e) => setTargetTitle(e.target.value)}
                placeholder="e.g. Production Supervisor"
                autoComplete="off"
              />
            </label>
            <label>
              <span className="rf-label">Company (optional)</span>
              <input
                className="rf-input min-h-11"
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
                placeholder="e.g. Acme Plants"
                autoComplete="off"
              />
            </label>
          </div>

          <label>
            <span className="rf-label">Build name</span>
            <input
              data-rf-new-build-name
              className="rf-input min-h-11"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  commit()
                }
              }}
              placeholder="e.g. Supervisor — Acme (external)"
              autoComplete="off"
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Shows in the builds dropdown so you can switch later.
            </p>
          </label>
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <CtaButton
            variant="primary"
            className="min-h-12 flex-1 text-base font-semibold sm:flex-none sm:px-6"
            onClick={commit}
          >
            Start this build →
          </CtaButton>
          <CtaButton
            className="min-h-12 flex-1 sm:flex-none"
            onClick={onClose}
          >
            Cancel
          </CtaButton>
        </div>
      </div>
    </div>
  )
}
