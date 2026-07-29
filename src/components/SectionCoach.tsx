import { useState } from 'react'
import type { ExpertScaffold } from '../data/expertScaffolds'
import { CtaButton } from './CtaButton'

type Props = {
  scaffold: ExpertScaffold
  /** Optional: paste a fill-in into parent field */
  onUseFillIn?: (text: string) => void
  defaultOpen?: boolean
}

/**
 * Slice 2 — collapsible expert coach for a build section.
 * Scaffolds use [brackets]; operator replaces with real facts only.
 * Accent: amber craft (not sky).
 */
export function SectionCoach({
  scaffold,
  onUseFillIn,
  defaultOpen = false,
}: Props) {
  const [open, setOpen] = useState(defaultOpen)
  const [copied, setCopied] = useState<string | null>(null)

  const copy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(id)
      window.setTimeout(() => setCopied(null), 1200)
    } catch {
      /* ignore */
    }
  }

  return (
    <div
      className={`rounded-xl border border-slate-800 bg-slate-950/40 ${
        open ? 'border-l-2 border-l-amber-600/70' : ''
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-start justify-between gap-2 px-3 py-2.5 text-left touch-manipulation"
      >
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-100">{scaffold.title}</p>
          <p className="mt-0.5 text-[11px] text-slate-500">
            Expert coach · 3-C focus:{' '}
            <span className="text-slate-400">{scaffold.threeC}</span>
            {' · '}
            {open ? 'tap to hide' : 'tap for scaffolds'}
          </p>
        </div>
        <span className="shrink-0 text-xs text-amber-400/90" aria-hidden>
          {open ? '−' : '+'}
        </span>
      </button>

      {open && (
        <div className="space-y-3 border-t border-slate-800 px-3 pb-3 pt-2">
          <p className="text-xs leading-relaxed text-slate-400">
            {scaffold.blurb}
          </p>
          <ul className="list-inside list-disc space-y-0.5 text-xs text-slate-300">
            {scaffold.checklist.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>

          {scaffold.fillIns.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Fill-in scaffolds (replace [brackets] with truth only)
              </p>
              {scaffold.fillIns.map((f) => (
                <div
                  key={f.label}
                  className="rounded-lg border border-slate-800 bg-slate-950/60 p-2"
                >
                  <p className="text-[11px] font-medium text-slate-300">
                    {f.label}
                  </p>
                  <p className="mt-1 font-mono text-[11px] leading-relaxed text-slate-400">
                    {f.text}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <CtaButton
                      className="min-h-8 text-xs"
                      onClick={() => void copy(f.label, f.text)}
                    >
                      {copied === f.label ? 'Copied ✓' : 'Copy'}
                    </CtaButton>
                    {onUseFillIn && (
                      <CtaButton
                        variant="primary"
                        className="min-h-8 text-xs"
                        onClick={() => onUseFillIn(f.text)}
                      >
                        Use scaffold
                      </CtaButton>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
