import { useState } from 'react'
import {
  PRIVACY_BULLETS,
  PRIVACY_COMPACT_LINE,
  PRIVACY_HEADLINE,
  PRIVACY_HOSTING_NOTE,
  PRIVACY_SHORT,
} from '../data/privacy'
import { CtaButton } from './CtaButton'
import { usePressFlash } from '../hooks/usePressFlash'

type Props = {
  onExport: () => void
  onImportClick: () => void
  compact?: boolean
  /** Saved resume iterations on this browser */
  appsCount?: number
  /** Master job bank size on this browser */
  jobCount?: number
  /** Jump to Jobs to type a role on an empty device */
  onAddJob?: () => void
}

function deviceCountLine(jobCount: number, appsCount: number): string {
  const jobs = `${jobCount} job${jobCount === 1 ? '' : 's'}`
  const resumes = `${appsCount} resume${appsCount === 1 ? '' : 's'}`
  return `${jobs} · ${resumes}`
}

/**
 * Privacy + device-bank honesty. Empty browsers lead with Import backup.
 * Mac and phone do not share localStorage.
 */
export function DeviceDataBanner({
  onExport,
  onImportClick,
  compact,
  appsCount = 0,
  jobCount = 0,
  onAddJob,
}: Props) {
  const empty = jobCount === 0
  const [open, setOpen] = useState(!compact || empty)
  const compactFlash = usePressFlash(280)
  const counts = deviceCountLine(jobCount, appsCount)

  if (empty) {
    return (
      <div
        className="no-print rounded-xl border border-amber-800/50 bg-amber-950/25 p-3 sm:p-4"
        role="status"
      >
        <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-500/90">
          This device is empty
        </p>
        <h2 className="mt-1 text-base font-semibold text-slate-50">
          Import your job bank to apply from here
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-300">
          Resume data stays in <strong className="font-medium text-slate-200">this
          browser only</strong>. A phone does not see jobs you entered on a
          computer until you move a backup file.
        </p>
        <ol className="mt-3 list-inside list-decimal space-y-1 text-sm text-slate-400">
          <li>
            On the computer:{' '}
            <strong className="text-slate-200">Export full backup</strong> (JSON)
          </li>
          <li>AirDrop, Files, USB, or email that file to this phone</li>
          <li>
            Here: <strong className="text-slate-200">Import backup</strong> —
            then Apply uses your jobs
          </li>
        </ol>
        <p className="mt-2 text-xs text-slate-500">
          This device: {counts}
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <CtaButton
            variant="primary"
            className="min-h-12 flex-1 font-semibold"
            onClick={onImportClick}
          >
            Import backup
          </CtaButton>
          {onAddJob ? (
            <CtaButton className="min-h-12 flex-1" onClick={onAddJob}>
              Add a job
            </CtaButton>
          ) : null}
        </div>
      </div>
    )
  }

  if (compact && !open) {
    return (
      <button
        type="button"
        className={`no-print rf-clickable flex w-full items-center justify-between gap-2 rounded-lg border border-emerald-900/50 bg-emerald-950/25 px-3 py-2.5 text-left text-xs text-slate-200 ${compactFlash.stateClass}`}
        {...compactFlash.pressProps}
        onClick={() => {
          compactFlash.pressProps.onClick()
          setOpen(true)
        }}
      >
        <span>
          <span className="lg:hidden">
            This phone: {counts}
          </span>
          <span className="hidden lg:inline">
            This device: {counts}
          </span>
          <span className="mt-0.5 block text-[11px] text-slate-400">
            {PRIVACY_COMPACT_LINE}
          </span>
        </span>
        <span className="shrink-0 font-medium text-amber-300/90 underline decoration-amber-600/40 underline-offset-2">
          Privacy & backup →
        </span>
      </button>
    )
  }

  return (
    <div className="no-print rounded-xl border border-emerald-900/45 bg-emerald-950/20 p-3 sm:p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-emerald-100">
            {PRIVACY_HEADLINE}
          </p>
          <p className="mt-1 text-xs font-medium text-slate-200">
            <span className="lg:hidden">This phone: {counts}</span>
            <span className="hidden lg:inline">This device: {counts}</span>
          </p>
          <p className="mt-1 text-xs leading-relaxed text-slate-300">
            {PRIVACY_SHORT}
          </p>
          <ul className="mt-2 space-y-1 text-xs leading-relaxed text-slate-400">
            {PRIVACY_BULLETS.map((b) => (
              <li key={b} className="flex gap-2">
                <span className="mt-1.5 size-1 shrink-0 rounded-full bg-emerald-500/80" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
            {PRIVACY_HOSTING_NOTE}
          </p>
          <ol className="mt-2 list-inside list-decimal text-xs text-slate-400">
            <li>
              <strong className="text-slate-200">Export backup</strong> on this
              device (downloads one JSON file you own)
            </li>
            <li>Move the file yourself (AirDrop, USB, encrypted drive, email)</li>
            <li>
              <strong className="text-slate-200">Import backup</strong> on the
              other device — still local there
            </li>
          </ol>
        </div>
        {compact && (
          <CtaButton className="text-xs" onClick={() => setOpen(false)}>
            Hide
          </CtaButton>
        )}
      </div>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <CtaButton
          variant="primary"
          className="min-h-11 flex-1"
          actionLabels={{
            busy: '…',
            done: 'Exported ✓',
            error: 'Export failed',
          }}
          onAsyncClick={async () => {
            onExport()
          }}
        >
          Export full backup
        </CtaButton>
        <CtaButton className="min-h-11 flex-1" onClick={onImportClick}>
          Import backup
        </CtaButton>
      </div>
    </div>
  )
}
