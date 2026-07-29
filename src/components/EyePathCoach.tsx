import { useState } from 'react'
import {
  EYE_PATH_BODY,
  EYE_PATH_FIELDS,
  EYE_PATH_HEADLINE,
  EYE_PATH_SCAN_HINT,
  EYE_PATH_SHORT,
} from '../data/eyePath'

type Props = {
  /** Compact strip under live paper chrome */
  compact?: boolean
  /** Optional scan-mode toggle (live preview) */
  scanMode?: boolean
  onScanModeChange?: (on: boolean) => void
  className?: string
}

/**
 * Research-backed first-pass coach — Clarity craft, not a vendor score.
 */
export function EyePathCoach({
  compact = false,
  scanMode,
  onScanModeChange,
  className = '',
}: Props) {
  const [open, setOpen] = useState(!compact)

  if (compact) {
    return (
      <div
        className={`rounded-lg border border-slate-800 bg-slate-950/50 px-2.5 py-2 ${className}`}
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-400/90">
              {EYE_PATH_HEADLINE}
            </p>
            <p className="mt-0.5 text-[11px] leading-snug text-slate-400">
              {EYE_PATH_SHORT}
            </p>
          </div>
          {onScanModeChange != null && (
            <button
              type="button"
              aria-pressed={Boolean(scanMode)}
              title={EYE_PATH_SCAN_HINT}
              onClick={() => onScanModeChange(!scanMode)}
              className={`min-h-9 shrink-0 rounded-full border px-2.5 text-[11px] font-medium touch-manipulation ${
                scanMode
                  ? 'border-amber-600/50 bg-amber-950/50 text-amber-100'
                  : 'border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              {scanMode ? 'Scan on' : 'Scan'}
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      className={`rounded-xl border border-slate-800 bg-slate-950/40 ${
        open ? 'border-l-2 border-l-amber-600/70' : ''
      } ${className}`}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-start justify-between gap-2 px-3 py-2.5 text-left touch-manipulation"
      >
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-100">
            {EYE_PATH_HEADLINE}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-500">
            Manager scan · Clarity craft · {open ? 'tap to hide' : 'tap for detail'}
          </p>
        </div>
        <span className="shrink-0 text-xs text-amber-400/90" aria-hidden>
          {open ? '−' : '+'}
        </span>
      </button>
      {open && (
        <div className="space-y-2 border-t border-slate-800/80 px-3 py-2.5">
          <p className="text-xs leading-relaxed text-slate-300">{EYE_PATH_BODY}</p>
          <ul className="flex flex-wrap gap-1.5">
            {EYE_PATH_FIELDS.map((f) => (
              <li
                key={f.id}
                className="rounded-full border border-slate-700 bg-slate-900/80 px-2 py-0.5 text-[10px] font-medium text-slate-300"
              >
                {f.label}
              </li>
            ))}
          </ul>
          {onScanModeChange != null && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                aria-pressed={Boolean(scanMode)}
                onClick={() => onScanModeChange(!scanMode)}
                className={`min-h-9 rounded-full border px-3 text-xs font-medium touch-manipulation ${
                  scanMode
                    ? 'border-amber-600/50 bg-amber-950/50 text-amber-100'
                    : 'border-slate-700 text-slate-400'
                }`}
              >
                {scanMode ? 'Scan mode on' : 'Preview scan path'}
              </button>
              <span className="text-[10px] text-slate-500">{EYE_PATH_SCAN_HINT}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
