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
  /** Shown under primary backup actions (e.g. app count) */
  appsCount?: number
}

/**
 * Privacy-first banner — on-device storage, no cloud for resume content.
 * Export = full backup (profile + applications) you control.
 */
export function DeviceDataBanner({
  onExport,
  onImportClick,
  compact,
  appsCount = 0,
}: Props) {
  const [open, setOpen] = useState(!compact)
  const compactFlash = usePressFlash(280)

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
          <strong className="font-semibold text-emerald-200/95">
            {PRIVACY_COMPACT_LINE}
          </strong>
          {appsCount > 0
            ? ` · ${appsCount} build${appsCount === 1 ? '' : 's'} here`
            : ''}
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
          {appsCount > 0 && (
            <p className="mt-1.5 text-[11px] text-slate-500">
              This device currently holds {appsCount} saved build
              {appsCount === 1 ? '' : 's'} plus your master profile.
            </p>
          )}
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
