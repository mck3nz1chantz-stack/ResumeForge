import { useEffect, useId, useRef, useState } from 'react'
import type { ResumeApplication } from '../types/application'
import { useDialogFocus } from '../hooks/useDialogFocus'
import { TEMPLATES } from '../lib/templates'
import { CtaButton } from './CtaButton'

type SaveMode = 'save' | 'save-as'

type Props = {
  applications: ResumeApplication[]
  activeId: string | null
  /** Brief flash after explicit Save */
  saveFlash?: boolean
  onSelect: (id: string | null) => void
  /**
   * Save current version (already named) — caller flushes + flashes.
   * Return false to cancel (rare).
   */
  onSaveCurrent: () => void
  /**
   * Create / name a version. `base` is the app to clone when Save as;
   * omit for a fresh version from master defaults.
   */
  onCommitNamed: (label: string, mode: SaveMode) => void
  /** Jump to Target / apps for rename, delete, featured jobs, etc. */
  onManage: () => void
  /** Primary: open New Build dialog (new resume for a role) */
  onNewBuild: () => void
}

/**
 * Always-visible builds strip: New Build + load dropdown + Save.
 * Builds share master contact/jobs; each picks which jobs print.
 */
export function VersionSwitcher({
  applications,
  activeId,
  saveFlash = false,
  onSelect,
  onSaveCurrent,
  onCommitNamed,
  onManage,
  onNewBuild,
}: Props) {
  const [dialog, setDialog] = useState<SaveMode | null>(null)
  const [name, setName] = useState('')
  const dialogRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const descId = useId()

  const active =
    applications.find((a) => a.applicationId === activeId) ?? null

  useDialogFocus(dialog !== null, dialogRef, {
    lockScroll: true,
    initialFocusSelector: '[data-rf-version-name]',
  })

  useEffect(() => {
    if (!dialog) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDialog(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [dialog])

  const openSave = () => {
    if (active) {
      onSaveCurrent()
      return
    }
    setName(suggestLabel(null, applications))
    setDialog('save')
  }

  const openSaveAs = () => {
    setName(suggestLabel(active, applications))
    setDialog('save-as')
  }

  const commitDialog = () => {
    const label = name.trim() || 'Untitled version'
    if (!dialog) return
    onCommitNamed(label, dialog)
    setDialog(null)
    setName('')
  }

  const versionCount = applications.length

  return (
    <>
      <div className="no-print rounded-xl border border-amber-900/40 bg-gradient-to-b from-amber-950/40 to-slate-900/80 px-3 py-3 shadow-sm shadow-black/20">
        <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-500/90">
              Builds
            </p>
            <p className="text-sm text-slate-300">
              {active ? (
                <>
                  Working on{' '}
                  <strong className="font-semibold text-amber-100">
                    {active.label || 'Untitled'}
                  </strong>
                </>
              ) : (
                <span className="text-slate-400">
                  No build selected — master info only
                </span>
              )}
              {saveFlash ? (
                <span className="ml-1.5 text-emerald-400">· Saved</span>
              ) : null}
            </p>
          </div>
          <CtaButton
            variant="primary"
            className="min-h-12 min-w-[9.5rem] flex-1 touch-manipulation text-base font-bold sm:flex-none sm:px-5"
            onClick={onNewBuild}
            title="Create a new resume for a role (master contact + jobs stay)"
          >
            + New Build
          </CtaButton>
        </div>

        <div className="flex flex-wrap items-end gap-2 sm:gap-3">
          <label className="min-w-0 flex-1 basis-[12rem]">
            <span className="rf-label !mb-1 flex items-center justify-between gap-2">
              <span>Load a build</span>
              <span className="font-normal normal-case tracking-normal text-slate-500">
                {versionCount === 0
                  ? 'none yet'
                  : `${versionCount} saved`}
              </span>
            </span>
            <select
              className="rf-input min-h-11 w-full touch-manipulation text-sm sm:min-h-10"
              value={activeId ?? ''}
              aria-label="Load a saved build"
              onChange={(e) => {
                const v = e.target.value
                onSelect(v === '' ? null : v)
              }}
            >
              <option value="">
                Master only (edit bank — no target resume)
              </option>
              {applications.map((app) => {
                const template =
                  TEMPLATES.find((t) => t.id === app.templateId)?.name ??
                  app.templateId
                const sub = [
                  app.mode === 'internal' ? 'internal' : 'external',
                  template,
                  app.targetTitle?.trim() || null,
                ]
                  .filter(Boolean)
                  .join(' · ')
                return (
                  <option key={app.applicationId} value={app.applicationId}>
                    {(app.label || 'Untitled').trim()}
                    {sub ? ` — ${sub}` : ''}
                  </option>
                )
              })}
            </select>
          </label>

          <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:shrink-0">
            <CtaButton
              className="min-h-11 min-w-[5rem] flex-1 touch-manipulation text-sm font-semibold sm:min-h-10 sm:flex-none"
              onClick={openSave}
              actionLabels={
                active
                  ? {
                      busy: 'Saving…',
                      done: 'Saved ✓',
                    }
                  : undefined
              }
              onAsyncClick={
                active
                  ? async () => {
                      onSaveCurrent()
                    }
                  : undefined
              }
              title="Save this build’s settings"
            >
              Save
            </CtaButton>
            <CtaButton
              className="min-h-11 flex-1 touch-manipulation text-sm sm:min-h-10 sm:flex-none"
              onClick={openSaveAs}
              title="Duplicate this build under a new name"
            >
              Save as…
            </CtaButton>
            <CtaButton
              className="min-h-11 flex-1 touch-manipulation text-sm sm:min-h-10 sm:flex-none"
              onClick={onManage}
              title="Jobs on this resume, tone, rename, delete"
            >
              Edit build
            </CtaButton>
          </div>
        </div>
        <p className="mt-2 text-[11px] leading-snug text-slate-500">
          <strong className="font-medium text-slate-400">New Build</strong> =
          new resume for a job. Master bank (contact + all roles) is shared.
          Each build checkboxes which jobs appear.
        </p>
      </div>

      {dialog && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-3 sm:items-center"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setDialog(null)
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descId}
            className="w-full max-w-md rounded-2xl border border-slate-700 bg-[#121820] p-4 shadow-xl shadow-black/40"
          >
            <h2
              id={titleId}
              className="text-base font-semibold text-slate-50"
            >
              {dialog === 'save-as'
                ? 'Save as new version'
                : 'Save resume version'}
            </h2>
            <p id={descId} className="mt-1 text-sm text-slate-400">
              {dialog === 'save-as'
                ? 'Creates another named version. Master profile stays shared — only target settings are copied.'
                : 'Name this version so you can load it later from the dropdown. Master history stays one place.'}
            </p>
            <label className="mt-4 block">
              <span className="rf-label">Version name</span>
              <input
                data-rf-version-name
                className="rf-input min-h-11"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    commitDialog()
                  }
                }}
                placeholder="e.g. Production Supervisor — Acme"
                autoComplete="off"
              />
            </label>
            <div className="mt-4 flex flex-wrap gap-2">
              <CtaButton
                variant="primary"
                className="min-h-11 flex-1 font-semibold sm:flex-none"
                onClick={commitDialog}
              >
                Save version
              </CtaButton>
              <CtaButton
                className="min-h-11 flex-1 sm:flex-none"
                onClick={() => setDialog(null)}
              >
                Cancel
              </CtaButton>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function suggestLabel(
  active: ResumeApplication | null,
  all: ResumeApplication[],
): string {
  if (active) {
    const base = (active.label || 'Version').trim()
    const copy = `${base} (copy)`
    if (!all.some((a) => a.label === copy)) return copy
    let n = 2
    while (all.some((a) => a.label === `${base} (${n})`)) n += 1
    return `${base} (${n})`
  }
  return 'Working draft'
}
