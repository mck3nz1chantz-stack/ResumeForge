import { useState } from 'react'
import type { ThreeCReport } from '../data/threeCs'
import {
  THREE_C_COPY,
  THREE_C_LABEL,
  craftOverallLabel,
  craftStatusLabel,
} from '../data/threeCs'

type Props = {
  report: ThreeCReport
  compact?: boolean
}

const statusClass: Record<string, string> = {
  Solid: 'text-emerald-400/90',
  OK: 'text-slate-300',
  'Need work': 'text-amber-400/90',
  'Need more': 'text-amber-400/90',
}

/**
 * 3-C craft feedback — quiet status labels, not a gamified % score.
 */
export function ThreeCBar({ report, compact }: Props) {
  const [open, setOpen] = useState<string | null>(null)
  const overall = craftOverallLabel(report)

  return (
    <div
      className={`rounded-xl border border-slate-800 bg-slate-950/60 ${
        compact ? 'p-2' : 'p-3'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            3-C craft
          </p>
          {!compact && (
            <p className="text-xs text-slate-400">
              {THREE_C_LABEL} — structural craft (not an ATS score)
            </p>
          )}
        </div>
        <span className="text-xs text-slate-400">{overall}</span>
      </div>

      <div
        className={`mt-2 grid gap-1.5 ${compact ? 'grid-cols-3' : 'sm:grid-cols-3'}`}
      >
        {report.items.map((item) => {
          const status = craftStatusLabel(item)
          const active = open === item.id
          return (
            <button
              key={item.id}
              type="button"
              aria-expanded={active}
              onClick={() => setOpen(active ? null : item.id)}
              className={`rounded-lg border px-2 py-1.5 text-left transition ${
                item.ok
                  ? 'border-slate-700 bg-slate-900/40'
                  : 'border-slate-800 bg-slate-900/50'
              } ${active ? 'ring-1 ring-amber-600/50' : ''}`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-semibold text-slate-100">
                  {item.label}
                </span>
                <span
                  className={`text-[10px] font-medium ${statusClass[status] ?? 'text-slate-500'}`}
                >
                  {status}
                </span>
              </div>
              {/* Quiet track only when not solid — not a score fill */}
              {!item.ok && (
                <div className="mt-1 h-0.5 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-amber-600/50"
                    style={{
                      width: `${Math.max(12, Math.round(item.score * 100))}%`,
                    }}
                  />
                </div>
              )}
              <p
                className={`mt-0.5 text-[10px] ${
                  status === 'Need more' || status === 'Need work'
                    ? 'text-amber-400/80'
                    : 'text-slate-500'
                }`}
              >
                {item.short}
              </p>
            </button>
          )
        })}
      </div>

      {open && (
        <div className="mt-2 rounded-lg border border-slate-800 bg-slate-900/80 p-2.5 text-xs text-slate-300">
          <p className="font-medium text-slate-100">
            {THREE_C_COPY[open as keyof typeof THREE_C_COPY]?.title}
          </p>
          <p className="mt-1 text-slate-400">
            {THREE_C_COPY[open as keyof typeof THREE_C_COPY]?.principle}
          </p>
          {report.items.find((i) => i.id === open)?.tips.length ? (
            <ul className="mt-2 list-inside list-disc space-y-0.5 text-amber-200/90">
              {report.items
                .find((i) => i.id === open)!
                .tips.map((t) => (
                  <li key={t}>{t}</li>
                ))}
            </ul>
          ) : (
            <p className="mt-2 text-emerald-300/90">Looking solid on this C.</p>
          )}
        </div>
      )}
    </div>
  )
}
